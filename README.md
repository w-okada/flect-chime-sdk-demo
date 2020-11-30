# FLECT Chime meeting 
This is a video conference system with amazon chime sdk and its component library. This software is based on the demo of [Chime SDK UI Component Library](https://github.com/aws/amazon-chime-sdk-component-library-react).

# Features
- integrated with amazon cognito
- virtual background
- 
<img src="resources/imgs/vbg.png" />

- chat
- white board

<img src="resources/imgs/whiteboard800-5.gif" />

# Installation
## Prerequisite
It is assumed that AWS Credential is configured. If you have not yet done so, please refer to this page to configure it.

https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/setup-credentials.html

## Build backend
### define stack name
Define the stack name for backend.
```
$ emacs backend/bin/config.ts

export const BACKEND_STACK_NAME = 'BackendStack' # <-- You should change.
export const FRONTEND_LOCAL_DEV = false          # <-- Set false for deployment.
```

### build and deploy backend

```
$ cd backend
$ npm install
$ npm run build_all
```

## Build frontend
### build
when you run `npm run build`, you get the information of backend

```
$ cd frontend
$ npm install
$ npm run build
```

### deploy frontend
```
$ sh sync.sh
```

### access to the demo
You can find URL of demo in `demo_url.txt`. Please access this URL with browser.


# Delete Stack
```
$ cdk destroy
```

# Appendix
## update cdk
```
$ sudo npm update -g aws-cdk
```
## tail Log
```
aws logs tail --follow  API-Gateway-Execution-Logs_gvrxxxx89/prod
```

