# Backend Stack for FLECT Chime SDK

## Build backend
### define  stack name
$ emacs backend/bin/config.ts

export const BACKEND_STACK_NAME = 'BackendStack'
export const FRONTEND_LOCAL_DEV = false

### build and setup on aws
```
$ cd backend
$ npm install
$ npm run build_all
```

## Build frontend
```
$ cd frontend
$ npm install
$ npm run build
$ 

```


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
aws logs tail --follow  API-Gateway-Execution-Logs_gvr36meb89/prod
```