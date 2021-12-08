import { CognitoIdentityServiceProvider } from "aws-sdk";
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
    const p = new Promise<CognitoIdentityServiceProvider.GetUserResponse>((resolve, reject) => {
        provider.getUser({ AccessToken: accessToken }, (err, data) => {
            console.log(err);
            if (err) {
                console.log("invalid accessToken");
                reject("invalid accessToken");
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
};
