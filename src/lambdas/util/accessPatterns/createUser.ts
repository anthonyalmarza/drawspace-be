import userEntity from 'lambdas/util/entities/user'
import { User, UpdateReturnValues } from 'types'

export default async ({
    userId,
    name,
}: {
    userId: string
    name: string
}): Promise<User> => {
    const { Attributes: user } = await userEntity.update(
        { id: userId, name },
        {
            returnValues: UpdateReturnValues.ALL_NEW,
            conditions: { attr: 'pk', exists: false },
        }
    )
    return user
}
