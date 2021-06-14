import { useEffect, useState } from "react"
import { getPresignedURL } from "../../api/api"

import * as AWS from "aws-sdk";
const bucketName = "f-backendstack-dev-bucket"
const s3 = new AWS.S3({ params: { Bucket: bucketName } });




type UseS3FileUploader = {
    idToken?: string, 
    accessToken?: string, 
    refreshToken?: string
}


export const useS3FileUploader = (props:UseS3FileUploader) =>{

    // const uploadFileToS3 = async (key:string, data: Uint8Array) => {
    //     const postInfo = await getPresignedURL(key, props.idToken!, props.accessToken!, props.refreshToken!)
    //     console.log(`[getPresignedURLFromServer] ${postInfo.result}`)
    //     console.log(`[getPresignedURLFromServer] ${postInfo.url}`)
    //     console.log(`[getPresignedURLFromServer] ${postInfo.fields}`)

    //     const multiPartParams = postInfo.fields.ContentType ? postInfo.fields : {ContentType : "video/mp4" , ...postInfo.fields};

    //     const multiPartUploadResult = await s3.createMultipartUpload(multiPartParams).promise();
    //     // const formData = new FormData();
    //     // formData.append("Content-Type", "video/mp4");
    //     //     Object.entries(postInfo.fields).forEach(([k, v]) => {
    //     //         formData.append(k, v);
    //     //     });
    //     // formData.append("file", file); 




    // }
    // return {uploadFileToS3}
}
