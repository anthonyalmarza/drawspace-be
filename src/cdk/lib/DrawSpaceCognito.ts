import { Construct, Stack, StackProps, CfnOutput, Fn } from '@aws-cdk/core'
import {
    CfnUserPool,
    CfnIdentityPool,
    CfnUserPoolClient,
    CfnIdentityPoolRoleAttachment,
} from '@aws-cdk/aws-cognito'

import {
    Role,
    FederatedPrincipal,
    PolicyStatement,
    Effect,
    PolicyDocument,
} from '@aws-cdk/aws-iam'
import {
    Function as LambdaFunction,
    Code,
    Runtime,
    CfnPermission,
} from '@aws-cdk/aws-lambda'
import { RetentionDays } from '@aws-cdk/aws-logs'

interface MultiStageStackProps extends StackProps {
    sesFromAddress: string
    sesDomainSourceArn: string
    appName: string
}

export default class extends Stack {
    constructor(scope: Construct, id: string, props: MultiStageStackProps) {
        super(scope, id, props)

        const { appName, sesFromAddress, sesDomainSourceArn } = props

        const createAuthChallenge = new LambdaFunction(
            this,
            'CognitoCreateAuthChallenge',
            {
                runtime: Runtime.NODEJS_12_X,
                handler: 'index.default',
                code: Code.fromAsset('./.lambda/cognitoCreateAuthChallenge'),
                logRetention: RetentionDays.ONE_MONTH,
            }
        )
        createAuthChallenge.addEnvironment('SES_FROM_ADDRESS', sesFromAddress)
        createAuthChallenge.addEnvironment(
            'SES_DOMAIN_SOURCE_ARN',
            sesDomainSourceArn
        )
        createAuthChallenge.addToRolePolicy(
            new PolicyStatement({
                effect: Effect.ALLOW,
                actions: [
                    'ses:SendEmail',
                    'ses:SendRawEmail',
                    'ses:SendTemplatedEmail',
                ],
                resources: ['*'],
            })
        )
        const defineAuthChallenge = new LambdaFunction(
            this,
            'CognitoDefineAuthChallenge',
            {
                runtime: Runtime.NODEJS_12_X,
                handler: 'index.default',
                code: Code.fromAsset('./.lambda/cognitoDefineAuthChallenge'),
                logRetention: RetentionDays.ONE_MONTH,
            }
        )
        const preSignUp = new LambdaFunction(this, 'CognitoPreSignUp', {
            runtime: Runtime.NODEJS_12_X,
            handler: 'index.default',
            code: Code.fromAsset('./.lambda/cognitoPreSignUp'),
            logRetention: RetentionDays.ONE_MONTH,
        })
        const verifyAuthChallenge = new LambdaFunction(
            this,
            'CognitoVerifyAuthChallenge',
            {
                runtime: Runtime.NODEJS_12_X,
                handler: 'index.default',
                code: Code.fromAsset('./.lambda/cognitoVerifyAuthChallenge'),
                logRetention: RetentionDays.ONE_MONTH,
            }
        )
        verifyAuthChallenge.addEnvironment(
            'API_DDB_TABLE_NAME',
            Fn.importValue(`${appName}ApiDdbTableName`)
        )
        verifyAuthChallenge.addToRolePolicy(
            new PolicyStatement({
                effect: Effect.ALLOW,
                actions: [
                    'dynamodb:GetItem',
                    'dynamodb:PutItem',
                    'dynamodb:UpdateItem',
                ],
                resources: [Fn.importValue(`${appName}ApiDdbTableArn`)],
            })
        )

        const userPool = new CfnUserPool(this, 'UserPool', {
            usernameAttributes: ['email'],
            autoVerifiedAttributes: ['email'],
            policies: {
                passwordPolicy: {
                    minimumLength: 8,
                    requireLowercase: true,
                    requireNumbers: true,
                    requireUppercase: true,
                    requireSymbols: false,
                },
            },
            lambdaConfig: {
                createAuthChallenge: createAuthChallenge.functionArn,
                defineAuthChallenge: defineAuthChallenge.functionArn,
                preSignUp: preSignUp.functionArn,
                verifyAuthChallengeResponse: verifyAuthChallenge.functionArn,
            },
            schema: [
                {
                    attributeDataType: 'String',
                    name: 'Name',
                    // AWS::Cognito::UserPool
                    // Required custom attributes are not supported currently
                    // required: true,
                    stringAttributeConstraints: {
                        maxLength: '255',
                        minLength: '1',
                    },
                },
            ],
        })

        ;[
            createAuthChallenge,
            defineAuthChallenge,
            preSignUp,
            verifyAuthChallenge,
        ].forEach((lambdaFn) => {
            new CfnPermission(this, `${lambdaFn.node.id}ApiLambdaPermission`, {
                functionName: lambdaFn.functionName,
                action: 'lambda:InvokeFunction',
                principal: 'cognito-idp.amazonaws.com',
                sourceArn: userPool.attrArn,
            })
        })

        const userPoolClient = new CfnUserPoolClient(this, 'UserPoolClient', {
            generateSecret: false,
            userPoolId: userPool.ref,
            refreshTokenValidity: 365,
        })

        const identityPool = new CfnIdentityPool(this, 'IdentityPool', {
            allowUnauthenticatedIdentities: false,
            cognitoIdentityProviders: [
                {
                    clientId: userPoolClient.ref,
                    providerName: userPool.attrProviderName,
                },
            ],
        })

        // Unauth Role
        const unAuthPolicyDocument = new PolicyDocument()
        unAuthPolicyDocument.addStatements(
            new PolicyStatement({
                effect: Effect.ALLOW,
                actions: ['cognito-sync:*'],
                resources: ['*'],
            })
        )

        const unauthenticatedRole = new Role(
            this,
            'CognitoUnauthenticatedRole',
            {
                assumedBy: new FederatedPrincipal(
                    'cognito-identity.amazonaws.com',
                    {
                        StringEquals: {
                            'cognito-identity.amazonaws.com:aud':
                                identityPool.ref,
                        },
                        'ForAnyValue:StringLike': {
                            'cognito-identity.amazonaws.com:amr':
                                'unauthenticated',
                        },
                    },
                    'sts:AssumeRoleWithWebIdentity'
                ),
                inlinePolicies: {
                    unAuthPolicyDocument,
                },
            }
        )

        // Auth Role
        const authPolicyDocument = new PolicyDocument()
        authPolicyDocument.addStatements(
            new PolicyStatement({
                effect: Effect.ALLOW,
                actions: ['cognito-sync:*'],
                resources: ['*'],
            })
        )

        const authenticatedRole = new Role(this, 'CognitoAuthenticatedRole', {
            assumedBy: new FederatedPrincipal(
                'cognito-identity.amazonaws.com',
                {
                    StringEquals: {
                        'cognito-identity.amazonaws.com:aud': identityPool.ref,
                    },
                    'ForAnyValue:StringLike': {
                        'cognito-identity.amazonaws.com:amr': 'authenticated',
                    },
                },
                'sts:AssumeRoleWithWebIdentity'
            ),
            inlinePolicies: {
                authPolicyDocument,
            },
        })

        new CfnIdentityPoolRoleAttachment(this, 'IdentityPoolRoleAttachment', {
            identityPoolId: identityPool.ref,
            roles: {
                unauthenticated: unauthenticatedRole.roleArn,
                authenticated: authenticatedRole.roleArn,
            },
        })

        new CfnOutput(this, `${appName}CognitoUnauthRoleArn`, {
            value: unauthenticatedRole.roleArn,
            exportName: `${appName}CognitoUnauthRoleArn`,
        })
        new CfnOutput(this, `${appName}CognitoAuthRoleArn`, {
            value: authenticatedRole.roleArn,
            exportName: `${appName}CognitoAuthRoleArn`,
        })

        new CfnOutput(this, `${appName}CognitoUserPoolClientId`, {
            value: userPoolClient.ref,
            exportName: `${appName}CognitoUserPoolClientId`,
        })
        new CfnOutput(this, `${appName}CognitoUserPoolId`, {
            value: userPool.ref,
            exportName: `${appName}CognitoUserPoolId`,
        })
        new CfnOutput(this, `${appName}IdentityPoolId`, {
            value: identityPool.ref,
            exportName: `${appName}IdentityPoolId`,
        })
    }
}
