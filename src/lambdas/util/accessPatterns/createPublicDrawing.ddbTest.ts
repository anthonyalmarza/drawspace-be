import { advanceTo } from 'jest-date-mock'
import testUtilDdbScan from 'lambdas/util/testUtilDdbScan'

import createDrawing from 'lambdas/util/accessPatterns/createPublicDrawing'

advanceTo(new Date(2020, 5, 29, 0, 0, 0))

const mockUserId = '1234123412341234'

test('createPublicDrawing', async () => {
    const res = await createDrawing({
        id: 'mockId',
        title: 'mockTitle',
        thumbnailUrl: 'mockThumbnailUrl',
        drawStepsUrl: 'mockDrawStepsUrl',
        startTime: 'mockStartTime',
        endTime: 'mockEndTime',
        width: 1000,
        height: 1000,
        resolution: 2,
        user: mockUserId,
    })
    const scan = await testUtilDdbScan()
    expect(res).toMatchSnapshot()
    expect(scan).toMatchSnapshot()
})
