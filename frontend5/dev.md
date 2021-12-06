```
mkdir frontend5
cd frontend5
npm init -y
# add "homepage": "./",
# del "main": "index.js",

# NPM Install
## TS
npm install -D @types/react @types/react-dom npm-run-all typescript

## webpack
npm install -D html-webpack-plugin webpack webpack-cli webpack-dev-server

## Babel
npm install -D babel-loader @babel/core @babel/plugin-transform-runtime @babel/preset-env @babel/preset-react @babel/preset-typescript @babel/runtime

## Code formatter
npm install -D prettier eslint eslint-config-prettier eslint-plugin-prettier @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-react eslint-webpack-plugin

## DEP
npm install typescript react react-dom @material-ui/core @material-ui/icons
npm install @dannadori/flect-amazon-chime-lib @types/uuid pako qrcode.react @types/qrcode.react

# Copy Formatter Config
.eslintrc.js, .prettierrc

# TS init
npx tsc --init

# webpack.config.js



# Code
mkdir src
mkdir public
mkdir pubic/resources
```
