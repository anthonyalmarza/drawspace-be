import { Stack, Construct, StackProps } from '@aws-cdk/core'
import {
    CloudFrontWebDistribution,
    OriginAccessIdentity,
    SecurityPolicyProtocol,
    SSLMethod,
} from '@aws-cdk/aws-cloudfront'

import { Bucket, BucketAccessControl } from '@aws-cdk/aws-s3'
import { ARecord, HostedZone, RecordTarget } from '@aws-cdk/aws-route53'
import { CloudFrontTarget } from '@aws-cdk/aws-route53-targets'

interface WebHostProps extends StackProps {
    apexDomain: string
    subDomain?: string
    certificateArn: string
}

export default class extends Stack {
    constructor(scope: Construct, id: string, props: WebHostProps) {
        super(scope, id, props)

        const { apexDomain, certificateArn } = props
        let domainName = apexDomain
        if ('subDomain' in props) {
            const { subDomain } = props
            domainName = `${subDomain}.${apexDomain}`
        }

        const zone = HostedZone.fromLookup(this, 'SiteHostedZone', {
            domainName: apexDomain,
        })

        // Content bucket
        const bucket = new Bucket(this, 'Content', {
            publicReadAccess: false,
            accessControl: BucketAccessControl.PRIVATE,
        })

        const s3OriginAccessIdentity = new OriginAccessIdentity(
            this,
            'SiteOriginAccessIdentity'
        )

        bucket.grantRead(s3OriginAccessIdentity)

        const distribution = new CloudFrontWebDistribution(
            this,
            'Distribution',
            {
                aliasConfiguration: {
                    acmCertRef: certificateArn,
                    names: [domainName],
                    sslMethod: SSLMethod.SNI,
                    securityPolicy: SecurityPolicyProtocol.TLS_V1_1_2016,
                },
                originConfigs: [
                    {
                        behaviors: [
                            {
                                isDefaultBehavior: true,
                            },
                        ],
                        s3OriginSource: {
                            s3BucketSource: bucket,
                            originAccessIdentity: s3OriginAccessIdentity,
                        },
                    },
                ],
                defaultRootObject: 'index.html',
                errorConfigurations: [
                    {
                        errorCode: 404,
                        responsePagePath: '/404.html',
                        responseCode: 200,
                        errorCachingMinTtl: 30,
                    },
                ],
            }
        )

        new ARecord(this, 'SiteAliasRecord', {
            recordName: domainName,
            target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
            zone,
        })
    }
}
