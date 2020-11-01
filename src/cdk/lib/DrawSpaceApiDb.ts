import { Construct, Stack, StackProps, CfnOutput } from '@aws-cdk/core'
import {
    Table,
    BillingMode,
    AttributeType,
    StreamViewType,
} from '@aws-cdk/aws-dynamodb'
// import { Function as LambdaFn } from '@aws-cdk/aws-lambda';
// import { Queue } from '@aws-cdk/aws-sqs';
// import { DynamoEventSource, SqsDlq } from '@aws-cdk/aws-lambda-event-sources';

interface MultiStageStackProps extends StackProps {
    appName: string
}

export default class extends Stack {
    constructor(scope: Construct, id: string, props: MultiStageStackProps) {
        super(scope, id, props)

        const { appName } = props

        const apiTable = new Table(this, 'ApiTable', {
            partitionKey: {
                name: 'pk',
                type: AttributeType.STRING,
            },
            sortKey: {
                name: 'sk',
                type: AttributeType.STRING,
            },
            billingMode: BillingMode.PAY_PER_REQUEST,
            stream: StreamViewType.NEW_IMAGE,
        })
        apiTable.addGlobalSecondaryIndex({
            indexName: 'gsi1',
            partitionKey: {
                name: 'gsi1pk',
                type: AttributeType.STRING,
            },
            sortKey: {
                name: 'gsi1sk',
                type: AttributeType.STRING,
            },
        })
        apiTable.addGlobalSecondaryIndex({
            indexName: 'gsi2',
            partitionKey: {
                name: 'gsi2pk',
                type: AttributeType.STRING,
            },
            sortKey: {
                name: 'gsi2sk',
                type: AttributeType.STRING,
            },
        })

        // const deadLetterQueue = new Queue(this, 'ApiDdbStreamDlq');

        // const apiStreamLambda = new LambdaFn(this, 'ApiDdbStream', {

        // });

        // apiStreamLambda.addEventSource(
        // 	new DynamoEventSource(table, {
        // 		startingPosition: lambda.StartingPosition.TRIM_HORIZON,
        // 		batchSize: 10,
        // 		bisectBatchOnError: true,
        // 		onFailure: new SqsDlq(deadLetterQueue),
        // 		retryAttempts: 10,
        // 	}),
        // );

        new CfnOutput(this, `${appName}ApiDdbTableName`, {
            value: apiTable.tableName,
            exportName: `${appName}ApiDdbTableName`,
        })

        new CfnOutput(this, `${appName}ApiDdbTableArn`, {
            value: apiTable.tableArn,
            exportName: `${appName}ApiDdbTableArn`,
        })
    }
}
