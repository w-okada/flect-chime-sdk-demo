# FLECT Amazon Chime SDK for Javascript Demo
This is a demo video conference system with Amazon Chime SDK for Javascript. 

This demo has the basic features to do video conference, such as opening meeting room, listing them up, joining the room, and chatting. In addition to these, it has more advanced features.

This software is constructed on AWS services. All aws components used in this demo is defined by CDK. So, only if you have AWS account, it is very easy to deploy. 

# Features
## User Management
This demo is integrated with Amazon Cognito User Pool.

## Virtual Background
You can hide your background with virtual background. Currently background blur is implemented. Background replacement is not implemented yet.

![ezgif-5-93159e557b](https://user-images.githubusercontent.com/48346627/175192189-17ba2411-e20f-48d8-a2e7-a39e140d3dba.gif)


## Light Center Stage
This demo provide the feature of light version of Center Stage. This feature need no special device to do that. Only use normal web camera.

![ezgif-3-c31fdaacf1](https://user-images.githubusercontent.com/48346627/175162212-7070bd5d-aae6-442c-8755-00b6892ee3fb.gif)

## Noise Suppression  
This demo use the noise suppression feature provided from Amazon Chime SDK for Javascript. This have great performance.

## Chat
This demo use the Amazon Chime Messaging API to implement chat feature and notification feature.

## Recording(not implemented yet)
In this version, recording is not implemented.


# Setup and Deploy

## Prerequisite
### (1) OS
This software is developed on the Linux(debian) and WSL2(ubuntu) of Windows. And I have never tried to deploy with Windows native command line interface and MacOS. This software is not OS dependent but Linux or WSL2(ubuntu) is strongly recommended.

### (2) setup AWS Credential
It is assumed that AWS Credential is configured. If you have not yet done, please refer to [this official document](https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/setup-credentials.html) to configure it.

### (3) install AWS CLI
You can know how to install AWS CLI on the official document.

[For Linux](https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/install-cliv2-linux.html)

[For Windows](https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/install-cliv2-windows.html)

### (4) install node
You can know how to install node on [the official document](https://nodejs.org/en/).

### (5) install docker 
You can know how to install docker on [the official document](https://docs.docker.com/engine/install/).

### (6) Create Service-Linked Role (optional)
If you use live transcription, setup the iam. Detail is [here](https://docs.aws.amazon.com/chime/latest/ag/using-service-linked-roles-transcription.html)

```
aws iam create-service-linked-role --aws-service-name transcription.chime.amazonaws.com
```
## Clone and Setup
Clone this repository and setup the aws stack name for backend. This sample commands use emacs as editor but you can use other editor.
```
$ git clone https://github.com/w-okada/flect-chime-sdk-demo.git --depth 1
$ cd flect-chime-sdk-demo/
$ emacs backend2/bin/config.ts
```

In `backend2/bin/config.ts`, you must set the aws stack name for backend at `BACKEND_STACK_NAME`. This name is used for prefix of S3 backet name, `<stack name>-bucket`. So, this value should be global unique.
```
export const BACKEND_STACK_NAME = "xxxx-xxxx-xxx-xxxx";
```
## Deploy backend
In backend2 folder, install the npm packages and build the CDK resource then deploy.
```
$ cd backend2/
$ npm install
$ npm run build_all
```

## Build frontend and deploy
Note: frontend and fontend1-6 are depricated. Please use frontend7

In frontend7 folder, install the npm packages and build the frontend then deploy.
```
$ cd frontend7/
$ npm install
$ npm run build
$ sh sync.sh
```

## Access to the demo
The demo's URL is described in demo_url.txt.
```
$ cat demo_url.txt
```
You can access the URL showed in terminal, and use demo.

# Usage

## Sign up, Sign in
![image](https://user-images.githubusercontent.com/48346627/175207488-167d566d-667d-4988-931f-75f41eb73392.png)

At first, you should sign up. Enter the email address and the password you will used. Then Click enter and you'll get verification code. Verify your code in verify dialog. Verification is succeeded, you can signin. When you sign in, you should input the username you'll use in the demo.

## GUI Control
![image](https://user-images.githubusercontent.com/48346627/175209094-c12da5c9-7b6b-47b7-b131-d242e2026876.png)

You can open/close the sidebars by clicking the button of header area as shown.

## Create Meeting Room
![image](https://user-images.githubusercontent.com/48346627/175209909-aa67f3c3-d04e-44e9-a044-d564064bf87d.png)

You can create meeting room at the sidebar. (1)At first you should open meeting room management area by clicking the caret. (2)Then click "new room" to open dialog for creating room. (3) Input information and click submit button, (4)then the meeting room is listed in the meeting room management area

## Join Meeting Room
![image](https://user-images.githubusercontent.com/48346627/175210439-46ea5393-7063-494b-970d-e3fde1560be2.png)

Click the "Join" of the meeting room you'll join, then the dialog appear. Please submit button to enter.

## Select Device
![image](https://user-images.githubusercontent.com/48346627/175210854-3e36d1ec-d574-4d88-9566-b2e703f7a2c0.png)

You can select audio device and video device in the setting dialog. To open the setting dialog, click the gear button in the header. In the setting dialog, you can choose the audio effect (noise suppression), and video effect (virtual background, cneter stage etc.).

## Enable/Disable Devices.
![image](https://user-images.githubusercontent.com/48346627/175210864-e281cc58-64d0-47a6-a585-59f96ddedccb.png)

You can toggle each device enable/disable by clicking the device buttons in the header.

## Share the screen.
![image](https://user-images.githubusercontent.com/48346627/175211299-0b4a9111-9a25-4897-a705-d91d34c51986.png)

To share screen, click the share button in the header.

## Switch view
![image](https://user-images.githubusercontent.com/48346627/175211594-464a20ac-86d6-4b3e-802a-a001e2dce6df.png)

To swich the view, feature view and grid view, click the view buttons in the header.

## Leave demo
![image](https://user-images.githubusercontent.com/48346627/175212029-62c1efef-a1a0-47d7-a7bc-e84a83f60289.png)

To leave the demo (Sign out), click the leave button in the header to open the dialog.

## Chatting

![image](https://user-images.githubusercontent.com/48346627/175214020-aa6b59c4-a3b6-42f0-aa2c-719cf821425b.png)

This demo has the two type of chatting space. The global chatting area in left sidebar. The local chatting area in right sidebar.

The global chatting area, you can chat with the all users in each meeting room.

The local chatting area, you can chat with the users in the meeting room you joined.


# Delete Stack
At first, delete all data from backet. You can get the bucket name with this command.
```
$ cd backend2
$ cat cfn_outputs.json |grep -e "Bucket"
    "BucketDomainName": "xxxxxxxxxxxx.s3.amazonaws.com",
    "Bucket": "xxxxxxxxxxxxxxxxxxxx",                       <- this is bucket name
    "BucketWebsiteDomainName": "xxxxxxxxxxxxxx.s3-website-us-east-1.amazonaws.com"
```

Then, execute this command.
```
$ npm run destroy
```

Note 1: Cognito user pool is kept when delete stack. If you want to delete it, please delete it with AWS console.

Note 2: AppInstance of Amazon Chime is kept when delete stack. If you want to delete it, please delete it with AWS CLI. You can see the list of app instances with the CLI.
```
$ aws chime list-app-instances
```
The app instance name is `<stack name>_<date the app instance created>`. And you can delete it with the CLI.
```
$ aws chime delete-app-instance --app-instance-arn arn:aws:chime:xxxx:app-instance/xxxxxx-xxx-xxx-xxxxx
```

# Acknowledgement
## Resources
1. Images from https://www.irasutoya.com/
2. Sounds from https://otologic.jp
3. movie from https://www.youtube.com/, https://pixabay.com/ja/videos/

