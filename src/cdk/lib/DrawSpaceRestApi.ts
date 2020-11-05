import { Construct, Fn, Stack, StackProps } from '@aws-cdk/core'

import { PolicyStatement, Effect } from '@aws-cdk/aws-iam'
import { RetentionDays } from '@aws-cdk/aws-logs'
import { Function as LambdaFunction, Code, Runtime } from '@aws-cdk/aws-lambda'
import {
    HttpApi,
    LambdaProxyIntegration,
    DomainName,
    PayloadFormatVersion,
} from '@aws-cdk/aws-apigatewayv2'
import { Certificate } from '@aws-cdk/aws-certificatemanager'
import {
    ARecord,
    HostedZone,
    RecordTarget,
    AliasRecordTargetConfig,
} from '@aws-cdk/aws-route53'

interface MultiStageStackProps extends StackProps {
    appName: string
    apexDomain: string
    subDomain: string
    allowedOrigins: string[]

    mediaSubdomain: string
    certificateArn: string
}

export default class extends Stack {
    constructor(scope: Construct, id: string, props: MultiStageStackProps) {
        super(scope, id, props)

        const {
            appName,
            apexDomain,
            subDomain,
            allowedOrigins,

            mediaSubdomain,
            certificateArn,
        } = props

        const apiLambda = new LambdaFunction(this, 'ApiFunction', {
            runtime: Runtime.NODEJS_12_X,
            handler: 'index.default',
            code: Code.fromAsset('.lambda/restApi'),
            memorySize: 768,
            // memorySize: 1024,
            logRetention: RetentionDays.ONE_MONTH,
        })

        apiLambda.addEnvironment('REGION', this.region)
        apiLambda.addEnvironment(
            'ALLOWED_ORIGINS',
            JSON.stringify(allowedOrigins)
        )

        // Cognito
        apiLambda.addEnvironment(
            'COGNITO_USER_POOL_ID',
            Fn.importValue(`${appName}CognitoUserPoolId`)
        )
        apiLambda.addEnvironment(
            'COGNITO_USER_POOL_CLIENT_ID',
            Fn.importValue(`${appName}CognitoUserPoolClientId`)
        )

        // Cloudfrount
        apiLambda.addEnvironment('MEDIA_SUBDOMAIN', mediaSubdomain)
        apiLambda.addEnvironment('APEX_DOMAIN', apexDomain)

        // DDB
        apiLambda.addEnvironment(
            'API_DDB_TABLE_NAME',
            Fn.importValue(`${appName}ApiDdbTableName`)
        )
        apiLambda.addToRolePolicy(
            new PolicyStatement({
                effect: Effect.ALLOW,
                actions: [
                    'dynamodb:BatchGetItem',
                    'dynamodb:BatchWriteItem',
                    'dynamodb:ConditionCheckItem',
                    'dynamodb:DeleteItem',
                    'dynamodb:GetItem',
                    'dynamodb:PutItem',
                    'dynamodb:Query',
                    'dynamodb:Scan',
                    'dynamodb:UpdateItem',
                ],
                resources: [
                    Fn.importValue(`${appName}ApiDdbTableArn`),
                    Fn.join('', [
                        Fn.importValue(`${appName}ApiDdbTableArn`),
                        '/index/*',
                    ]),
                ],
            })
        )

        // DNS
        const dn = new DomainName(this, 'DN', {
            domainName: `${subDomain}.${apexDomain}`,
            certificate: Certificate.fromCertificateArn(
                this,
                'cert',
                certificateArn
            ),
        })

        new HttpApi(this, 'RestApi', {
            defaultIntegration: new LambdaProxyIntegration({
                handler: apiLambda,
                payloadFormatVersion: PayloadFormatVersion.VERSION_1_0,
            }),
            defaultDomainMapping: {
                domainName: dn,
            },
        })

        const zone = HostedZone.fromLookup(this, 'SiteHostedZone', {
            domainName: apexDomain,
        })

        // RecordTargets don't yet support apigatewayv2 DomainName
        new ARecord(this, 'AliasRecord', {
            zone,
            recordName: dn.domainName,
            target: RecordTarget.fromAlias({
                bind: (): AliasRecordTargetConfig => ({
                    dnsName: dn.regionalDomainName,
                    hostedZoneId: dn.regionalHostedZoneId,
                }),
            }),
        })
    }
}
