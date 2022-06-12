import { Installation, InstallationQuery } from "@slack/bolt";
import * as DynamoDB from "@aws-sdk/client-dynamodb"
import { Encrypter } from "./encrypter";

const authEncrypter = new Encrypter<string>({
    password: process.env.APP_DB_PASSWORD || "pass",
    salt: process.env.APP_DB_SALT || "salt",
    secret: process.env.APP_DB_SECRET || "secret",
});

type DatabaseCache<AuthVersion extends "v1" | "v2"> = {
    cache: { [teamId: string]: Installation<AuthVersion, boolean> };
};

const database: DatabaseCache<"v1" | "v2"> = {
    cache: {},
};

const ddb = new DynamoDB.DynamoDB({ region: process.env.AWS_REGION });
const slackFederationAuthsTableName = process.env.SLACK_FEDERATION_AUTHS_TABLE_NAME || "";

const addInstllationToDB = async <AuthVersion extends "v1" | "v2">(installation: Installation<AuthVersion, boolean>) => {
    const info = JSON.stringify(installation);
    const teamId = installation.team!.id;
    const encInfo = authEncrypter.encodeInformation(info);
    const item = {
        TeamId: { S: teamId },
        Data: { S: encInfo },
    };
    await ddb
        .putItem({
            TableName: slackFederationAuthsTableName,
            Item: item,
        })

};

const queryInstallationFromDB = async (teamId: string) => {
    try {
        console.log(`Query Installation1: ${teamId}`);
        const result = await ddb.getItem({ TableName: slackFederationAuthsTableName, Key: { TeamId: { S: teamId } } })
        console.log(`Query Installation2: ${JSON.stringify(result)}`);
        if (!result.Item) {
            console.log(`Query Installation: No record for ${teamId}`);
            return null;
        }
        const encInfo = result.Item.Data.S!;
        console.log(`Query Installation: encInfo ${encInfo}`);
        const infoJson = authEncrypter.decodeInformation(encInfo);
        console.log(`Query Installation: info ${infoJson}`);
        const info = JSON.parse(infoJson || "{}");
        console.log(`Query Installation: info ${info}`);
        return info;
    } catch (exception) {
        console.log(`Query Installation Exception!: ${exception}`);
        return null;
    }
};

const deleteInstallationFromDB = async (teamId: string) => {
    await ddb
        .deleteItem({
            TableName: slackFederationAuthsTableName,
            Key: {
                TeamId: { S: teamId },
            },
        })
};

export const addTeamInformation = async <AuthVersion extends "v1" | "v2">(installation: Installation<AuthVersion, boolean>) => {
    console.log("STORE INSTALATTION!!!!!!!!!!!");
    console.dir(database, { depth: 5 });
    const teamId = installation.team!.id;

    const existInformation = await queryInstallationFromDB(teamId);
    if (existInformation) {
        await deleteInstallationFromDB(teamId);
    }
    await addInstllationToDB(installation);
    database.cache[teamId] = installation;
};

export const fetchInstallation = async (installQuery: InstallationQuery<boolean>) => {
    console.log("FETCH INSTALATTION!!!!!!!!!!!");
    const teamId = installQuery.teamId!;
    if (!database.cache[teamId]) {
        database.cache[teamId] = await queryInstallationFromDB(teamId);
    }

    return database.cache[installQuery.teamId!];
};

export const deleteInstallation = async (installQuery: InstallationQuery<boolean>) => {
    console.log("DELETE INSTALATTION!!!!!!!!!!!");
    delete database.cache[installQuery.teamId!];
    return;
};

export const fetchToken = async (teamId: string) => {
    console.log("FETCH TOKEN!!!!!!!!!!!");
    if (!database.cache[teamId]) {
        database.cache[teamId] = await queryInstallationFromDB(teamId);
    }
    if (database.cache[teamId]) {
        return database.cache[teamId].bot!.token;
    } else {
        return null;
    }
};
