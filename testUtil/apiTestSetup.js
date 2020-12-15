import { DynamoDB } from 'aws-sdk'

jest.setTimeout(60000)

jest.mock('lambdas/util/envVarsRestApi', () => {
    /* eslint-disable global-require */
    // eslint-disable-next-line import/no-extraneous-dependencies
    const { randomSync: ksuid } = require('ksuid')
    /* eslint-enable */
    const apiTableName = `TEST_TABLE_${ksuid().string}`
    return {
        apiTableName,
    }
})

jest.mock('lambdas/util/table', () => {
    // eslint-disable-next-line global-require
    const { DynamoDB } = require('aws-sdk')
    const { Table } = require('dynamodb-toolbox')
    const { apiTableName } = require('lambdas/util/envVarsRestApi')
    /* eslint-enable */
    const DocumentClient = new DynamoDB.DocumentClient({
        endpoint: 'http://localhost:9001',
        accessKeyId: 'dynamo',
        secretAccessKey: 'devDummyKey',
        region: 'local',
    })
    return new Table({
        name: apiTableName,

        partitionKey: 'pk',
        sortKey: 'sk',

        indexes: {
            gsi1: { partitionKey: 'gsi1pk', sortKey: 'gsi1sk' },
            gsi2: { partitionKey: 'gsi2pk', sortKey: 'gsi2sk' },
        },

        DocumentClient,
    })
})

const tableParams = (tableName) => ({
    TableName: tableName,
    KeySchema: [
        { AttributeName: 'pk', KeyType: 'HASH' },
        { AttributeName: 'sk', KeyType: 'RANGE' },
    ],
    AttributeDefinitions: [
        { AttributeName: 'pk', AttributeType: 'S' },
        { AttributeName: 'sk', AttributeType: 'S' },
        { AttributeName: 'gsi1pk', AttributeType: 'S' },
        { AttributeName: 'gsi1sk', AttributeType: 'S' },
        { AttributeName: 'gsi2pk', AttributeType: 'S' },
        { AttributeName: 'gsi2sk', AttributeType: 'S' },
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1,
    },
    GlobalSecondaryIndexes: [
        {
            IndexName: 'gsi1',
            KeySchema: [
                { AttributeName: 'gsi1pk', KeyType: 'HASH' },
                { AttributeName: 'gsi1sk', KeyType: 'RANGE' },
            ],
            Projection: {
                ProjectionType: 'ALL',
            },
            ProvisionedThroughput: {
                ReadCapacityUnits: 1,
                WriteCapacityUnits: 1,
            },
        },
        {
            IndexName: 'gsi2',
            KeySchema: [
                { AttributeName: 'gsi2pk', KeyType: 'HASH' },
                { AttributeName: 'gsi2sk', KeyType: 'RANGE' },
            ],
            Projection: {
                ProjectionType: 'ALL',
            },
            ProvisionedThroughput: {
                ReadCapacityUnits: 1,
                WriteCapacityUnits: 1,
            },
        },
    ],
})

const { apiTableName } = require('lambdas/util/envVarsRestApi')

const dynamoDb = new DynamoDB({
    endpoint: 'http://localhost:9001',
    accessKeyId: 'dynamo',
    secretAccessKey: 'devDummyKey',
    region: 'local',
})

beforeAll(() => dynamoDb.createTable(tableParams(apiTableName)).promise())
