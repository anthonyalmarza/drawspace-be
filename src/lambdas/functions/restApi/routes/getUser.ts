import { API, HandlerFunction } from 'lambda-api'
import validateRequest from 'lambdas/functions/restApi/middleware/validateRequest'
import getUser from 'lambdas/util/accessPatterns/getUser'

const validteUrlParams = validateRequest(
    {
        userId: { presence: true, type: 'string' },
    },
    'params'
)

const handler: HandlerFunction = async (req, res) => {
    const { userId } = req.params
    const result = await getUser(userId)
    res.send(result)
}

export default (api: API): void => {
    api.get('/users/:userId', validteUrlParams, handler)
}
