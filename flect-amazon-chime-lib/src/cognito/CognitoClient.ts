import { AuthenticationDetails, CognitoUser, CognitoUserAttribute, CognitoUserPool } from "amazon-cognito-identity-js";

export class CognitoClient {
    private _userPool: CognitoUserPool;
    private _userId: string | null = null;
    get userId(): string | null {
        return this._userId;
    }
    set userId(val: string | null) {
        this._userId = val;
    }
    private _password: string | null = null;
    get password(): string | null {
        return this._password;
    }

    private _idToken: string | null = null;
    get idToken(): string | null {
        return this._idToken;
    }
    set idToken(val: string | null) {
        this._idToken = val;
    }
    private _accessToken: string | null = null;
    get accessToken(): string | null {
        return this._accessToken;
    }
    set accessToken(val: string | null) {
        this._accessToken = val;
    }
    private _refreshToken: string | null = null;
    get refreshToken(): string | null {
        return this._refreshToken;
    }
    set refreshToken(val: string | null) {
        this._refreshToken = val;
    }

    constructor(userPoolId: string, clientId: string, defaultUserId: string | null = null, defaultPassword: string | null = null) {
        this._userPool = new CognitoUserPool({
            UserPoolId: userPoolId,
            ClientId: clientId,
        });
        this._userId = defaultUserId;
        this._password = defaultPassword;
    }

    // (1) Sign in
    signIn = async (userId: string, password: string) => {
        const authenticationDetails = new AuthenticationDetails({
            Username: userId,
            Password: password,
        });
        const cognitoUser = new CognitoUser({
            Username: userId,
            Pool: this._userPool,
        });

        const p = new Promise<void>((resolve, reject) => {
            cognitoUser.authenticateUser(authenticationDetails, {
                onSuccess: (result) => {
                    this._accessToken = result.getAccessToken().getJwtToken();
                    this._idToken = result.getIdToken().getJwtToken();
                    this._refreshToken = result.getRefreshToken().getToken();
                    this._userId = userId;

                    console.log(`idtoken`, this._idToken);
                    console.log(`accesstoken`, this._accessToken);
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

    // (2) Sign up
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

    // (3) Verify Code
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

    // (4) Resend Verify Code
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

    // (5) Forgot Password
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

    // (6) New Password
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

    // (x) Sign out
    signOut = async (userId: string) => {
        const cognitoUser = new CognitoUser({
            Username: userId,
            Pool: this._userPool,
        });
        cognitoUser.signOut();
    };
}
