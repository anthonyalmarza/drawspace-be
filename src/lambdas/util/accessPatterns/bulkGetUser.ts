import table from 'lambdas/util/table'
import userEntity from 'lambdas/util/entities/user'

import { User } from 'types'

export default async (userIds: string[]): Promise<User[]> => {
    const { Responses: results } = await table.batchGet(
        userIds.map((userId) => userEntity.getBatch({ id: userId }))
    )
    return results[table.name]
}
