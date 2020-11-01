import { API, Request, Response } from 'lambda-api'

const handler = async (req: Request, res: Response) => {
    res.send(200)
}

export default (api: API): void => {
    api.get('/health-check', handler)
}
