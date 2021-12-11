import { Installation, InstallationQuery } from "@slack/bolt";
import { Pool } from "pg";
import { Encrypter } from "./encrypt";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // ssl: true,
    ssl: {
        rejectUnauthorized: false,
    },
});

const authEncrypter = new Encrypter({
    password: process.env.APP_DB_PASSWORD || "pass",
    salt: process.env.APP_DB_SALT || "salt",
    secret: process.env.APP_DB_SECRET || "secret",
});

const database = {};

const addInstllationToDB = async <AuthVersion extends "v1" | "v2">(installation: Installation<AuthVersion, boolean>) => {
    const info = JSON.stringify(installation);
    const encInfo = authEncrypter.encodeInformation<string>(info);
    var query = {
        text: "INSERT INTO public.auths (team_id, data) VALUES($1, $2)",
        values: [installation.team.id, encInfo],
    };
    try {
        const client = await pool.connect();
        await client.query(query);
    } catch (exception) {
        console.log("add team information error:", JSON.stringify(exception));
    }
};

const queryInstallationFromDB = async (teamId: string) => {
    var query = {
        text: "SELECT * FROM public.auths WHERE team_id = $1",
        values: [teamId],
    };

    try {
        const client = await pool.connect();
        const res = await client.query(query);
        if (res.rows.length == 0) {
            console.log("no record!!");
            return null;
        }
        const encInfo = authEncrypter.decodeInformation<string>(res.rows[0].data);
        const info = JSON.parse(encInfo);
        return info;
    } catch (exception) {
        console.log("get team information error:", JSON.stringify(exception));
    }
    return null;
};
const deleteInstallationFromDB = async (teamId: string) => {
    var query = {
        text: "DELETE FROM public.auths WHERE team_id = $1",
        values: [teamId],
    };
    try {
        const client = await pool.connect();
        await client.query(query);
    } catch (exception) {
        console.log("delete team information error:", JSON.stringify(exception));
    }
    return null;
};

export const addTeamInformation = async <AuthVersion extends "v1" | "v2">(installation: Installation<AuthVersion, boolean>) => {
    // console.log("STORE INSTALATTION!!!!!!!!!!!");
    // console.dir(database, { depth: 5 });

    const existInformation = await queryInstallationFromDB(installation.team.id);
    if (existInformation) {
        await deleteInstallationFromDB(installation.team.id);
    }
    await addInstllationToDB(installation);
    database[installation.team.id] = installation;
};

export const fetchInstallation = async (installQuery: InstallationQuery<boolean>) => {
    // console.log("FETCH INSTALATTION!!!!!!!!!!!");
    if (!database[installQuery.teamId]) {
        database[installQuery.teamId] = await queryInstallationFromDB(installQuery.teamId);
    }
    return database[installQuery.teamId];
};

export const deleteInstallation = async (installQuery: InstallationQuery<boolean>) => {
    // console.log("DELETE INSTALATTION!!!!!!!!!!!");
    delete database[installQuery.teamId];
    return;
};

export const fetchToken = async (teamId: string) => {
    if (!database[teamId]) {
        database[teamId] = await queryInstallationFromDB(teamId);
    }
    if (database[teamId]) {
        return database[teamId].bot.token;
    } else {
        return null;
    }
};
