import { AuthConfig } from './authType';
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import nodemailer from "nodemailer";
import type { StringValue } from "ms";
import { codeCase } from '../utils/response';
import { IncomingMessage } from 'http';
import { ServerResponse } from 'http';
import { HttpError } from '../utils/ThrowError';
import { JwtData, refreshPayload, sendData, SignUpData, usersDatabase, verifier } from '../@types/httpInterface';
import { PostgresRepository } from '../database/PostgreSQL/auth.repository';
import { StatusCode } from '../@types/headWriter';
import * as crypto from 'crypto';
import { emailVerifier } from '../utils/emailSender';

export { AuthConfig };

let step = 1;
let debug = true;

export class AuthSystem {
    private jwtSecret: string;
    private jwtRefreshSecret: string;
    private saltRounds: number;
    private user: PostgresRepository;

    private mailer?: nodemailer.Transporter;

    constructor(repository: PostgresRepository, config: AuthConfig) {
        this.jwtSecret = config.jwtSecret;
        this.jwtRefreshSecret = config.jwtRefreshSecret;
        this.saltRounds = config.saltRounds ?? 10;
        this.user = repository;

        if(config.mail) {
            this.mailer = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: config.mail.user,
                    pass: config.mail.pass,
                }
            });
        };
    };

    async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, this.saltRounds);
    };

    async comparePassword(password: string, hash: string): Promise<boolean> {
        return await bcrypt.compare(password, hash);
    };

    generateToken(payload: object, expiresIn: StringValue | number): string {
        return jwt.sign(payload, this.jwtSecret, { expiresIn });
    };

    async login(
        data: sendData
    ): Promise<JwtData> {
        if(debug) console.log('');
        if(debug) console.log('>-------> loginService.ts <-------<');
        if(debug) console.log(`Step   | ${step}`);
        step++;
        try {
            console.log(data);
                // Responsabilidade do service
            const exist = await this.user.findUser(data.email);

            if(!exist) {
                throw new HttpError(StatusCode.NotFound, 'login.service.ts', 'Email not found!', step, 'AUTH_011');
            };
            
            const profile: usersDatabase = await this.user.getProfile(data.email);

            if(profile.email_verified === false) {
                throw new HttpError(StatusCode.Unauthorized, 'auth.controller.ts / login()', 'Unverified email!', step, 'AUTH_003');
            };
                
            // Usuário:
            console.log(profile);
            
            // Validação de senha e afins:
            const isValid = await bcrypt.compare(data.password, profile.password_hash);
            if(!isValid) throw new HttpError(StatusCode.Unauthorized, 'loginService()', 'Email password invalid!', step, 'AUTH_002');

            // Captação do JWT SECRET
            const secretToken = String(this.jwtSecret);
            const secretRefreshToken = String(this.jwtRefreshSecret);

            // Agora implementar salvamento no database do refreshtoken por aqui!
            const refresh_token = jwt.sign({
                    userID: profile.id,
                },
                secretRefreshToken,
                { expiresIn: '7d'}
            );

            const response = await this.user.setRefreshToken(profile.email, refresh_token);

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

    async signupService(
        data: SignUpData,
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
            const exist = await this.user.findUser(normalizedData.email);

            if(exist) {
                throw new HttpError(StatusCode.Conflict, 'signupService()', 'Email already exist!', step, 'AUTH_010');
            };

            await this.user.insertUser(
                normalizedData.name,
                normalizedData.email,
                normalizedData.password
            );
        } catch (error) {
            if(error instanceof HttpError && error.partCode) {
                throw error;
            };

            throw new HttpError(StatusCode.InternalServerError, 'signupService()', 'Internal Server Error', step, 'MAIN_002');
        };
    };

    async refreshService(
        refresh_cookie: string,
    ): Promise<string> {
        if(debug) console.log('');
        if(debug) console.log('>-------> refreshService.ts <-------<');
        if(debug) console.log(`Step   | ${step}`);
        step++;

        if(!refresh_cookie) {
            throw new HttpError(StatusCode.Unauthorized, 'refreshService()', 'Refresh_cookie does not exist!', step, 'AUTH_004');
        };

        try {
            const secretRefresh = String(this.jwtRefreshSecret);
            const secretAccess = String(this.jwtSecret);

            const payload = jwt.verify(refresh_cookie, secretRefresh) as refreshPayload;
            const profile = await this.user.getProfileById(payload.userID);

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

    async verifyEmailService(
        verify_combo: verifier
    ): Promise<boolean> {
        const profile: usersDatabase = await this.user.getProfile(verify_combo.email);

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


        const update = await this.user.updateEmail(profile.email);

        if(update.rowCount === 0) {
            throw new HttpError(StatusCode.OK, 'auth.service.ts/verifyEmailService()', 'Server Error', step, 'MAIN_002');
        };
        
        return true;
    }

    async verifyService(
        email: string,
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
        if(debug) console.log('data:  |', email);
        
        const profile: usersDatabase = await this.user.getProfile(email);
        
        if(!profile) {
            throw new HttpError(StatusCode.NotFound, 'getProfile()', 'Failed to find user in the database', step);
        };
        
        if(profile.email_verified === true) {
            throw new HttpError(StatusCode.OK, 'verifyService()', 'User email has already been verified!', step);
        };
        
        const update = await this.user.setVerifyToken(email, token_splt, expires);
        
        if(update.rowCount != 1) {
            throw new HttpError(StatusCode.NotFound, 'setVerifyToken()', 'Failed to update email verification', step);
        };
        
        const sended = await emailVerifier(profile.name, email, token_splt, debug);

        return sended;
    };

    middleware() {
        return async (req: IncomingMessage, res: ServerResponse) => {
            if(debug) console.log('');
            if(debug) console.log('>-----> auth.middleware.ts <------<');
            if(debug) console.log(`Step    | ${step}`);
            step++;

            try {
                const cookie = req.headers.cookie || '';
                const secret = this.jwtSecret || '';

                let Auth: {
                    [key :string]: string
                } = {};

                const m = cookie.split(';');
                Auth = m.reduce((obj, current) => {
                    const [ chave, valor ] = current.split('=');
                    obj[chave.trim()] = valor.trim();
                    return obj;
                }, Auth);

                if(!Auth.access_cookie) {
                    console.log('JWT TOKEN NÃO EXISTE!');
                    codeCase(res, 'AUTH_006', debug, step);
                    return false;
                };

                if(secret === '') {
                    console.log('Secret não capturada pelo .env');
                    console.log('Server side erro');
                    return false;
                };
                
                const payload = jwt.verify(Auth.access_cookie, secret) as JwtPayload;

                console.log('VALIDOU O PAYLOAD');
                console.log(payload);

                req.user = {
                    user_id: payload.userId,
                    email: payload.email,
                };

                console.log(req.user);

                return true;
                
            } catch (error) {
                if(error instanceof HttpError) {
                    if(debug) console.log('Erro ao procurar tenant no database');
                    codeCase(res, 'AUTH_0122', debug, step);
                    return false;
                };
                console.log('JWT expired');
                codeCase(res, 'AUTH_007', debug, step);
                return false;
            };
        }
    }
};