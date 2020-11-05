import { CloudFrontRequestHandler } from 'aws-lambda'
import { URL } from 'url'
import path from 'path'

/* eslint-disable no-param-reassign */
const verifyAuthChallengeHandler: CloudFrontRequestHandler = (
    event,
    context,
    callback
) => {
    const { request } = event.Records[0].cf

    console.log(`Old URI: ${request.uri}`)

    if (request.uri === '/' || request.uri === '') {
        request.uri = '/index.html'
    } else {
        const { pathname } = new URL(`http://x.com${request.uri}`)
        if (!path.extname(pathname)) {
            const newuri = `${pathname.replace(/\/$/, '')}.html`
            request.uri = newuri
        }
    }

    console.log(`New URI: ${request.uri}`)

    return callback(null, request)
}

export default verifyAuthChallengeHandler
