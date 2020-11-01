import { API, HandlerFunction } from 'lambda-api'
import cognitoAuth from 'lambdas/functions/restApi/middleware/cognitoAuth'
import createPublicDrawing from 'lambdas/util/accessPatterns/createPublicDrawing'
import createPrivateDrawing from 'lambdas/util/accessPatterns/createPrivateDrawing'
import validateRequest from 'lambdas/functions/restApi/middleware/validateRequest'

const validate = validateRequest(
    {
        title: { type: 'string', presence: true, length: { maximum: 255 } },
        thumbnailUrl: {
            type: 'string',
            presence: true,
            length: { maximum: 255 },
        },
        drawStepsUrl: {
            type: 'string',
            presence: true,
            length: { maximum: 255 },
        },
        startTime: { type: 'string', presence: true, length: { maximum: 27 } },
        endTime: { type: 'string', presence: true, length: { maximum: 27 } },
        width: { type: 'integer', presence: true },
        height: { type: 'integer', presence: true },
        resolution: { type: 'integer', presence: true },
        publish: { type: 'boolean', presence: true },
    },
    'body'
)

const handler: HandlerFunction = async (req) => {
    const { user, body } = req
    const { publish, ...rest } = body

    const params = { user: user.id, ...rest }
    let newDrawing
    if (publish) {
        newDrawing = await createPublicDrawing(params)
    } else {
        newDrawing = await createPrivateDrawing(params)
    }
    return newDrawing
}

export default (api: API): void => {
    api.post('/drawings', cognitoAuth, validate, handler)
}
