import { API, HandlerFunction } from 'lambda-api'
import validateRequest from 'lambdas/functions/restApi/middleware/validateRequest'
import deleteDrawing from 'lambdas/util/accessPatterns/deleteDrawing'
import cognitoAuth from 'lambdas/functions/restApi/middleware/cognitoAuth'

const validateUrlParams = validateRequest(
    {
        drawingId: { presence: true, type: 'string' },
    },
    'params'
)

const handler: HandlerFunction = async (req, res) => {
    const { id: userId } = req.user
    const { drawingId } = req.params
    const result = await deleteDrawing({ drawingId, userId })
    res.send(result)
}

export default (api: API): void => {
    api.delete('/drawings/:drawingId', cognitoAuth, validateUrlParams, handler)
}
