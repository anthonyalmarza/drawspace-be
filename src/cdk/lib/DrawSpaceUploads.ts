import { Stack, Construct, StackProps, CfnOutput, Fn } from '@aws-cdk/core'
// import { LayerVersion, Code, Runtime } from '@aws-cdk/aws-lambda';
import { Role, PolicyStatement, Effect } from '@aws-cdk/aws-iam'
import { Bucket, HttpMethods } from '@aws-cdk/aws-s3'

interface MultiStageStackProps extends StackProps {
    appName: string
    allowedOrigins: string[]
}

export default class extends Stack {
    constructor(scope: Construct, id: string, props: MultiStageStackProps) {
        super(scope, id, props)

        const { appName, allowedOrigins } = props

        const uploadBucket = new Bucket(this, `${id}Upload`, {
            cors: [
                {
                    allowedHeaders: ['*'],
                    allowedMethods: [
                        HttpMethods.POST,
                        HttpMethods.PUT,
                        HttpMethods.DELETE,
                        HttpMethods.HEAD,
                        HttpMethods.GET,
                    ],
                    allowedOrigins,
                    maxAge: 3000,
                    exposedHeaders: ['ETag'],
                },
            ],
        })

        const authRole = Role.fromRoleArn(
            this,
            'AuthRole',
            Fn.importValue(`${appName}CognitoAuthRoleArn`)
        )

        const UnAuthRole = Role.fromRoleArn(
            this,
            'UnAuthRole',
            Fn.importValue(`${appName}CognitoUnauthRoleArn`)
        )

        authRole.addToPrincipalPolicy(
            new PolicyStatement({
                effect: Effect.ALLOW,
                actions: [
                    's3:PutObject',
                    's3:ListBucket',
                    's3:AbortMultipartUpload',
                    's3:ListMultipartUploadParts',
                    's3:ListBucketMultipartUploads',
                ],
                resources: [
                    uploadBucket.arnForObjects(
                        // eslint-disable-next-line no-template-curly-in-string
                        'public/${cognito-identity.amazonaws.com:sub}/*'
                    ),
                ],
            })
        )

        const publicPolicy = new PolicyStatement({
            effect: Effect.ALLOW,
            actions: ['s3:GetObject'],
            resources: [uploadBucket.arnForObjects('public/*')],
        })
        authRole.addToPrincipalPolicy(publicPolicy)
        UnAuthRole.addToPrincipalPolicy(publicPolicy)

        new CfnOutput(this, `${appName}UploadBucket`, {
            value: uploadBucket.bucketArn,
            exportName: `${appName}UploadBucket`,
        })
    }
}
