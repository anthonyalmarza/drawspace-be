import { PreSignUpTriggerHandler } from 'aws-lambda'

/* eslint-disable no-param-reassign */
const preSignUpHandler: PreSignUpTriggerHandler = async (event) => {
    event.response.autoConfirmUser = true
    event.response.autoVerifyEmail = true
    return event
}
/* eslint-enable */

export default preSignUpHandler
