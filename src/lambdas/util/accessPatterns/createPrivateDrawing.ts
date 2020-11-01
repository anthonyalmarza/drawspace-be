import drawingEntity from 'lambdas/util/entities/drawing'
import { Drawing, UpdateReturnValues } from 'types'
import ksuid from 'ksuid'

export default async ({
    id = ksuid.randomSync().string,
    title,
    thumbnailUrl,
    drawStepsUrl,
    startTime,
    endTime,
    width,
    height,
    resolution,
    user,
}: {
    id?: string
    title: string
    thumbnailUrl: string
    drawStepsUrl: string
    startTime: string
    endTime: string
    width: number
    height: number
    resolution: number
    user: string
}): Promise<Drawing> => {
    const { Attributes: drawing } = await drawingEntity.update(
        {
            id,
            title,
            thumbnailUrl,
            drawStepsUrl,
            startTime,
            endTime,
            width,
            height,
            resolution,
            user,
        },
        {
            returnValues: UpdateReturnValues.ALL_NEW,
            conditions: { attr: 'pk', exists: false },
        }
    )
    return drawing
}
