import { getEmailFromAccessToken } from "./util";
/**
 * generate policy. subfunction of authorizer.
 * @param {*} principalId
 * @param {*} effect
 * @param {*} resource
 * @param {*} context
 */
const generatePolicy = (principalId: string, effect: string, resource: string, context: any) => {
    if (effect && resource) {
        const policyDocument = {
            Version: "2012-10-17",
            Statement: [
                {
                    Action: "execute-api:Invoke",
                    Effect: effect,
                    Resource: resource,
                },
            ],
        };
        const authResponse = {
            principalId: principalId,
            policyDocument: policyDocument,
            context: context,
        };
        return authResponse;
    }
    return {};
};

/**
 * Authorizer
 * (1) check query parameter. meetingId, attendeeId, joinToken
 * (2) check attendee in the meeting
 * (3) check joinToken
 * (4) return policy
 * @param {*} event
 * @param {*} context
 * @param {*} callback
 */
export const authorize = async (event: any, context: any, callback: any) => {
    console.log("authorize event:", JSON.stringify(event, null, 2));
    console.log("authorize event:", JSON.stringify(context, null, 2));
    console.log("token", event.authorizationToken);
    const token = event.authorizationToken as string;
    try {
        const email = await getEmailFromAccessToken(token);
        console.log("email1", email);
    } catch (e) {
        throw "invalid token!! unknwon federation code";
    }

    return generatePolicy("me", "Allow", event.methodArn, {
        // meetingId: event.queryStringParameters.meetingId,
        // attendeeId: event.queryStringParameters.attendeeId,
    });
};
