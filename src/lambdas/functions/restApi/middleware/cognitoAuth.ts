import { Middleware } from 'lambda-api'

import jose from 'node-jose'
import nodeAjax from 'lambdas/util/nodeAjax'
import {
    cognitoUserPoolId,
    cognitoUserPoolClientId,
    region,
} from 'lambdas/util/envVarsCognito'

const getKeyIndex = (keyCache, kid) => {
    let keyIndex = -1
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < keyCache.length; i++) {
        if (kid === keyCache[i].kid) {
            keyIndex = i
            break
        }
    }
    return keyIndex
}

let keyCache
const constructPublicKey = async (userPoolId, kid) => {
    const keysUrl = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`
    let keyIndex = -1
    if (keyCache) {
        keyIndex = getKeyIndex(keyCache, kid)
    }
    if (keyIndex === -1) {
        const { keys } = await nodeAjax({ url: keysUrl, method: 'GET' })
        keyCache = keys
        keyIndex = getKeyIndex(keyCache, kid)
        if (keyIndex === -1) {
            throw new Error('Public key not found in jwks.json')
        }
    }
    // construct the public key
    const publicKey = await jose.JWK.asKey(keyCache[keyIndex])
    return publicKey
}

const authorizeRequest = async (token) => {
    try {
        const sections = token.split('.')
        // get the kid from the headers prior to verification
        const header = jose.util.base64url.decode(sections[0])
        const { kid } = JSON.parse(header)
        const publicKey = await constructPublicKey(
            cognitoUserPoolId,
            kid,
            region
        )
        // verify the signature
        const result = await jose.JWS.createVerify(publicKey).verify(token)
        // now we can use the claims
        const parsedPayload = JSON.parse(result.payload)
        const { aud, exp, email, sub } = parsedPayload
        // additionally we can verify the token expiration
        const currentTs = Math.floor(new Date() / 1000)
        if (currentTs > exp) {
            throw new Error('Token is expired')
        }
        // and the Audience (use claims.client_id if verifying an access token)
        if (aud !== cognitoUserPoolClientId) {
            throw new Error('Token was not issued for this audience')
        }

        return {
            email,
            sub,
        }
    } catch (error) {
        throw new Error(error)
    }
}

const cognitoAuthMiddleware: Middleware = async (req, res, next) => {
    const jwt = req.headers.authorization || ''
    if (!jwt) {
        res.error(403, 'Not authorized', 'No Token')
    }
    try {
        const token = jwt.replace('JWT ', '')
        const { sub, email } = await authorizeRequest(token)
        req.user = {
            id: sub,
            email,
        }
        next()
    } catch (e) {
        res.error(403, 'Not authorized', e.message)
    }
}
export default cognitoAuthMiddleware
