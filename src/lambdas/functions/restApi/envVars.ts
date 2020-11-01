declare let process: {
    env: {
        ALLOWED_ORIGINS: string
    }
}

// eslint-disable-next-line import/prefer-default-export
export const allowedOrigins = JSON.parse(process.env.ALLOWED_ORIGINS)
