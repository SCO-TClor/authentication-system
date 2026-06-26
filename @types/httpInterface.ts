// Data Sender:
type sendData = {
    email: string,
    password: string
};

type userStatus = 'active' | 'inactive' | 'suspended' | 'banned';

interface usersDatabase {
    id: number,
    name: string,
    email: string,
    password_hash: string,
    status: userStatus,
    email_verified: boolean,
    locked_until: Date | null,
    created_at: Date,
    updated_at: Date,
    verification_token: string | null,
    verification_expires: Date | null,
    refresh_token: string | null,
}

type SignUpData = {
    name: string,
    email: string,
    password: string
};

interface JwtData {
    refresh_token: string,
    token: string,
    user: {
        id: number,
        name: string,
        email: string,
        verified: boolean
    }
};

interface verifier {
    email: string,
    token: string
}

interface refreshPayload {
    userID: string,
    iat: number,
    exp: number
};

export { sendData, usersDatabase, SignUpData, JwtData, refreshPayload, verifier };