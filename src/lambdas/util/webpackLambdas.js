const webpack = require('webpack')
const { promises } = require('fs')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')

const fsPromise = promises

const lambdaWebpackConfig = {
    // mode: 'production',
    mode: 'development',
    devtool: 'source-map',
    externals: ['aws-sdk'],
    target: 'node',
    resolve: {
        extensions: ['.ts', '.js'],
        plugins: [new TsconfigPathsPlugin()],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'babel-loader',
                options: {
                    presets: [
                        [
                            '@babel/preset-env',
                            {
                                targets: {
                                    node: true,
                                },
                            },
                        ],
                        '@babel/typescript',
                    ],
                },
                exclude: /node_modules/,
            },
        ],
    },
}

const webpackPromise = (config) =>
    new Promise((resolve, reject) => {
        webpack(config, (err, stats) => {
            if (err) {
                reject(err)
            }
            const buildInfo = stats.toJson()
            if (stats.hasErrors()) {
                reject(buildInfo.errors)
            }
            resolve(buildInfo.hash)
        })
    })

const webpackLambdas = (buildFolder, entryName) =>
    webpackPromise({
        ...{
            entry: {
                [entryName]: [
                    // '@babel/polyfill',
                    // `lambda/functions//index.js`,
                    `${__dirname}/../functions/${entryName}/index.ts`,
                ],
            },
            output: {
                filename: '[name]/index.js',
                path: buildFolder,
                libraryTarget: 'commonjs2',
            },
        },
        ...lambdaWebpackConfig,
    })

const run = async () => {
    const entries = await fsPromise.readdir('./src/lambdas/functions')
    await Promise.all([
        entries.map((entry) =>
            webpackLambdas(`${__dirname}/../../../.lambda`, entry).catch(
                console.warn
            )
        ),
    ])
}

run()
