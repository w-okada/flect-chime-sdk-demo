import { CognitoIdentityServiceProvider } from "aws-sdk";
import { UserInformation } from "./federation/slack/data/userInfo";
import { Encrypter } from "./federation/slack/encrypter";
import { HTTPResponseBody } from "./http_request";

const provider = new CognitoIdentityServiceProvider();

export const getResponseTemplate = () => {
    var response = {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Origin": "*",
        },
        body: "{}",
        isBase64Encoded: false,
    };
    return response;
};

export const getExpireDate = () => {
    return Math.floor(Date.now() / 1000) + 60 * 60 * 24;
};

export const generateResponse = (body: HTTPResponseBody) => {
    var response = {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify(body),
        isBase64Encoded: false,
    };
    return response;
};

export const getEmailFromAccessToken = async (accessToken: string) => {
    const tokens = accessToken.split(",");
    if (tokens.length === 1) {
        const p = new Promise<CognitoIdentityServiceProvider.GetUserResponse>((resolve, reject) => {
            provider.getUser({ AccessToken: tokens[0] }, (err, data) => {
                // console.log(err);
                if (err) {
                    console.log("[getEmailFromAccessToken] token is not cognito accessToken");
                    reject("[getEmailFromAccessToken] token is not cognito accessToken");
                }
                console.log(data);
                resolve(data);
            });
        });
        const userData = await p;
        let email;
        let foundEmail = false;
        for (let i = 0; i < userData.UserAttributes.length; i++) {
            const att = userData.UserAttributes[i];
            if (att["Name"] == "email") {
                email = att["Value"];
                foundEmail = true;
            }
        }
        if (foundEmail) {
            return email;
        } else {
            console.log("email not found");
            throw "email not found";
        }
    } else if (tokens.length === 2) {
        if (tokens[0] === "slack") {
            const urlEncrypter = new Encrypter<UserInformation>({
                password: process.env.SLACK_APP_DB_PASSWORD || "pass",
                salt: process.env.SLACK_APP_DB_SALT || "salt",
                secret: process.env.SLACK_APP_DB_SECRET || "secret",
                expireSec: 60 * 60, // 60min
            });
            const userInfo = urlEncrypter.decodeInformation(tokens[1]);
            console.log(`Slack Federated Authentification userInfo: ${JSON.stringify(userInfo)}`);
            return userInfo.userId;
        } else {
            console.log(`unknown provider ${tokens[0]}`);
            throw `unknown provider ${tokens[0]}`;
        }
    } else {
        console.log("this token format is not supported");
        throw "this token format is not supported";
    }
};
