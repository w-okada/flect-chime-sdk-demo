import * as response from "./cfn-response"
import * as Chime from "@aws-sdk/client-chime"

const chime = new Chime.Chime({ region: process.env.AWS_REGION });
const stackId = process.env.STACK_ID;

export const handler = async (event: any, context: any, callback: any) => {
    console.log('Event: \n', event);
    console.log('Create Chime SDK App Instance');

    try {
        if (event["RequestType"] !== "Create") {
            response.send(event, context, response.SUCCESS, {});
        }

        const dateNow = new Date();
        //create a chime app instance
        const params = {
            Name: `${stackId}_${dateNow.toISOString()}`,
            ClientRequestToken: `${dateNow.getHours().toString()}_${dateNow.getMinutes().toString()}`
        };
        const chimeResponse = await chime.createAppInstance(
            params
        )
        console.log("createAppInstance Res:", chimeResponse)

        //Create AppInstanceAdmin
        const createUserParams = {
            AppInstanceArn: chimeResponse.AppInstanceArn!,
            AppInstanceUserId: 'ServiceUser',
            ClientRequestToken: dateNow.getHours().toString() + dateNow.getMinutes().toString(),
            Name: 'ServiceUser',
        };
        const chimeResponse2 = await chime.createAppInstanceUser(
            createUserParams
        )
        console.log("createAppInstanceUser Res:", chimeResponse2)

        const createAdminParams = {
            AppInstanceAdminArn: chimeResponse2.AppInstanceUserArn!,
            AppInstanceArn: chimeResponse.AppInstanceArn!
        };

        const chimeResponse3 = await chime.createAppInstanceAdmin(
            createAdminParams
        )
        console.log("createAppInstanceAdmin Res:", chimeResponse3)

        await response.send(event, context, response.SUCCESS, createAdminParams);
    } catch (error) {
        console.error("Failed to create AppInstance resources", error);
        await response.send(event, context, response.FAILED, {});
    }


};