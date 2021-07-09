const path = require('path');
const lib = {
    mode: 'development',
    entry: './src/flect-amazon-chime-lib.ts', // <-- (1)
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
        fallback: {
            crypto: false,
            // path: false,
            // fs: false,
        },
        // alias: {
        //     react: path.resolve(__dirname, 'node_modules', 'react')
        // },

    },
    module: {
        rules: [
            { test: /\.ts$/, loader: 'ts-loader' },
            { test: /\.tsx$/, loader: 'ts-loader' },
        ],
    },
    output: {
        filename: 'flect-amazon-chime-lib.js', // <-- (2)
        path: path.resolve(__dirname, 'dist'),
        libraryTarget: 'commonjs2',
        globalObject: 'typeof self !== \'undefined\' ? self : this'
    },
};



module.exports = [
    lib
]
