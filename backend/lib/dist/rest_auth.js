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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzdF9hdXRoLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vbGFtYmRhMi9yZXN0X2F1dGgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsaUNBQWlEO0FBQ2pEOzs7Ozs7R0FNRztBQUNILE1BQU0sY0FBYyxHQUFHLENBQUMsV0FBbUIsRUFBRSxNQUFjLEVBQUUsUUFBZ0IsRUFBRSxPQUFZLEVBQUUsRUFBRTtJQUMzRixJQUFJLE1BQU0sSUFBSSxRQUFRLEVBQUU7UUFDcEIsTUFBTSxjQUFjLEdBQUc7WUFDbkIsT0FBTyxFQUFFLFlBQVk7WUFDckIsU0FBUyxFQUFFO2dCQUNQO29CQUNJLE1BQU0sRUFBRSxvQkFBb0I7b0JBQzVCLE1BQU0sRUFBRSxNQUFNO29CQUNkLFFBQVEsRUFBRSxRQUFRO2lCQUNyQjthQUNKO1NBQ0osQ0FBQztRQUNGLE1BQU0sWUFBWSxHQUFHO1lBQ2pCLFdBQVcsRUFBRSxXQUFXO1lBQ3hCLGNBQWMsRUFBRSxjQUFjO1lBQzlCLE9BQU8sRUFBRSxPQUFPO1NBQ25CLENBQUM7UUFDRixPQUFPLFlBQVksQ0FBQztLQUN2QjtJQUNELE9BQU8sRUFBRSxDQUFDO0FBQ2QsQ0FBQyxDQUFDO0FBRUY7Ozs7Ozs7OztHQVNHO0FBQ0ksTUFBTSxTQUFTLEdBQUcsS0FBSyxFQUFFLEtBQVUsRUFBRSxPQUFZLEVBQUUsUUFBYSxFQUFFLEVBQUU7SUFDdkUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNoRSxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2xFLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0lBQy9DLE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxrQkFBNEIsQ0FBQztJQUNqRCxJQUFJO1FBQ0EsTUFBTSxLQUFLLEdBQUcsTUFBTSxJQUFBLDhCQUF1QixFQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ25ELE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO0tBQ2hDO0lBQUMsT0FBTyxDQUFDLEVBQUU7UUFDUixNQUFNLHlDQUF5QyxDQUFDO0tBQ25EO0lBRUQsT0FBTyxjQUFjLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsU0FBUyxFQUFFO0lBQ2xELG9EQUFvRDtJQUNwRCxzREFBc0Q7S0FDekQsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFDO0FBaEJXLFFBQUEsU0FBUyxhQWdCcEIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBnZXRFbWFpbEZyb21BY2Nlc3NUb2tlbiB9IGZyb20gXCIuL3V0aWxcIjtcbi8qKlxuICogZ2VuZXJhdGUgcG9saWN5LiBzdWJmdW5jdGlvbiBvZiBhdXRob3JpemVyLlxuICogQHBhcmFtIHsqfSBwcmluY2lwYWxJZFxuICogQHBhcmFtIHsqfSBlZmZlY3RcbiAqIEBwYXJhbSB7Kn0gcmVzb3VyY2VcbiAqIEBwYXJhbSB7Kn0gY29udGV4dFxuICovXG5jb25zdCBnZW5lcmF0ZVBvbGljeSA9IChwcmluY2lwYWxJZDogc3RyaW5nLCBlZmZlY3Q6IHN0cmluZywgcmVzb3VyY2U6IHN0cmluZywgY29udGV4dDogYW55KSA9PiB7XG4gICAgaWYgKGVmZmVjdCAmJiByZXNvdXJjZSkge1xuICAgICAgICBjb25zdCBwb2xpY3lEb2N1bWVudCA9IHtcbiAgICAgICAgICAgIFZlcnNpb246IFwiMjAxMi0xMC0xN1wiLFxuICAgICAgICAgICAgU3RhdGVtZW50OiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBBY3Rpb246IFwiZXhlY3V0ZS1hcGk6SW52b2tlXCIsXG4gICAgICAgICAgICAgICAgICAgIEVmZmVjdDogZWZmZWN0LFxuICAgICAgICAgICAgICAgICAgICBSZXNvdXJjZTogcmVzb3VyY2UsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGF1dGhSZXNwb25zZSA9IHtcbiAgICAgICAgICAgIHByaW5jaXBhbElkOiBwcmluY2lwYWxJZCxcbiAgICAgICAgICAgIHBvbGljeURvY3VtZW50OiBwb2xpY3lEb2N1bWVudCxcbiAgICAgICAgICAgIGNvbnRleHQ6IGNvbnRleHQsXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBhdXRoUmVzcG9uc2U7XG4gICAgfVxuICAgIHJldHVybiB7fTtcbn07XG5cbi8qKlxuICogQXV0aG9yaXplclxuICogKDEpIGNoZWNrIHF1ZXJ5IHBhcmFtZXRlci4gbWVldGluZ0lkLCBhdHRlbmRlZUlkLCBqb2luVG9rZW5cbiAqICgyKSBjaGVjayBhdHRlbmRlZSBpbiB0aGUgbWVldGluZ1xuICogKDMpIGNoZWNrIGpvaW5Ub2tlblxuICogKDQpIHJldHVybiBwb2xpY3lcbiAqIEBwYXJhbSB7Kn0gZXZlbnRcbiAqIEBwYXJhbSB7Kn0gY29udGV4dFxuICogQHBhcmFtIHsqfSBjYWxsYmFja1xuICovXG5leHBvcnQgY29uc3QgYXV0aG9yaXplID0gYXN5bmMgKGV2ZW50OiBhbnksIGNvbnRleHQ6IGFueSwgY2FsbGJhY2s6IGFueSkgPT4ge1xuICAgIGNvbnNvbGUubG9nKFwiYXV0aG9yaXplIGV2ZW50OlwiLCBKU09OLnN0cmluZ2lmeShldmVudCwgbnVsbCwgMikpO1xuICAgIGNvbnNvbGUubG9nKFwiYXV0aG9yaXplIGV2ZW50OlwiLCBKU09OLnN0cmluZ2lmeShjb250ZXh0LCBudWxsLCAyKSk7XG4gICAgY29uc29sZS5sb2coXCJ0b2tlblwiLCBldmVudC5hdXRob3JpemF0aW9uVG9rZW4pO1xuICAgIGNvbnN0IHRva2VuID0gZXZlbnQuYXV0aG9yaXphdGlvblRva2VuIGFzIHN0cmluZztcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBlbWFpbCA9IGF3YWl0IGdldEVtYWlsRnJvbUFjY2Vzc1Rva2VuKHRva2VuKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJlbWFpbDFcIiwgZW1haWwpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdGhyb3cgXCJpbnZhbGlkIHRva2VuISEgdW5rbndvbiBmZWRlcmF0aW9uIGNvZGVcIjtcbiAgICB9XG5cbiAgICByZXR1cm4gZ2VuZXJhdGVQb2xpY3koXCJtZVwiLCBcIkFsbG93XCIsIGV2ZW50Lm1ldGhvZEFybiwge1xuICAgICAgICAvLyBtZWV0aW5nSWQ6IGV2ZW50LnF1ZXJ5U3RyaW5nUGFyYW1ldGVycy5tZWV0aW5nSWQsXG4gICAgICAgIC8vIGF0dGVuZGVlSWQ6IGV2ZW50LnF1ZXJ5U3RyaW5nUGFyYW1ldGVycy5hdHRlbmRlZUlkLFxuICAgIH0pO1xufTtcbiJdfQ==