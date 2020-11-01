declare let process: {
    env: {
        API_DDB_TABLE_NAME: string
    }
}

export const apiTableName = process.env.API_DDB_TABLE_NAME
