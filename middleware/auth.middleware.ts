import * as http from 'http';
import * as jwt from 'jsonwebtoken';
import { HttpError } from '../utils/ThrowError';
import { codeCase } from '../utils/response';

interface JwtPayload {
    userId: string,
    email: string
};

interface tenantUser {
    tenant_id: string,
    role: string
};

interface middleware extends JwtPayload, tenantUser {};

async function authMiddleware(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    envS: string,
    debug: boolean,
    step: number
) {
    if(debug) console.log('');
    if(debug) console.log('>-----> auth.middleware.ts <------<');
    if(debug) console.log(`Step    | ${step}`);
    step++;

    try {
        const cookie = req.headers.cookie || '';
        const secret = envS || '';

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
};

export { authMiddleware };