import validateRequest from 'lambdas/functions/restApi/middleware/validateRequest'

const testSchema = {
    username: {
        presence: true,
        exclusion: {
            message: "'%{value}' is not allowed",
        },
    },
    password: {
        presence: true,
        length: {
            minimum: 6,
            message: 'must be at least 6 characters',
        },
    },
}

const testResponse = {
    error: jest.fn(),
}

const testRequestBad = {
    body: {
        password: 'bad',
    },
}

const testRequestGood = {
    body: {
        password: 'goodgoood',
        username: 'asdfasdf',
    },
}

const mockNext = jest.fn()

test('validateRequest success', async () => {
    await validateRequest(testSchema, 'body')(
        testRequestGood,
        testResponse,
        mockNext
    )
    expect(mockNext).toHaveBeenCalled()
})

test('validateRequest failure', async () => {
    await validateRequest(testSchema, 'body')(
        testRequestBad,
        testResponse,
        mockNext
    )
    expect(testResponse.error).toHaveBeenCalledWith(400, {
        password: ['Password must be at least 6 characters'],
        username: ["Username can't be blank"],
    })
})
