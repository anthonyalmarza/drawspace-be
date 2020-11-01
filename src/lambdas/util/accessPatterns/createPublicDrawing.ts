import drawingEntity from 'lambdas/util/entities/drawing'
import { Drawing, UpdateReturnValues } from 'types'
import ksuid from 'ksuid'
import dayjs from 'dayjs'

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
    const dayjsNow = dayjs()
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
            published: dayjsNow.toISOString(),
            gsi1pk: dayjsNow.format('YYYY-MM'),
            gsi1sk: dayjsNow.toISOString(),
        },
        {
            returnValues: UpdateReturnValues.ALL_NEW,
            conditions: { attr: 'pk', exists: false },
        }
    )
    return drawing
}
