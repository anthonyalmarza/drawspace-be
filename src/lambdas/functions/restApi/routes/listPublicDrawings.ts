import { API, HandlerFunction } from 'lambda-api'
import validateRequest from 'lambdas/functions/restApi/middleware/validateRequest'
import listPublicDrawings from 'lambdas/util/accessPatterns/listPublicDrawings'
import { parseStartKey } from 'lambdas/util/pagination'

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
    return res
}

export default (api: API): void => {
    api.get('/drawings', validate, handler)
}
