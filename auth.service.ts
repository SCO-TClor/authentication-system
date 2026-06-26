import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { findUser, getProfile, getProfileById, insertUser, setRefreshToken, setVerifyToken, updateEmail } from "./auth.repository";
import { HttpError } from "./utils/ThrowError";
import { StatusCode } from "./@types/headWriter";
import { JwtData, SignUpData, refreshPayload, sendData, usersDatabase, verifier } from "./@types/httpInterface";
import { emailVerifier } from "./utils/emailSender";

async function loginService(
    data: sendData,
    debug: boolean,
    step: number
): Promise<JwtData> {
    if(debug) console.log('');
    if(debug) console.log('>-------> loginService.ts <-------<');
    if(debug) console.log(`Step   | ${step}`);
    step++;
    try {
            // Responsabilidade do service
        const exist = await findUser(data.email, debug, step);

        if(!exist) {
            throw new HttpError(StatusCode.NotFound, 'login.service.ts', 'Email not found!', step, 'AUTH_011');
        };
        
        const profile: usersDatabase = await getProfile(data.email, debug, step);

        if(profile.email_verified === false) {
            throw new HttpError(StatusCode.Unauthorized, 'auth.controller.ts / login()', 'Unverified email!', step, 'AUTH_003');
        };
        
        // const name = data.name;
        const password = data.password;
            
        // Usuário:
        console.log(profile);
        
        // Validação de senha e afins:
        const isValid = await bcrypt.compare(password, profile.password_hash);
        if(!isValid) throw new HttpError(StatusCode.Unauthorized, 'loginService()', 'Email password invalid!', step, 'AUTH_002');

        // Captação do JWT SECRET
        const secretToken = String(process.env.JWT_SECRET);
        const secretRefreshToken = String(process.env.JWT_REFRESH_SECRET);

        // Agora implementar salvamento no database do refreshtoken por aqui!
        const refresh_token = jwt.sign({
                userID: profile.id,
            },
            secretRefreshToken,
            { expiresIn: '7d'}
        );

        const response = await setRefreshToken(profile.email, refresh_token, debug, step);

        if(response.rowCount != 0) {
            console.log('REFRESH TOKEN SETTADO COM SUCESSO!!');
        } else {
            console.log('DEU PROBLEMA AO SETTAR REFRESH TOKEN!!');
        };

        const token = jwt.sign(
            { 
                userId: profile.id,
                email: profile.email
            },
            secretToken,
            { expiresIn: '15m'}
        );

        return {
            refresh_token,
            token,
            user: {
                id: profile.id,
                name: profile.name,
                email: profile.email,
                verified: profile.email_verified
            }
        };
    } catch (error) {
        if(error instanceof HttpError && error.partCode) {
            throw error;
        };

        throw new HttpError(StatusCode.InternalServerError, 'loginService()', 'Internal Server Error', step, 'MAIN_002');
    };
};

async function signupService(
    data: SignUpData,
    debug: boolean,
    step: number
): Promise<void> {
    if(debug) console.log('');
    if(debug) console.log('>-------> signupService.ts <-------<');
    if(debug) console.log(`Step   | ${step}`);
    step++;

    const normalizedData: SignUpData = {
        name: data.name.trim(),
        email: data.email.trim(),
        password: data.password.trim()
    };

    if(!normalizedData.name || !normalizedData.email || !normalizedData.password) {
        throw new HttpError(StatusCode.BadRequest, 'signupService()', 'Missing important information', step, 'AUTH_001');
    };

    try {
        const exist = await findUser(normalizedData.email, debug, step);

        if(exist) {
            throw new HttpError(StatusCode.Conflict, 'signupService()', 'Email already exist!', step, 'AUTH_010');
        };

        await insertUser(
            normalizedData.name,
            normalizedData.email,
            normalizedData.password,
            debug,
            step
        );
    } catch (error) {
        if(error instanceof HttpError && error.partCode) {
            throw error;
        };

        throw new HttpError(StatusCode.InternalServerError, 'signupService()', 'Internal Server Error', step, 'MAIN_002');
    };
};

async function refreshService(
    refresh_cookie: string,
    debug: boolean,
    step: number
): Promise<string> {
    if(debug) console.log('');
    if(debug) console.log('>-------> refreshService.ts <-------<');
    if(debug) console.log(`Step   | ${step}`);
    step++;

    if(!refresh_cookie) {
        throw new HttpError(StatusCode.Unauthorized, 'refreshService()', 'Refresh_cookie does not exist!', step, 'AUTH_004');
    };

    try {
        const secretRefresh = String(process.env.JWT_REFRESH_SECRET);
        const secretAccess = String(process.env.JWT_SECRET);

        const payload = jwt.verify(refresh_cookie, secretRefresh) as refreshPayload;
        const profile = await getProfileById(payload.userID, debug, step);

        if(!profile || !profile.refresh_token) {
            throw new HttpError(StatusCode.NotFound, 'refreshService()', 'Refresh token invalid!', step, 'AUTH_0121');
        };

        const isValid = await bcrypt.compare(refresh_cookie, profile.refresh_token);

        if(!isValid) {
            throw new HttpError(StatusCode.Unauthorized, 'refreshService()', 'refresh token doesn\'t match!', step, 'AUTH_005');
        };

        return jwt.sign(
            {
                userId: profile.id,
                email: profile.email
            },
            secretAccess,
            { expiresIn: '15m' }
        );
    } catch (error) {
        if(error instanceof HttpError && error.partCode) {
            throw error;
        };

        throw new HttpError(StatusCode.InternalServerError, 'refreshService()', 'Internal Server Error', step, 'MAIN_002');
    };
};

async function verifyService(
    data: string,
    debug: boolean,
    step: number
) {
    if(debug) console.log('');
    if(debug) console.log('>------> verifyService.ts <-------<');
    if(debug) console.log(`Step   | ${step}`);
    step++;

    // Create token:
    const token: string = crypto.randomInt(0,999999).toString().padStart(6, '0');
    const token_splt: string = `${token.slice(0, 3)}-${token.slice(3, 6)}`;

    // Create expire date:
    const expires: Date = new Date(Date.now() + (15 * 60 * 1000));
    
    if(debug) console.log('token: |', token_splt);
    if(debug) console.log('data:  |', data);
    
    const profile: usersDatabase = await getProfile(data, debug, step);
    
    if(!profile) {
        throw new HttpError(StatusCode.NotFound, 'getProfile()', 'Failed to find user in the database', step);
    };
    
    if(profile.email_verified === true) {
        throw new HttpError(StatusCode.OK, 'verifyService()', 'User email has already been verified!', step);
    };
    
    const update = await setVerifyToken(data, token_splt, expires, debug, step);
    
    if(update.rowCount != 1) {
        throw new HttpError(StatusCode.NotFound, 'setVerifyToken()', 'Failed to update email verification', step);
    };
    
    const sended = await emailVerifier(profile.name, data, token_splt, debug);

    return sended;
};

async function verifyEmailService(
    verify_combo: verifier,
    debug: boolean,
    step: number
): Promise<boolean> {
        const profile: usersDatabase = await getProfile(verify_combo.email, debug, step);

        if(profile.email_verified === true) {
            throw new HttpError(StatusCode.OK, 'auth.service.ts/verifyEmailService()', 'Email already verified', step, 'AUTH_014');
        };

        if(profile.verification_token === null || profile.verification_expires === null) {
            throw new HttpError(StatusCode.OK, 'auth.service.ts/verifyEmailService()', 'Token not issued', step, 'AUTH_012');
        };

        const now = new Date();
        if(now > profile.verification_expires) {
            throw new HttpError(StatusCode.OK, 'auth.service.ts/verifyEmailService()', 'Verification Token expired!', step, 'AUTH_008');
        };

        const isValid = await bcrypt.compare(verify_combo.token, profile.verification_token);

        if(!isValid) {
            throw new HttpError(StatusCode.OK, 'auth.service.ts/verifyEmailService()', 'Verification Token invalid!', step, 'AUTH_009');
        };


        const update = await updateEmail(profile.email, debug, step);

        if(update.rowCount === 0) {
            throw new HttpError(StatusCode.OK, 'auth.service.ts/verifyEmailService()', 'Server Error', step, 'MAIN_002');
        };
        
        return true;
}

export { loginService, signupService, refreshService, verifyService, verifyEmailService };