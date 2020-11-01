import { async as validateAsync } from 'validate.js'
import { Middleware } from 'lambda-api'

export default (
    schema: Record<string, unknown>,
    requestPath: 'body' | 'query' | 'params'
): Middleware => async (req, res, next) => {
    try {
        await validateAsync(req[requestPath], schema)
        next()
    } catch (e) {
        res.error(400, e)
    }
}
