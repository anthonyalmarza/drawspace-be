import { API, HandlerFunction } from 'lambda-api'
import validateRequest from 'lambdas/functions/restApi/middleware/validateRequest'
import getDrawing from 'lambdas/util/accessPatterns/getDrawing'

const validteUrlParams = validateRequest(
    {
        drawingId: { presence: true, type: 'string' },
    },
    'params'
)

const handler: HandlerFunction = async (req, res) => {
    const { drawingId } = req.params
    const result = await getDrawing(drawingId)
    res.send(result)
}

export default (api: API): void => {
    api.get('/drawings/:drawingId', validteUrlParams, handler)
}
