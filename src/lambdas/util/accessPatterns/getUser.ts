import userEntity from 'lambdas/util/entities/user'
import { User } from 'types'

export default async (userId: string): Promise<User> => {
    const { Item: user } = await userEntity.get({ id: userId })
    return user
}
