const path = require("path");

const lib = {
    mode: "production",
    //    mode: "development",
    entry: "./src/flect-amazon-chime-lib.ts",
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
        // ,
        // fallback: {
        //     crypto: false,
        //     path: false,
        //     fs: false,
        // }
    },
    module: {
        rules: [
            { test: /\.tsx$/, loader: "ts-loader" },
            { test: /\.ts$/, loader: "ts-loader" },
        ],
    },
    output: {
        filename: "flect-amazon-chime-lib.js",
        path: path.resolve(__dirname, "dist"),
        libraryTarget: "umd",
        library: "FlectChimeSDK",
        globalObject: "typeof self !== 'undefined' ? self : this",
    },
    externals: {
        react: "react",
        "react-dom": "reactDOM",
    },
};

module.exports = [lib];
