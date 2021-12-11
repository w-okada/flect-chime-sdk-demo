import * as crypto from "crypto";

export type Envelop<T> = {
    data: T;
    secret?: string;
};

export type EncrypterParams = {
    password?: string;
    salt?: string;
    secret?: string;
};

export class Encrypter {
    algorithm = "aes-256-cbc";

    password: string;
    salt: string;
    secret: string;
    key: Buffer;
    iv: Buffer;
    constructor(params: EncrypterParams) {
        this.password = params.password || this.generateRandomString(16);
        this.salt = params.salt || this.generateRandomString(16);
        this.secret = params.secret || this.generateRandomString(16);
        this.key = crypto.scryptSync(this.password, this.salt, 32);
        // this.iv = params.iv || crypto.randomBytes(16);
        this.iv = Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    }

    private generateRandomString = (length: number) => {
        return crypto.randomBytes(length).reduce((p, i) => p + (i % 36).toString(36), "");
    };

    encodeInformation = <T>(info: T): string => {
        const envelop: Envelop<T> = { data: info, secret: this.secret };
        const cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv); // 暗号用インスタンス
        const cipheredData = cipher.update(JSON.stringify(envelop), "utf8", "hex") + cipher.final("hex");
        return cipheredData;
    };

    decodeInformation = <T>(cipheredData: string): T => {
        console.log("decode 1 ", cipheredData);

        const decipher = crypto.createDecipheriv(this.algorithm, this.key, this.iv); // 復号用インスタンス
        console.log("decode 2 ", cipheredData);
        const decipheredDataJson = decipher.update(cipheredData, "hex", "utf8") + decipher.final("utf8");
        console.log("decode 3 ", cipheredData);
        const decipheredData: Envelop<T> = JSON.parse(decipheredDataJson);
        console.log("decode 4 ", cipheredData);
        if (decipheredData.secret === this.secret) {
            decipheredData.secret = undefined;
            return decipheredData.data;
        } else {
            console.log("!!!!!!!!!!! secret is not match !!!!!!!!!!!");
            return null;
        }
    };
}
