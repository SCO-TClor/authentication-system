import { auth, authConfig } from './core/auth.instance';

export type { sendData, usersDatabase, SignUpData, JwtData, refreshPayload, verifier } from './@types/httpInterface';

export { sendVerifyEmail, verifyEmail, signup, login, refresh } from './auth.controller';
export { auth, authConfig };