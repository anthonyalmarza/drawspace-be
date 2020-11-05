import { API, HandlerFunction } from 'lambda-api'
import validateRequest from 'lambdas/functions/restApi/middleware/validateRequest'
import listPublicDrawings from 'lambdas/util/accessPatterns/listPublicDrawings'
import bulkGetUser from 'lambdas/util/accessPatterns/bulkGetUser'
import { parseStartKey } from 'lambdas/util/pagination'
import { User } from 'types'

const validate = validateRequest(
    {
        startKey: { type: 'string' },
    },
    'query'
)

const handler: HandlerFunction = async (req) => {
    const { startKey: b64StartKey } = req.query
    const parsedStartKey = parseStartKey(b64StartKey)
    const res = await listPublicDrawings(parsedStartKey)
    const bulkUsers = res.items.reduce((acc, { user }) => {
        acc.add(user)
        return acc
    }, new Set<string>())
    const users = await bulkGetUser([...bulkUsers])
    const usersById = users.reduce<{ [key: string]: User }>(
        (acc, user) => ({
            [user.id]: user,
            ...acc,
        }),
        {}
    )
    return {
        items: res.items.map((drawing) => ({
            ...drawing,
            user: usersById[drawing.user],
        })),
    }
}

export default (api: API): void => {
    api.get('/drawings', validate, handler)
}
