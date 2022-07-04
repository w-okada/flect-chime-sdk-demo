import * as CognitoIdentityServiceProvider from "@aws-sdk/client-cognito-identity-provider";
import { UserInformation } from "./federation/slack/data/userInfo";
import { Encrypter } from "./federation/slack/encrypter";
import { HTTPResponseBody } from "./http_request";

const provider = new CognitoIdentityServiceProvider.CognitoIdentityProvider({})

export const log = (func: string, ...message: string[]) => {
    console.log(`\r\n[${func}]\r\n`, ...message)
}

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

export const getExpireDate = (hour: number) => {
    return Math.floor(Date.now() / 1000) + 60 * 60 * hour;
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

export type UserInfoFromCognito = {
    email: string,
    sub: string
}

export const getUserInfoFromCognitoWithAccessToken = async (accessToken: string): Promise<UserInfoFromCognito> => {
    const tokens = accessToken.split(",");
    if (tokens.length === 1) {
        const p = new Promise<CognitoIdentityServiceProvider.GetUserResponse>((resolve, reject) => {
            provider.getUser({ AccessToken: tokens[0] }, (err, data) => {
                // console.log(err);
                if (err) {
                    console.warn("[getEmailFromAccessToken] token is not cognito accessToken");
                    reject("[getEmailFromAccessToken] token is not cognito accessToken");
                }
                if (!data) {
                    console.warn("[getEmailFromAccessToken] data is null");
                    reject("[getEmailFromAccessToken] data is null");
                } else {
                    console.log(data);
                    resolve(data);
                }
            });
        });
        const userData = await p;
        let email: string | null = null;
        let sub: string | null = null;
        if (!userData.UserAttributes) {
            console.warn("email not found. UserAttribute is not returned");
            throw "email not found";
        }

        console.log("USER_DATA:", JSON.stringify(userData.UserAttributes))
        for (let i = 0; i < userData.UserAttributes.length; i++) {
            const att = userData.UserAttributes[i];
            if (att["Name"] == "email") {
                email = att["Value"] || null;
            } else if (att["Name"] == "sub") {
                sub = att["Value"] || null;
            }
        }
        if (!email || !sub) {
            console.warn("email not found");
            throw "email not found";
        } else {
            return {
                email: email,
                sub: sub
            }
        }
    } else if (tokens.length === 2) {
        if (tokens[0] === "slack") {
            const urlEncrypter = new Encrypter<UserInformation>({
                //@ts-ignore
                password: process.env.SLACK_APP_DB_PASSWORD || "pass",
                //@ts-ignore
                salt: process.env.SLACK_APP_DB_SALT || "salt",
                //@ts-ignore
                secret: process.env.SLACK_APP_DB_SECRET || "secret",
                expireSec: 60 * 60, // 60min
            });
            const userInfo = urlEncrypter.decodeInformation(tokens[1]);
            console.log(`Slack Federated Authentification userInfo: ${JSON.stringify(userInfo)}`);
            return {
                email: userInfo!.userId,  /// Slack 連携作成時にで再度確認
                sub: userInfo!.userId
            }
        } else {
            console.log(`unknown provider ${tokens[0]}`);
            throw `unknown provider ${tokens[0]}`;
        }
    } else {
        console.log("this token format is not supported");
        throw "this token format is not supported";
    }
};
