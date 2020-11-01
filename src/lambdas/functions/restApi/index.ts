import lambdaApi from 'lambda-api'

import healthCheck from 'lambdas/functions/restApi/routes/healthCheck'
import createDrawing from 'lambdas/functions/restApi/routes/createDrawing'
import deleteDrawing from 'lambdas/functions/restApi/routes/deleteDrawing'
import getDrawing from 'lambdas/functions/restApi/routes/getDrawing'
import getUser from 'lambdas/functions/restApi/routes/getUser'
import listPublicDrawings from 'lambdas/functions/restApi/routes/listPublicDrawings'
import listUserDrawings from 'lambdas/functions/restApi/routes/listUserDrawings'
import { allowedOrigins } from 'lambdas/functions/restApi/envVars'

import { APIGatewayProxyHandler } from 'aws-lambda'

const api = lambdaApi({
    errorHeaderWhitelist: [
        'access-control-allow-origin',
        'access-control-allow-methods',
        'access-control-allow-headers',
    ],
})

// CORS
api.use((req, res, next) => {
    const { origin: requestOrigin = '' } = req.headers
    const matchedOrigin = allowedOrigins.find(
        (allowedOrigin: string) => allowedOrigin.indexOf(requestOrigin) !== -1
    )
    res.cors({
        origin: matchedOrigin,
    })
    next()
})
api.options('/*', (req, res) => {
    res.status(200).json({})
})

api.register(healthCheck)
api.register(createDrawing, { prefix: '/v1' })
api.register(deleteDrawing, { prefix: '/v1' })
api.register(getDrawing, { prefix: '/v1' })
api.register(getUser, { prefix: '/v1' })
api.register(healthCheck, { prefix: '/v1' })
api.register(listPublicDrawings, { prefix: '/v1' })
api.register(listUserDrawings, { prefix: '/v1' })

// eslint-disable-next-line arrow-body-style
const handler: APIGatewayProxyHandler = async (event, context) => {
    // For httpapi payload v2
    /* eslint-disable no-param-reassign */
    // event.path = event.rawPath;
    // event.httpMethod = event.requestContext.http.method;
    /* eslint-enable */
    return api.run(event, context)
}

export default handler
