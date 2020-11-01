import { Table } from 'dynamodb-toolbox'
import DynamoDB from 'aws-sdk/clients/dynamodb'

import { apiTableName } from 'lambdas/util/envVarsRestApi'

const DocumentClient = new DynamoDB.DocumentClient()

// Instantiate a table
export default new Table({
    // Specify table name (used by DynamoDB)
    name: apiTableName,

    // Define partition and sort keys
    partitionKey: 'pk',
    sortKey: 'sk',

    indexes: {
        gsi1: { partitionKey: 'gsi1pk', sortKey: 'gsi1sk' },
        gsi2: { partitionKey: 'gsi2pk', sortKey: 'gsi2sk' },
    },

    // Add the DocumentClient
    DocumentClient,
})
