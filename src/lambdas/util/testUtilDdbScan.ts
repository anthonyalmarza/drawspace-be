import DynamoDB from 'aws-sdk/clients/dynamodb'

const { apiTableName } = require('lambdas/util/envVarsRestApi')
/* eslint-enable */
const DocumentClient = new DynamoDB.DocumentClient({
    endpoint: 'http://localhost:9001',
    accessKeyId: 'dynamo',
    secretAccessKey: 'devDummyKey',
    region: 'local',
})

export default () => DocumentClient.scan({ TableName: apiTableName }).promise()
