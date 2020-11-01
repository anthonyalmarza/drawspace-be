import { advanceTo } from 'jest-date-mock'
import testUtilDdbScan from 'lambdas/util/testUtilDdbScan'

import createUser from 'lambdas/util/accessPatterns/createUser'

advanceTo(new Date(2020, 5, 29, 0, 0, 0))

const mockUserId = '1234123412341234'

test('createUser', async () => {
    const res = await createUser({ userId: mockUserId, name: 'mock user name' })
    const scan = await testUtilDdbScan()
    expect(res).toMatchSnapshot()
    expect(scan).toMatchSnapshot()
})
