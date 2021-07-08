const path = require('path');
const lib = {
    mode: 'development',
    entry: './src/flect-amazon-chime-lib.ts', // <-- (1)
    resolve: {
        extensions: [".ts", ".js"],
        fallback: {
            crypto: false,
            path: false,
            fs: false,
        }

    },
    module: {
        rules: [
            { test: /\.ts$/, loader: 'ts-loader' },
        ],
    },
    output: {
        filename: 'flect-amazon-chime-lib.js', // <-- (2)
        path: path.resolve(__dirname, 'dist'),
        libraryTarget: 'umd',
        globalObject: 'typeof self !== \'undefined\' ? self : this'
    },
};



module.exports = [
    lib
]
