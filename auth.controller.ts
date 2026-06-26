import * as http from 'http';
import { dataDrain } from './utils/dataDrainer';
import { sendData, SignUpData, verifier } from './@types/httpInterface';
import { loginService, refreshService, signupService, verifyEmailService, verifyService } from './auth.service';
import { StatusCode } from './@types/headWriter';
import { HttpError } from './utils/ThrowError';
import { debuggerController } from './utils/debuggers';
import { codeCase } from './utils/endPoints';
import { emailInternalServerError } from './utils/emailSender';
import { setCookies } from './utils/cookieSetter';

const archive = 'auth.controller.ts';

async function sendVerifyEmail(     // Email verify sender
    req: http.IncomingMessage,
    res: http.ServerResponse,
    routes: Array<string>,
    debug: boolean,
    step: number
) {
    if(debug) console.log('');
    step = debuggerController(archive, 'sendVerifyEmail()', req, debug, step);
    
    try {
        const { email } = JSON.parse(await dataDrain(req));

        const response = await verifyService(email, debug, step);

        if(response === true) {
            codeCase(res, 'AUTH_013', debug, step);
        };

        return;
    } catch (error) {
        if(debug) console.log('!--!> auth.controller / Error <!--!');
        if(error instanceof HttpError) {
            if(debug) console.log(`Step     | ${error.step}`);
            if(debug) console.log(`Error at | ${error.at}`);
            if(debug) console.log(`Info     | ${error.info}`);
            if(debug) console.log(`StatusC  | ${error.statuscode}`);

            if(error.statuscode === StatusCode.NotFound && error.at === 'getProfile()') {
                codeCase(res, 'AUTH_011', debug, step);
                return;
            };
            if(error.statuscode === StatusCode.OK) {
                codeCase(res, 'AUTH_014', debug, step);
                return;
            };
        };
    };
};

async function verifyEmail(         // Email verifier
    req: http.IncomingMessage,
    res: http.ServerResponse,
    routes: Array<string>,
    debug: boolean,
    step: number
) {
    if(debug) console.log('');
    step = debuggerController(archive, 'verifyEmail()', req, debug, step);

    try {
        const newURL = new URL(req.url || '/', process.env.SERVER_ADDRESS);
        const verify_combo: verifier = {
            email: newURL.searchParams.get('email') || '',
            token: newURL.searchParams.get('token') || ''
        };
        
        if(!verify_combo.email || !verify_combo.token) {
            throw new HttpError(StatusCode.NotFound, 'auth.controller.ts/verifyEmail()', 'Failed to update email verification', step);
        };

        console.log(verify_combo);
        
        if(await verifyEmailService(verify_combo, debug, step)) {
            codeCase(res, 'AUTH_015', debug, step);
            return;
        };
        throw new Error('À implementar');

    } catch (error) {
        if(debug) console.log('!--!> auth.controller / Error <!--!');
        if(debug) console.log(`Failed at | step ${step}`);
        if(error instanceof HttpError) {
            if(debug) console.log(`Step     | ${error.step}`);
            if(debug) console.log(`Error at | ${error.at}`);
            if(debug) console.log(`Info     | ${error.info}`);
            if(debug) console.log(`StatusC  | ${error.statuscode}`);
            if(error.partCode === 'MAIN_002' || (error.statuscode === StatusCode.NotFound && error.info === 'Failed to update email verification')) {
                codeCase(res, 'MAIN_002', debug, step);
                await emailInternalServerError('Failed to update email verification at verifyService()', 'setVerifyToken()', step, debug)
                return;
            };
            if(error.partCode) {
                codeCase(res, error.partCode, debug, step);
                return;
            };
        };
    };
};

async function signup(              // Sign up
    req: http.IncomingMessage,
    res: http.ServerResponse,
    routes: Array<string>,
    debug: boolean,
    step: number
) {
    if(debug) console.log('');
    step = debuggerController(archive, 'signup()', req, debug, step);

    try {
        const { name, email, password } = JSON.parse(await dataDrain(req));
        const data: SignUpData = {
            name: name.trim(),
            email: email.trim(),
            password: password.trim()
        };

        await signupService(data, debug, step);

        codeCase(res, 'AUTH_018', debug, step);
        return;
        
    } catch (error) {
        if(debug) console.log('!-> platform.controller / Error <-!');
        if(debug) console.log(`Failed at | step ${step}`);
        if(error instanceof HttpError) {
            if(error.partCode) {
                codeCase(res, error.partCode, debug, step);
                return;
            };
            codeCase(res, 'MAIN_002', debug, step);
            return;
        };
        codeCase(res, 'MAIN_002', debug, step);
        return;
    };
};

async function login(               // Log in
    req: http.IncomingMessage,
    res: http.ServerResponse,
    routes: Array<string>,
    debug: boolean,
    step: number
) {
    if(debug) console.log('');
    step = debuggerController(archive, 'login()', req, debug, step);

    try {
        const { email, password } = JSON.parse(await dataDrain(req));
        const data: sendData = {
            email: email.trim(),
            password: password.trim()
        };

        if(!email || !password) {
            codeCase(res, 'AUTH_001', debug, step);
            return;
        };

        console.log(data);

        // Sucesso:
        const result = await loginService(data, debug, step);
        console.log('resultado:', result);

        setCookies(res, 'access_cookie', result.token, 'm', 15, '/', true);
        setCookies(res, 'refresh_cookie', result.refresh_token, 'd', 7, '/platform/auth/refresh', true);

        codeCase(res, 'AUTH_016', debug, step)
        return;
        
    } catch (error) {
        if(debug) console.log('!--!> auth.controller / Error <!--!');
        if(debug) console.log(`Failed at | step ${step}`);
        if(error instanceof HttpError) {
            if(error.partCode) {
                codeCase(res, error.partCode, debug, step);
                return;
            };
            codeCase(res, 'MAIN_002', debug, step);
            return;
        };
        codeCase(res, 'MAIN_002', debug, step);
        return;
    };
};

async function refresh(             // Refresh token
    req: http.IncomingMessage,
    res: http.ServerResponse,
    routes: Array<string>,
    debug: boolean,
    step: number
) {
    if(debug) console.log('');
    step = debuggerController(archive, 'refresh()', req, debug, step);

    try {
        const cookie = req.headers.cookie || '';
        let Auth: {
            [key :string]: string
        } = {};

        const m = cookie.split(';');
        Auth = m.reduce((obj, current) => {
            const [ chave, valor ] = current.split('=');
            obj[chave.trim()] = valor.trim();
            return obj;
        }, Auth);

        console.log(Auth);

        if(!Auth.refresh_cookie) {
            codeCase(res, 'AUTH_004', debug, step);
            return;
        };

        const token = await refreshService(Auth.refresh_cookie, debug, step);

        setCookies(res, 'access_cookie', token, 'm', 15, '/', true);
        
        codeCase(res, 'AUTH_017', debug, step)
        return;

    } catch (error) {
        if(debug) console.log('!-> platform.controller / Error <-!');
        if(debug) console.log(`Failed at | step ${step}`);
        if(error instanceof HttpError) {
            if(error.partCode) {
                codeCase(res, error.partCode, debug, step);
                return;
            };
            codeCase(res, 'MAIN_002', debug, step);
            return;
        };
        codeCase(res, 'MAIN_002', debug, step);
        return;
    };
};

async function logOut(              //
    req: http.IncomingMessage,
    res: http.ServerResponse,
    routes: Array<string>,
    debug: boolean,
    step: number
) {
    if(debug) console.log('');
    step = debuggerController(archive, 'logOut()', req, debug, step);
    
    try {
        
    } catch (error) {
        
    };
};

async function changePassword(      //
    req: http.IncomingMessage,
    res: http.ServerResponse,
    routes: Array<string>,
    debug: boolean,
    step: number
) {
    if(debug) console.log('');
    step = debuggerController(archive, 'changePassword()', req, debug, step);
    
    try {
        
    } catch (error) {
        
    };
};

async function forgotPassword(      //
    req: http.IncomingMessage,
    res: http.ServerResponse,
    routes: Array<string>,
    debug: boolean,
    step: number
) {
    if(debug) console.log('');
    step = debuggerController(archive, 'forgotPassword()', req, debug, step);
    
    try {
        
    } catch (error) {
        
    };
};

async function resetPassword(       //
    req: http.IncomingMessage,
    res: http.ServerResponse,
    routes: Array<string>,
    debug: boolean,
    step: number
) {
    if(debug) console.log('');
    step = debuggerController(archive, 'resetPassword()', req, debug, step);
    
    try {
        
    } catch (error) {
        
    };
};

export { sendVerifyEmail, verifyEmail, signup, login, refresh };