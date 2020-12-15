import https from 'https'
import http from 'http'
import is from 'ramda/src/is'
import { parse } from 'url'
import { stringify } from 'querystring'
import { AjaxParams } from 'types'

export default <TRes>({
    url,
    method,
    body,
    queryParams,
    headers = {},
    ssl = true,
}: AjaxParams): Promise<TRes> =>
    new Promise((resolve, reject) => {
        const queryString = queryParams ? `?${stringify(queryParams)}` : ''
        const jsonBody = is(Object, body) ? JSON.stringify(body) : body
        const parsedUrl = parse(url)
        const options = {
            hostname: parsedUrl.host,
            path: `${parsedUrl.path}${queryString}`,
            method: method || 'GET',
            headers: {
                ...headers,
                'Content-Type': headers['Content-Type'] || 'application/json',
            },
        }
        // console.info(options, body)
        const reqType = ssl ? https : http
        const req = reqType.request(options, (res: any) => {
            const status = res.statusCode
            let resData = ''
            res.on('data', (response: any) => {
                resData += response
            })
            res.on('end', () => {
                let parsedRes
                try {
                    parsedRes = JSON.parse(resData)
                } catch (e) {
                    // response is not json, return as text
                    parsedRes = resData
                }
                if (status >= 200 && status < 300) {
                    resolve(parsedRes)
                } else {
                    reject(parsedRes)
                }
            })
        })

        req.on('error', (e: Error) => {
            // eslint-disable-next-line no-console
            console.warn(e)
            reject(new Error('Network Error'))
        })

        if (jsonBody) {
            req.write(jsonBody)
        }
        req.end()
    })
