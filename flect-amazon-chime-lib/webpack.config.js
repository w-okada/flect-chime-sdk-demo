const path = require('path');

const lib = {
    mode: 'production',
    entry: './src/flect-amazon-chime-lib.ts',
    resolve: {
        extensions: [".tsx", ".ts", ".js"]
        // ,
        // fallback: {
        //     crypto: false,
        //     path: false,
        //     fs: false,
        // }

    },
    module: {
        rules: [   
            { test: /\.tsx$/, loader: 'ts-loader' },
            { test: /\.ts$/, loader: 'ts-loader' },
        ],
    },
    output: {
        filename: 'flect-amazon-chime-lib.js', // <-- (2)
        path: path.resolve(__dirname, 'dist'),
        libraryTarget: 'umd',
        library:"FlectChimeSDK",
        globalObject: 'typeof self !== \'undefined\' ? self : this'
    },
    externals: {
        'react': 'react',
        'react-dom': 'reactDOM',
        // '@dannadori/bodypix-worker-js':'@dannadori/bodypix-worker-js',
        // '@dannadori/googlemeet-segmentation-worker-js':'@dannadori/googlemeet-segmentation-worker-js',
        // '@dannadori/googlemeet-segmentation-tflite-worker-js':'@dannadori/googlemeet-segmentation-tflite-worker-js',
        // '@ffmpeg/core':'@ffmpeg/core',
        // '@ffmpeg/ffmpeg':'@ffmpeg/ffmpeg',
        // '@material-ui/core':'@material-ui/core',
        // 'amazon-chime-sdk-js':'amazon-chime-sdk-js',
        // 'amazon-cognito-identity-js':'amazon-cognito-identity-js',
        // 'async-lock':'async-lock',
        // 'pako':'pako',
        // 'uuid':'uuid',
    }
};



module.exports = [lib]
