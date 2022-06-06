import { AuthenticationDetails, CognitoUser, CognitoUserAttribute, CognitoUserPool } from "amazon-cognito-identity-js";
import { UserPoolClientId, UserPoolId } from "../../BackendConfig";

export type SignInResult = {
    accessToken: string
    idToken: string
    refreshToken: string
    userId: string
}

export class CognitoClient {
    // (1) member
    //// (1-1) Pool
    private _userPool: CognitoUserPool;

    // (2) Constructor
    constructor() {
        this._userPool = new CognitoUserPool({
            UserPoolId: UserPoolId,
            ClientId: UserPoolClientId,
        });
    }

    // (3) Methods
    //// (3-1) Sign in
    signIn = async (userId: string, password: string): Promise<SignInResult> => {
        const authenticationDetails = new AuthenticationDetails({
            Username: userId,
            Password: password,
        });
        const cognitoUser = new CognitoUser({
            Username: userId,
            Pool: this._userPool,
        });

        const p = new Promise<SignInResult>((resolve, reject) => {
            cognitoUser.authenticateUser(authenticationDetails, {
                onSuccess: (result) => {
                    const res: SignInResult = {
                        accessToken: result.getAccessToken().getJwtToken(),
                        idToken: result.getIdToken().getJwtToken(),
                        refreshToken: result.getRefreshToken().getToken(),
                        userId: userId
                    }
                    resolve(res);
                },
                onFailure: (err) => {
                    reject(err);
                },
            });
        });
        const res = await p;
        return res;
    };

    //// (3-2) Sign up
    signUp = async (userId: string, password: string) => {
        const attributeList = [
            new CognitoUserAttribute({
                Name: "email",
                Value: userId,
            }),
        ];
        const p = new Promise<void>((resolve, reject) => {
            this._userPool.signUp(userId, password, attributeList, [], (err, result) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
        await p;
        return;
    };

    //// (3-3) Verify Code
    verify = async (userId: string, verifyCode: string) => {
        const cognitoUser = new CognitoUser({
            Username: userId,
            Pool: this._userPool,
        });

        const p = new Promise<void>((resolve, reject) => {
            cognitoUser.confirmRegistration(verifyCode, true, (err: any) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
        await p;
        return;
    };

    //// (3-4) Re-send Verify Code
    resendVerification = async (userId: string) => {
        const cognitoUser = new CognitoUser({
            Username: userId,
            Pool: this._userPool,
        });
        const p = new Promise<void>((resolve, reject) => {
            cognitoUser.resendConfirmationCode((err: any) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
        await p;
        return;
    };


    //// (3-5) Forgot Password (Request Code)
    sendVerificationCodeForChangePassword = async (userId: string) => {
        const cognitoUser = new CognitoUser({
            Username: userId,
            Pool: this._userPool,
        });
        const p = new Promise<void>((resolve, reject) => {
            cognitoUser.forgotPassword({
                onSuccess: (data) => {
                    resolve();
                },
                onFailure: (err) => {
                    reject(err);
                },
            });
        });
        await p;
        return;
    };

    //// (3-6) New/Change Password
    changePassword = async (userId: string, verifycode: string, password: string) => {
        const cognitoUser = new CognitoUser({
            Username: userId,
            Pool: this._userPool,
        });

        const p = new Promise<void>((resolve, reject) => {
            cognitoUser.confirmPassword(verifycode, password, {
                onSuccess: () => {
                    resolve();
                },
                onFailure: (err) => {
                    reject(err);
                },
            });
        });
        await p;
        return;
    };

    //// (3-7) Sign out
    signOut = async (userId: string) => {
        const cognitoUser = new CognitoUser({
            Username: userId,
            Pool: this._userPool,
        });
        cognitoUser.signOut();
    };
}
