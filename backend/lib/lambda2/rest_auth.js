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
    const email = await (0, util_1.getEmailFromAccessToken)(event.authorizationToken);
    console.log("email1", email);
    return generatePolicy("me", "Allow", event.methodArn, {
    // meetingId: event.queryStringParameters.meetingId,
    // attendeeId: event.queryStringParameters.attendeeId,
    });
};
exports.authorize = authorize;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzdF9hdXRoLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicmVzdF9hdXRoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLGlDQUFpRDtBQUVqRDs7Ozs7O0dBTUc7QUFDSCxNQUFNLGNBQWMsR0FBRyxDQUFDLFdBQW1CLEVBQUUsTUFBYyxFQUFFLFFBQWdCLEVBQUUsT0FBWSxFQUFFLEVBQUU7SUFDM0YsSUFBSSxNQUFNLElBQUksUUFBUSxFQUFFO1FBQ3BCLE1BQU0sY0FBYyxHQUFHO1lBQ25CLE9BQU8sRUFBRSxZQUFZO1lBQ3JCLFNBQVMsRUFBRTtnQkFDUDtvQkFDSSxNQUFNLEVBQUUsb0JBQW9CO29CQUM1QixNQUFNLEVBQUUsTUFBTTtvQkFDZCxRQUFRLEVBQUUsUUFBUTtpQkFDckI7YUFDSjtTQUNKLENBQUM7UUFDRixNQUFNLFlBQVksR0FBRztZQUNqQixXQUFXLEVBQUUsV0FBVztZQUN4QixjQUFjLEVBQUUsY0FBYztZQUM5QixPQUFPLEVBQUUsT0FBTztTQUNuQixDQUFDO1FBQ0YsT0FBTyxZQUFZLENBQUM7S0FDdkI7SUFDRCxPQUFPLEVBQUUsQ0FBQztBQUNkLENBQUMsQ0FBQztBQUVGOzs7Ozs7Ozs7R0FTRztBQUNJLE1BQU0sU0FBUyxHQUFHLEtBQUssRUFBRSxLQUFVLEVBQUUsT0FBWSxFQUFFLFFBQWEsRUFBRSxFQUFFO0lBQ3ZFLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDaEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNsRSxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsa0JBQWtCLENBQUMsQ0FBQztJQUMvQyxNQUFNLEtBQUssR0FBRyxNQUFNLElBQUEsOEJBQXVCLEVBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLENBQUM7SUFDdEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFFN0IsT0FBTyxjQUFjLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsU0FBUyxFQUFFO0lBQ2xELG9EQUFvRDtJQUNwRCxzREFBc0Q7S0FDekQsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFDO0FBWFcsUUFBQSxTQUFTLGFBV3BCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZ2V0RW1haWxGcm9tQWNjZXNzVG9rZW4gfSBmcm9tIFwiLi91dGlsXCI7XG5pbXBvcnQgeyBJQU0gfSBmcm9tIFwiYXdzLXNka1wiO1xuLyoqXG4gKiBnZW5lcmF0ZSBwb2xpY3kuIHN1YmZ1bmN0aW9uIG9mIGF1dGhvcml6ZXIuXG4gKiBAcGFyYW0geyp9IHByaW5jaXBhbElkXG4gKiBAcGFyYW0geyp9IGVmZmVjdFxuICogQHBhcmFtIHsqfSByZXNvdXJjZVxuICogQHBhcmFtIHsqfSBjb250ZXh0XG4gKi9cbmNvbnN0IGdlbmVyYXRlUG9saWN5ID0gKHByaW5jaXBhbElkOiBzdHJpbmcsIGVmZmVjdDogc3RyaW5nLCByZXNvdXJjZTogc3RyaW5nLCBjb250ZXh0OiBhbnkpID0+IHtcbiAgICBpZiAoZWZmZWN0ICYmIHJlc291cmNlKSB7XG4gICAgICAgIGNvbnN0IHBvbGljeURvY3VtZW50ID0ge1xuICAgICAgICAgICAgVmVyc2lvbjogXCIyMDEyLTEwLTE3XCIsXG4gICAgICAgICAgICBTdGF0ZW1lbnQ6IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIEFjdGlvbjogXCJleGVjdXRlLWFwaTpJbnZva2VcIixcbiAgICAgICAgICAgICAgICAgICAgRWZmZWN0OiBlZmZlY3QsXG4gICAgICAgICAgICAgICAgICAgIFJlc291cmNlOiByZXNvdXJjZSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgYXV0aFJlc3BvbnNlID0ge1xuICAgICAgICAgICAgcHJpbmNpcGFsSWQ6IHByaW5jaXBhbElkLFxuICAgICAgICAgICAgcG9saWN5RG9jdW1lbnQ6IHBvbGljeURvY3VtZW50LFxuICAgICAgICAgICAgY29udGV4dDogY29udGV4dCxcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIGF1dGhSZXNwb25zZTtcbiAgICB9XG4gICAgcmV0dXJuIHt9O1xufTtcblxuLyoqXG4gKiBBdXRob3JpemVyXG4gKiAoMSkgY2hlY2sgcXVlcnkgcGFyYW1ldGVyLiBtZWV0aW5nSWQsIGF0dGVuZGVlSWQsIGpvaW5Ub2tlblxuICogKDIpIGNoZWNrIGF0dGVuZGVlIGluIHRoZSBtZWV0aW5nXG4gKiAoMykgY2hlY2sgam9pblRva2VuXG4gKiAoNCkgcmV0dXJuIHBvbGljeVxuICogQHBhcmFtIHsqfSBldmVudFxuICogQHBhcmFtIHsqfSBjb250ZXh0XG4gKiBAcGFyYW0geyp9IGNhbGxiYWNrXG4gKi9cbmV4cG9ydCBjb25zdCBhdXRob3JpemUgPSBhc3luYyAoZXZlbnQ6IGFueSwgY29udGV4dDogYW55LCBjYWxsYmFjazogYW55KSA9PiB7XG4gICAgY29uc29sZS5sb2coXCJhdXRob3JpemUgZXZlbnQ6XCIsIEpTT04uc3RyaW5naWZ5KGV2ZW50LCBudWxsLCAyKSk7XG4gICAgY29uc29sZS5sb2coXCJhdXRob3JpemUgZXZlbnQ6XCIsIEpTT04uc3RyaW5naWZ5KGNvbnRleHQsIG51bGwsIDIpKTtcbiAgICBjb25zb2xlLmxvZyhcInRva2VuXCIsIGV2ZW50LmF1dGhvcml6YXRpb25Ub2tlbik7XG4gICAgY29uc3QgZW1haWwgPSBhd2FpdCBnZXRFbWFpbEZyb21BY2Nlc3NUb2tlbihldmVudC5hdXRob3JpemF0aW9uVG9rZW4pO1xuICAgIGNvbnNvbGUubG9nKFwiZW1haWwxXCIsIGVtYWlsKTtcblxuICAgIHJldHVybiBnZW5lcmF0ZVBvbGljeShcIm1lXCIsIFwiQWxsb3dcIiwgZXZlbnQubWV0aG9kQXJuLCB7XG4gICAgICAgIC8vIG1lZXRpbmdJZDogZXZlbnQucXVlcnlTdHJpbmdQYXJhbWV0ZXJzLm1lZXRpbmdJZCxcbiAgICAgICAgLy8gYXR0ZW5kZWVJZDogZXZlbnQucXVlcnlTdHJpbmdQYXJhbWV0ZXJzLmF0dGVuZGVlSWQsXG4gICAgfSk7XG59O1xuIl19