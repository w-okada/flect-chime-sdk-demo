import { useMemo, useRef } from "react"
import * as STS from "@aws-sdk/client-sts"
import { S3Client } from "../001_clients_and_managers/006_s3/S3Client"
import { Bucket } from "../BackendConfig"


export type S3ClientState = {}
export type S3ClientStateAndMethod = S3ClientState & {
    setCredentials: (credentials: STS.Credentials) => void
    putObject: (key: string, body: string | Blob | Uint8Array | Buffer) => Promise<void>
}

export const useS3Client = (): S3ClientStateAndMethod => {
    const client = useMemo(() => {
        const c = new S3Client()
        return c
    }, [])

    const credentialsRef = useRef<STS.Credentials | null>(null)

    const setCredentials = (credentials: STS.Credentials) => {
        credentialsRef.current = credentials
    }

    const putObject = async (key: string, body: string | Blob | Uint8Array | Buffer) => {
        if (!credentialsRef.current) {
            console.warn("S3 Credential is null")
            return
        }
        client.putObject(credentialsRef.current, Bucket, key, body)
    }

    const retVal: S3ClientStateAndMethod = {
        setCredentials,
        putObject
    }
    return retVal
}