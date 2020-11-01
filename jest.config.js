module.exports = {
	projects: [
		{
			displayName: 'js',
			testMatch: [
				'<rootDir>/**/*.test.ts',
			],
		},
		{
			displayName: 'ddb',
			testMatch: [
				'<rootDir>/**/*ddbTest.ts',
			],
			globalSetup: '<rootDir>/testUtil/apiTestGlobalSetup.js',
			globalTeardown: '<rootDir>/testUtil/apiTestGlobalTeardown.js',
			setupFiles: ['jest-date-mock'],
			setupFilesAfterEnv: ['<rootDir>/testUtil/apiTestSetup.js'],
		},
	],
};
