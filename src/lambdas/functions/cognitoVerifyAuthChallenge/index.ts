import { VerifyAuthChallengeResponseTriggerHandler } from 'aws-lambda'
import createUser from 'lambdas/util/accessPatterns/createUser'

/* eslint-disable no-param-reassign */
const verifyAuthChallengeHandler: VerifyAuthChallengeResponseTriggerHandler = async (
    event
) => {
    const expectedAnswer =
        event.request.privateChallengeParameters.secretLoginCode
    if (event.request.challengeAnswer === expectedAnswer) {
        try {
            const { sub } = event.request.userAttributes
            const name = event.request.userAttributes['custom:Name']
            console.log(event.request.userAttributes)
            await createUser({ userId: sub, name })
        } catch (e) {
            if (e.code !== 'ConditionalCheckFailedException') {
                throw e
            }
        }
        event.response.answerCorrect = true
    } else {
        event.response.answerCorrect = false
    }
    return event
}
/* eslint-enable */

export default verifyAuthChallengeHandler
