import { RemovalPolicy, Duration } from "aws-cdk-lib"
import { aws_s3 as s3 } from "aws-cdk-lib"
import { aws_cloudfront as cloudfront } from "aws-cdk-lib"
import { aws_iam as iam } from "aws-cdk-lib"
import { Construct } from 'constructs';

export const createFrontendS3 = (scope: Construct, id: string, USE_CDN: boolean) => {
    const frontendBucket = new s3.Bucket(scope, "StaticSiteBucket", {
        bucketName: `${id}-Bucket`.toLowerCase(),
        removalPolicy: RemovalPolicy.DESTROY,
        publicReadAccess: true,
    });


    let frontendCdn: cloudfront.CloudFrontWebDistribution | null = null;
    if (USE_CDN) {
        const oai = new cloudfront.OriginAccessIdentity(scope, "my-oai");

        const myBucketPolicy = new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ["s3:GetObject"],
            principals: [new iam.CanonicalUserPrincipal(oai.cloudFrontOriginAccessIdentityS3CanonicalUserId)],
            resources: [frontendBucket.bucketArn + "/*"],
        });
        frontendBucket.addToResourcePolicy(myBucketPolicy);

        // Create CloudFront WebDistribution
        frontendCdn = new cloudfront.CloudFrontWebDistribution(scope, "WebsiteDistribution", {
            viewerCertificate: {
                aliases: [],
                props: {
                    cloudFrontDefaultCertificate: true,
                },
            },
            priceClass: cloudfront.PriceClass.PRICE_CLASS_ALL,
            originConfigs: [
                {
                    s3OriginSource: {
                        s3BucketSource: frontendBucket,
                        originAccessIdentity: oai,
                    },
                    behaviors: [
                        {
                            isDefaultBehavior: true,
                            minTtl: Duration.seconds(0),
                            maxTtl: Duration.days(365),
                            defaultTtl: Duration.days(1),
                            pathPattern: "my-contents/*",
                        },
                    ],
                },
            ],
            errorConfigurations: [
                {
                    errorCode: 403,
                    responsePagePath: "/index.html",
                    responseCode: 200,
                    errorCachingMinTtl: 0,
                },
                {
                    errorCode: 404,
                    responsePagePath: "/index.html",
                    responseCode: 200,
                    errorCachingMinTtl: 0,
                },
            ],
        });
    }
    return { frontendBucket, frontendCdn }
}