import { LastEvaluatedKey } from 'types'

export const pagination = <TEntity>({
    items,
    nextStartKey,
}: {
    items: TEntity[]
    nextStartKey?: LastEvaluatedKey
}): { items: TEntity[]; nextStartKey?: string } => ({
    items,
    nextStartKey: nextStartKey
        ? Buffer.from(JSON.stringify(nextStartKey)).toString('base64')
        : undefined,
})

export const parseStartKey = (
    b64StartKey?: string
): LastEvaluatedKey | undefined =>
    b64StartKey
        ? JSON.parse(Buffer.from(b64StartKey, 'base64').toString('ascii'))
        : undefined
