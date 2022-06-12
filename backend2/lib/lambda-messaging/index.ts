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
        // (1) APP INSTANCEの作成
        const params = {
            Name: `${stackId}_${dateNow.toISOString()}`,
            ClientRequestToken: `${dateNow.getHours().toString()}_${dateNow.getMinutes().toString()}`
        };
        const chimeResponse = await chime.createAppInstance(
            params
        )
        console.log("createAppInstance Res:", chimeResponse)
        const appInstanceArn = chimeResponse.AppInstanceArn!

        // (2) Admin 用Userの作成
        const dateNow2 = new Date();
        const createUserParams = {
            AppInstanceArn: appInstanceArn,
            AppInstanceUserId: 'ServiceUser',
            ClientRequestToken: dateNow2.getHours().toString() + dateNow2.getMinutes().toString() + dateNow2.getSeconds().toString(),
            Name: 'ServiceUser',
        };
        const chimeResponse2 = await chime.createAppInstanceUser(
            createUserParams
        )
        console.log("createAppInstanceUser Res:", chimeResponse2)
        const adminUserArn = chimeResponse2.AppInstanceUserArn!

        // (3) UserをAdminユーザに昇格
        const createAdminParams = {
            AppInstanceAdminArn: adminUserArn,
            AppInstanceArn: appInstanceArn
        };

        const chimeResponse3 = await chime.createAppInstanceAdmin(
            createAdminParams
        )
        console.log("createAppInstanceAdmin Res:", chimeResponse3)


        // (4) Global Channelを作成
        const dateNow3 = new Date();
        const createChannelParams = {
            Name: `GlobalChannel`,
            AppInstanceArn: appInstanceArn,
            ClientRequestToken: `${dateNow3.getHours().toString()}_${dateNow3.getMinutes().toString()}_${dateNow3.getSeconds().toString()}`,
            ChimeBearer: adminUserArn,
            Mode: 'RESTRICTED',
            Privacy: 'PUBLIC'
        };

        const chimeResponse4 = await chime.createChannel(createChannelParams);
        console.log("Message Channel Created:", chimeResponse4.ChannelArn);
        const globalChannelArn = chimeResponse4.ChannelArn || "N/A"

        await response.send(event, context, response.SUCCESS,
            {
                AppInstanceAdminArn: adminUserArn,
                AppInstanceArn: appInstanceArn,
                GlobalChannelArn: globalChannelArn
            });
    } catch (error) {
        console.error("Failed to create AppInstance resources", error);
        await response.send(event, context, response.FAILED, {});
    }


};