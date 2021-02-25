# FLECT Chime meeting 
This is a video conference system with amazon chime sdk. This software uses AWS as backend. If you have AWS account, it is very easy to deploy. And this software has various features such as fast and accurate virtual backgournd, noise suppression, sounde effect and BGM. And this software has features to assist video conferencing, whiteboard, text chat, recording.


# Features
- integrated with amazon cognito
- tileview
  
![tileview](https://user-images.githubusercontent.com/48346627/109093321-827ea800-775b-11eb-8b6f-120b45578876.gif)

- virtual background
  - BodyPix and GoogleMeet
  
![virtualbackground](https://user-images.githubusercontent.com/48346627/109092422-d8eae700-7759-11eb-8ea2-c1971ce35b4e.gif)

- noise suppression and SE/BGM
  - noise suppression
  
  https://www.youtube.com/watch?v=8lV4wkGrWj4



- contents sharing and white board

![whiteboard](https://user-images.githubusercontent.com/48346627/109094301-0dac6d80-775d-11eb-9fb3-c1b3a0530b49.gif)

- chat

- recording

![recorder](https://user-images.githubusercontent.com/48346627/109095121-78aa7400-775e-11eb-9ce9-9b4fd737b750.gif)

# Installation
## Prerequisite
It is assumed that AWS Credential is configured. If you have not yet done so, please refer to this page to configure it.

https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/setup-credentials.html

## Build backend
### (1) define stack name
Define the stack name for backend.
```
$ emacs backend/bin/config.ts

export const BACKEND_STACK_NAME = 'BackendStack' # <-- You should change. (*1)
export const FRONTEND_LOCAL_DEV = false          # <-- Set false for deployment.
```
(*1) This demo uses S3 bucket whose name is defined with this value. So, this value should be global unique.

### (2) build and deploy backend

```
$ cd backend
$ npm install
$ npm run build_all
```

## Build frontend
Note: frontend is depricated. Please use fontend2

### (1) build
when you run `npm run build`, you get the information of backend

```
$ cd frontend2
$ npm install
$ npm run build
```

### (2) deploy frontend
```
$ sh sync.sh
```

### (3) access to the demo
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

# Acknowledgement
## Resources
1. Images from https://www.irasutoya.com/
2. Sounds from https://otologic.jp
3. movie from https://www.youtube.com/, https://pixabay.com/ja/videos/

