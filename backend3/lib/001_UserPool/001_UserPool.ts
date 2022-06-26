import { aws_cognito as cognito, Duration } from "aws-cdk-lib"
import { Construct } from 'constructs';

export const createUserPool = (scope: Construct, id: string) => {
    const userPool = new cognito.UserPool(scope, `${id}_UserPool`, {
        userPoolName: `${id}_UserPool`,
        selfSignUpEnabled: true,
        autoVerify: {
            email: true,
        },
        passwordPolicy: {
            minLength: 6,
            requireSymbols: false,
        },
        signInAliases: {
            email: true,
        },
    });

    const userPoolClient = new cognito.UserPoolClient(scope, id + "_UserPool_Client", {
        userPoolClientName: `${id}_UserPoolClient`,
        userPool: userPool,
        accessTokenValidity: Duration.minutes(1440),
        idTokenValidity: Duration.minutes(1440),
        refreshTokenValidity: Duration.days(30),
    });

    return { userPool, userPoolClient }
}