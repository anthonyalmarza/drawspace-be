declare let process: {
    env: {
        SES_FROM_ADDRESS: string
        SES_DOMAIN_SOURCE_ARN: string
    }
}

export const sesFromAddress = process.env.SES_FROM_ADDRESS
export const sesDomainSourceArn = process.env.SES_DOMAIN_SOURCE_ARN
