import { advanceTo } from 'jest-date-mock'
import testUtilDdbScan from 'lambdas/util/testUtilDdbScan'
import createPrivateDrawing from 'lambdas/util/accessPatterns/createPrivateDrawing'
import createPublicDrawing from 'lambdas/util/accessPatterns/createPublicDrawing'
import createUser from 'lambdas/util/accessPatterns/createUser'
import listUserDrawings from 'lambdas/util/accessPatterns/listUserDrawings'

advanceTo(new Date(2020, 5, 29, 0, 0, 0))

const mockUserId = '1234123412341234'

test('listUserDrawings', async () => {
    const drawingMockCommon = {
        title: 'mockTitle',
        thumbnailUrl: 'mockThumbnailUrl',
        drawStepsUrl: 'mockDrawStepsUrl',
        startTime: 'mockStartTime',
        endTime: 'mockEndTime',
        width: 1000,
        height: 1000,
        resolution: 2,
        user: mockUserId,
    }
    await createUser({ userId: mockUserId, name: 'mock user name' })
    await Promise.all(
        Array.from({ length: 4 }, (x, i) =>
            Promise.all([
                createPrivateDrawing({
                    id: `mockId${i}Private`,
                    ...drawingMockCommon,
                }),
                createPublicDrawing({
                    id: `mockId${i}Public`,
                    ...drawingMockCommon,
                }),
            ])
        )
    )

    const res = await listUserDrawings(mockUserId)
    const scan = await testUtilDdbScan()
    expect(res).toMatchSnapshot()
    expect(scan).toMatchSnapshot()
})
