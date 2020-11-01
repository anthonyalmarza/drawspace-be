import { API, HandlerFunction } from 'lambda-api'
import cognitoAuth from 'lambdas/functions/restApi/middleware/cognitoAuth'
import validateRequest from 'lambdas/functions/restApi/middleware/validateRequest'
import listUserDrawings from 'lambdas/util/accessPatterns/listUserDrawings'
import { parseStartKey } from 'lambdas/util/pagination'

const validateQueryParams = validateRequest(
    {
        startKey: { type: 'string' },
    },
    'query'
)

const validateUrlParams = validateRequest(
    {
        userId: { presence: true, type: 'string' },
    },
    'params'
)

const handler: HandlerFunction = async (req, res) => {
    const { startKey: b64StartKey } = req.query
    const { userId } = req.params
    const parsedStartKey = parseStartKey(b64StartKey)
    const result = await listUserDrawings({
        userId,
        startKey: parsedStartKey,
    })
    res.send(result)
}

export default (api: API): void => {
    api.get(
        '/users/:userId/drawings',
        cognitoAuth,
        validateUrlParams,
        validateQueryParams,
        handler
    )
}
