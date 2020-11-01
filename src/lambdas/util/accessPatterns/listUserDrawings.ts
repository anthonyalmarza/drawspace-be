import drawingEntity from 'lambdas/util/entities/drawing'
import { Drawing, LastEvaluatedKey, DdbIndex } from 'types'
import { pagination } from 'lambdas/util/pagination'

type UserDrawings = {
    items: Drawing[]
    lastEvaluatedKey?: LastEvaluatedKey
}

export default async ({
    userId,
    startKey,
}: {
    userId: string
    startKey?: LastEvaluatedKey
}): Promise<UserDrawings> => {
    const {
        LastEvaluatedKey: lastEvaluatedKey,
        Items: drawings,
    } = await drawingEntity.query(`gsi2pkDrawing#${userId}`, {
        index: DdbIndex.GSI2,
        beginsWith: 'gsi2skDrawing#',
        reverse: true,
        ...(startKey ? { startKey } : {}),
    })
    return pagination<Drawing>({
        items: drawings,
        nextStartKey: lastEvaluatedKey,
    })
}
