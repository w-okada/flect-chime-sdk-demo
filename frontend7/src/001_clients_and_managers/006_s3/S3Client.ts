import * as STS from "@aws-sdk/client-sts"
import * as S3 from '@aws-sdk/client-s3';

export class S3Client {
    putObject = (credentials: STS.Credentials, bucketName: string, key: string, body: string | Blob | Uint8Array | Buffer) => {
        const s3 = new S3.S3Client({
            credentials: {
                accessKeyId: credentials.AccessKeyId!,
                secretAccessKey: credentials.SecretAccessKey!,
                sessionToken: credentials.SessionToken!
            },
            region: "us-east-1"
        })
        s3.send(
            new S3.PutObjectCommand({
                Bucket: bucketName,
                Key: key,
                Body: body
            })
        )
    }

}
