import drawingEntity from 'lambdas/util/entities/drawing'
import { Drawing } from 'types'

export default async (drawingId: string): Promise<Drawing> => {
    const { Item: drawing } = await drawingEntity.get({ id: drawingId })
    return drawing
}
