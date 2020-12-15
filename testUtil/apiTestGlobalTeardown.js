import { DynamoDB } from 'aws-sdk';

const dynamoDb = new DynamoDB({
	endpoint: 'http://localhost:9001',
	accessKeyId: 'dynamo',
	secretAccessKey: 'devDummyKey',
	region: 'local',
});

const getTables = async () => {
	const { TableNames: tableNames } = await dynamoDb.listTables({}).promise();
	return tableNames || [];
};

const deleteAllTables = (tables) => Promise.all(
	tables.map(
		(TableName) => dynamoDb.deleteTable({ TableName }).promise(),
	),
);

// Cleanup all data after test has run
module.exports = async () => {
	const tables = await getTables();
	// console.info(tables)
	await deleteAllTables(tables);
	// const tablesGone = await getTables()
	// console.info(tablesGone)
};
