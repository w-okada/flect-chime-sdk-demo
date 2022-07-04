import * as crypto from "crypto";

export type Envelop<T> = {
    data: T;
    secret?: string;
    expireSec: number;
};

export type EncrypterParams = {
    password?: string;
    salt?: string;
    secret?: string;
    expireSec?: number;
};

export class Encrypter<T> {
    algorithm = "aes-256-cbc";

    password: string;
    salt: string;
    secret: string; // passとsaltが漏れてもdecodeできないようにプロセス内で保持⇒Lambda化によりStaticになってしまった。TODO: 自動生成＆DB登録などが必要。
    key: Buffer;
    iv: Buffer;
    expireSec: number;
    constructor(params: EncrypterParams) {
        this.password = params.password || this.generateRandomString(16);
        this.salt = params.salt || this.generateRandomString(16);
        this.secret = params.secret || this.generateRandomString(16);
        this.key = crypto.scryptSync(this.password, this.salt, 32);
        this.expireSec = params.expireSec || -1;
        // this.iv = params.iv || crypto.randomBytes(16);
        this.iv = Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    }

    private generateRandomString = (length: number) => {
        return crypto.randomBytes(length).reduce((p, i) => p + (i % 36).toString(36), "");
    };

    encodeInformation = (info: T): string => {
        const envelop: Envelop<T> = {
            data: info,
            secret: this.secret,
            expireSec: Math.floor(new Date().getTime() / 1000) + this.expireSec,
        };
        const cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv); // 暗号用インスタンス
        const cipheredData = cipher.update(JSON.stringify(envelop), "utf8", "hex") + cipher.final("hex");
        return cipheredData;
    };

    decodeInformation = (cipheredData: string): T | null => {
        const decipher = crypto.createDecipheriv(this.algorithm, this.key, this.iv); // 復号用インスタンス
        const decipheredDataJson = decipher.update(cipheredData, "hex", "utf8") + decipher.final("utf8");
        const decipheredData: Envelop<T> = JSON.parse(decipheredDataJson);
        const nowTime = Math.floor(new Date().getTime() / 1000);
        console.log(this.expireSec);
        console.log(decipheredData.expireSec);
        console.log(nowTime);
        if (this.expireSec > 0 && decipheredData.expireSec < nowTime) {
            console.log(`Expired User Info: ${decipheredData.expireSec} < ${nowTime}`);
            return null;
        } else if (decipheredData.secret === this.secret) {
            decipheredData.secret = undefined;
            return decipheredData.data;
        } else {
            console.log("!!!!!!!!!!! secret is not match !!!!!!!!!!!");
            return null;
        }
    };
}
