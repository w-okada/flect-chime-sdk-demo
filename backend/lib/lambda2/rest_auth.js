"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
const util_1 = require("./util");
/**
 * generate policy. subfunction of authorizer.
 * @param {*} principalId
 * @param {*} effect
 * @param {*} resource
 * @param {*} context
 */
const generatePolicy = (principalId, effect, resource, context) => {
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
const authorize = async (event, context, callback) => {
    console.log("authorize event:", JSON.stringify(event, null, 2));
    console.log("authorize event:", JSON.stringify(context, null, 2));
    console.log("token", event.authorizationToken);
    const token = event.authorizationToken;
    try {
        const email = await (0, util_1.getEmailFromAccessToken)(token);
        console.log("email1", email);
    }
    catch (e) {
        throw "invalid token!! unknwon federation code";
    }
    return generatePolicy("me", "Allow", event.methodArn, {
    // meetingId: event.queryStringParameters.meetingId,
    // attendeeId: event.queryStringParameters.attendeeId,
    });
};
exports.authorize = authorize;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzdF9hdXRoLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicmVzdF9hdXRoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLGlDQUFpRDtBQUdqRDs7Ozs7O0dBTUc7QUFDSCxNQUFNLGNBQWMsR0FBRyxDQUFDLFdBQW1CLEVBQUUsTUFBYyxFQUFFLFFBQWdCLEVBQUUsT0FBWSxFQUFFLEVBQUU7SUFDM0YsSUFBSSxNQUFNLElBQUksUUFBUSxFQUFFO1FBQ3BCLE1BQU0sY0FBYyxHQUFHO1lBQ25CLE9BQU8sRUFBRSxZQUFZO1lBQ3JCLFNBQVMsRUFBRTtnQkFDUDtvQkFDSSxNQUFNLEVBQUUsb0JBQW9CO29CQUM1QixNQUFNLEVBQUUsTUFBTTtvQkFDZCxRQUFRLEVBQUUsUUFBUTtpQkFDckI7YUFDSjtTQUNKLENBQUM7UUFDRixNQUFNLFlBQVksR0FBRztZQUNqQixXQUFXLEVBQUUsV0FBVztZQUN4QixjQUFjLEVBQUUsY0FBYztZQUM5QixPQUFPLEVBQUUsT0FBTztTQUNuQixDQUFDO1FBQ0YsT0FBTyxZQUFZLENBQUM7S0FDdkI7SUFDRCxPQUFPLEVBQUUsQ0FBQztBQUNkLENBQUMsQ0FBQztBQUVGOzs7Ozs7Ozs7R0FTRztBQUNJLE1BQU0sU0FBUyxHQUFHLEtBQUssRUFBRSxLQUFVLEVBQUUsT0FBWSxFQUFFLFFBQWEsRUFBRSxFQUFFO0lBQ3ZFLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDaEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNsRSxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsa0JBQWtCLENBQUMsQ0FBQztJQUMvQyxNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsa0JBQTRCLENBQUM7SUFDakQsSUFBSTtRQUNBLE1BQU0sS0FBSyxHQUFHLE1BQU0sSUFBQSw4QkFBdUIsRUFBQyxLQUFLLENBQUMsQ0FBQztRQUNuRCxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztLQUNoQztJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1IsTUFBTSx5Q0FBeUMsQ0FBQztLQUNuRDtJQUVELE9BQU8sY0FBYyxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsS0FBSyxDQUFDLFNBQVMsRUFBRTtJQUNsRCxvREFBb0Q7SUFDcEQsc0RBQXNEO0tBQ3pELENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQztBQWhCVyxRQUFBLFNBQVMsYUFnQnBCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZ2V0RW1haWxGcm9tQWNjZXNzVG9rZW4gfSBmcm9tIFwiLi91dGlsXCI7XG5pbXBvcnQgeyBJQU0gfSBmcm9tIFwiYXdzLXNka1wiO1xuaW1wb3J0IHsgZ2V0VXNlckluZm9ybWF0aW9uIH0gZnJvbSBcIi4vZmVkZXJhdGlvbi9yZXN0XCI7XG4vKipcbiAqIGdlbmVyYXRlIHBvbGljeS4gc3ViZnVuY3Rpb24gb2YgYXV0aG9yaXplci5cbiAqIEBwYXJhbSB7Kn0gcHJpbmNpcGFsSWRcbiAqIEBwYXJhbSB7Kn0gZWZmZWN0XG4gKiBAcGFyYW0geyp9IHJlc291cmNlXG4gKiBAcGFyYW0geyp9IGNvbnRleHRcbiAqL1xuY29uc3QgZ2VuZXJhdGVQb2xpY3kgPSAocHJpbmNpcGFsSWQ6IHN0cmluZywgZWZmZWN0OiBzdHJpbmcsIHJlc291cmNlOiBzdHJpbmcsIGNvbnRleHQ6IGFueSkgPT4ge1xuICAgIGlmIChlZmZlY3QgJiYgcmVzb3VyY2UpIHtcbiAgICAgICAgY29uc3QgcG9saWN5RG9jdW1lbnQgPSB7XG4gICAgICAgICAgICBWZXJzaW9uOiBcIjIwMTItMTAtMTdcIixcbiAgICAgICAgICAgIFN0YXRlbWVudDogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgQWN0aW9uOiBcImV4ZWN1dGUtYXBpOkludm9rZVwiLFxuICAgICAgICAgICAgICAgICAgICBFZmZlY3Q6IGVmZmVjdCxcbiAgICAgICAgICAgICAgICAgICAgUmVzb3VyY2U6IHJlc291cmNlLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICB9O1xuICAgICAgICBjb25zdCBhdXRoUmVzcG9uc2UgPSB7XG4gICAgICAgICAgICBwcmluY2lwYWxJZDogcHJpbmNpcGFsSWQsXG4gICAgICAgICAgICBwb2xpY3lEb2N1bWVudDogcG9saWN5RG9jdW1lbnQsXG4gICAgICAgICAgICBjb250ZXh0OiBjb250ZXh0LFxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gYXV0aFJlc3BvbnNlO1xuICAgIH1cbiAgICByZXR1cm4ge307XG59O1xuXG4vKipcbiAqIEF1dGhvcml6ZXJcbiAqICgxKSBjaGVjayBxdWVyeSBwYXJhbWV0ZXIuIG1lZXRpbmdJZCwgYXR0ZW5kZWVJZCwgam9pblRva2VuXG4gKiAoMikgY2hlY2sgYXR0ZW5kZWUgaW4gdGhlIG1lZXRpbmdcbiAqICgzKSBjaGVjayBqb2luVG9rZW5cbiAqICg0KSByZXR1cm4gcG9saWN5XG4gKiBAcGFyYW0geyp9IGV2ZW50XG4gKiBAcGFyYW0geyp9IGNvbnRleHRcbiAqIEBwYXJhbSB7Kn0gY2FsbGJhY2tcbiAqL1xuZXhwb3J0IGNvbnN0IGF1dGhvcml6ZSA9IGFzeW5jIChldmVudDogYW55LCBjb250ZXh0OiBhbnksIGNhbGxiYWNrOiBhbnkpID0+IHtcbiAgICBjb25zb2xlLmxvZyhcImF1dGhvcml6ZSBldmVudDpcIiwgSlNPTi5zdHJpbmdpZnkoZXZlbnQsIG51bGwsIDIpKTtcbiAgICBjb25zb2xlLmxvZyhcImF1dGhvcml6ZSBldmVudDpcIiwgSlNPTi5zdHJpbmdpZnkoY29udGV4dCwgbnVsbCwgMikpO1xuICAgIGNvbnNvbGUubG9nKFwidG9rZW5cIiwgZXZlbnQuYXV0aG9yaXphdGlvblRva2VuKTtcbiAgICBjb25zdCB0b2tlbiA9IGV2ZW50LmF1dGhvcml6YXRpb25Ub2tlbiBhcyBzdHJpbmc7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZW1haWwgPSBhd2FpdCBnZXRFbWFpbEZyb21BY2Nlc3NUb2tlbih0b2tlbik7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiZW1haWwxXCIsIGVtYWlsKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHRocm93IFwiaW52YWxpZCB0b2tlbiEhIHVua253b24gZmVkZXJhdGlvbiBjb2RlXCI7XG4gICAgfVxuXG4gICAgcmV0dXJuIGdlbmVyYXRlUG9saWN5KFwibWVcIiwgXCJBbGxvd1wiLCBldmVudC5tZXRob2RBcm4sIHtcbiAgICAgICAgLy8gbWVldGluZ0lkOiBldmVudC5xdWVyeVN0cmluZ1BhcmFtZXRlcnMubWVldGluZ0lkLFxuICAgICAgICAvLyBhdHRlbmRlZUlkOiBldmVudC5xdWVyeVN0cmluZ1BhcmFtZXRlcnMuYXR0ZW5kZWVJZCxcbiAgICB9KTtcbn07XG4iXX0=