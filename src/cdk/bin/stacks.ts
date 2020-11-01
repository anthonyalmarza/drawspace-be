#!/usr/bin/env node
import 'source-map-support/register'
import { App } from '@aws-cdk/core'
import DrawSpaceCognito from 'cdk/lib/DrawSpaceCognito'
import DrawSpaceUploads from 'cdk/lib/DrawSpaceUploads'
import DrawSpaceRestApi from 'cdk/lib/DrawSpaceRestApi'
import DrawSpaceApiDb from 'cdk/lib/DrawSpaceApiDb'
import DrawSpaceWebHost from 'cdk/lib/DrawSpaceWebHost'

const app = new App()

// *************************
// Common Config
const appName = 'DrawSpace'

// *************************
// Staging Config
const stagingEnv = {
    region: 'us-east-1',
    account: '002579744807',
}
// cdk bootstrap --profile DrawSpaceStagingAdmin 002579744807/us-east-1
const stagingSesFromAddress = 'noreply@drawspace-staging.billjohnston.co'
const stagingSesDomainSourceArn =
    'arn:aws:ses:us-east-1:002579744807:identity/drawspace-staging.billjohnston.co'

const stagingCertificateArn =
    'arn:aws:acm:us-east-1:002579744807:certificate/a316e486-689c-43f8-b7f0-3f638ecb7803'

const stagingApexDomain = 'drawspace-staging.billjohnston.co'
const stagingMediaSubdomain = 'media'
const stagingApiSubdomain = 'api'

const stagingUploadAllowedOrigins = [
    'http://localhost*',
    'http://bill.wtf:8686*',
    `https://${stagingApexDomain}`,
]

const stagingApiAllowedOrigins = [
    'http://localhost:8686',
    'http://bill.wtf:8686',
    `https://${stagingApexDomain}`,
]

// *************************
// Production Config
const productionEnv = {
    region: 'us-east-1',
    account: '111111111111',
}
// cdk bootstrap --profile DrawSpaceProductionAdmin 111111111111/us-east-1
const productionSesFromAddress = 'CHANGE_ME'
const productionSesDomainSourceArn = 'CHANGE_ME'

const productionCertificateArn = 'CHANGE_ME'

const productionApexDomain = 'CHANGE_ME'
const productionMediaSubdomain = 'CHANGE_ME'
const productionApiSubdomain = 'CHANGE_ME'

const productionUploadAllowedOrigins = ['CHANGE_ME']

const productionApiAllowedOrigins = ['CHANGE_ME', 'CHANGE_ME']

// Stacks *************************
// DDB
new DrawSpaceApiDb(app, 'DrawSpaceApiDbStaging', {
    env: stagingEnv,
    tags: {
        Stack: 'DrawSpaceApiDbStaging',
    },
    appName,
})
new DrawSpaceApiDb(app, 'DrawSpaceApiDbProduction', {
    env: productionEnv,
    tags: {
        Stack: 'DrawSpaceApiDbProduction',
    },
    appName,
})

// Cognito
new DrawSpaceCognito(app, 'DrawSpaceCognitoStaging', {
    env: stagingEnv,
    tags: {
        Stack: 'DrawSpaceCognitoStaging',
    },
    appName,
    sesFromAddress: stagingSesFromAddress,
    sesDomainSourceArn: stagingSesDomainSourceArn,
})
new DrawSpaceCognito(app, 'DrawSpaceCognitoProduction', {
    env: productionEnv,
    tags: {
        Stack: 'DrawSpaceCognitoProduction',
    },
    appName,
    sesFromAddress: productionSesFromAddress,
    sesDomainSourceArn: productionSesDomainSourceArn,
})

// Uploads
new DrawSpaceUploads(app, 'DrawSpaceUploadsStaging', {
    env: stagingEnv,
    tags: {
        Stack: 'DrawSpaceUploadsStaging',
    },
    appName,
    allowedOrigins: stagingUploadAllowedOrigins,
})
new DrawSpaceUploads(app, 'DrawSpaceUploadsProduction', {
    env: productionEnv,
    tags: {
        Stack: 'DrawSpaceUploadsProduction',
    },
    appName,
    allowedOrigins: productionUploadAllowedOrigins,
})

// Rest Api
new DrawSpaceRestApi(app, 'DrawSpaceRestApiStaging', {
    env: stagingEnv,
    tags: {
        Stack: 'DrawSpaceRestApiStaging',
    },
    appName,
    apexDomain: stagingApexDomain,
    subDomain: stagingApiSubdomain,
    allowedOrigins: stagingApiAllowedOrigins,

    mediaSubdomain: stagingMediaSubdomain,
    certificateArn: stagingCertificateArn,
})
new DrawSpaceRestApi(app, 'DrawSpaceRestApiProduction', {
    env: productionEnv,
    tags: {
        Stack: 'DrawSpaceRestApiProduction',
    },
    appName,
    apexDomain: productionApexDomain,
    subDomain: productionApiSubdomain,
    allowedOrigins: productionApiAllowedOrigins,

    mediaSubdomain: productionMediaSubdomain,
    certificateArn: productionCertificateArn,
})

// Web Host
new DrawSpaceWebHost(app, 'DrawSpaceWebHostStaging', {
    env: stagingEnv,
    tags: {
        Stack: 'DrawSpaceWebHostStaging',
    },
    apexDomain: stagingApexDomain,
    certificateArn: stagingCertificateArn,
})
new DrawSpaceWebHost(app, 'DrawSpaceWebHostProduction', {
    env: productionEnv,
    tags: {
        Stack: 'DrawSpaceWebHostProduction',
    },
    apexDomain: productionApexDomain,
    certificateArn: productionCertificateArn,
})
