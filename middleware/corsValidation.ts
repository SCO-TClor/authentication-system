import * as http from 'http';
import { StatusCode } from '../@types/headWriter';

function CORS_validator(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    allowedOrigins: {
        platform: string,
        clients: string
    },
    debug: boolean
): boolean {
    if(debug) console.log('');
    if(debug) console.log('>------> corsValidation.ts <------<');
    
    console.log('Origin header:', req.headers.origin);
    console.log('Referer:', req.headers.referer);
    console.log('Method:', req.method);
    
    console.log(`Barrier | ${req.method}`);

    const origin = req.headers.origin;
    const clients = allowedOrigins.clients;
    const platform = allowedOrigins.platform;
    
    if(origin && (clients === origin || clients === origin.concat('/') || platform == origin || platform.concat('/'))) {

        res.setHeader("access-control-allow-origin", origin);
        res.setHeader("access-control-allow-methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
        res.setHeader("access-control-allow-headers", "Content-Type, Cookie");
        res.setHeader("access-control-expose-headers", "Content-Type");
        res.setHeader("access-control-allow-credentials", "true");
    };
    if(req.method === "OPTIONS") {
        res.writeHead(StatusCode.OK);
        res.end();
        return true;
    };
    return false;
};

export default CORS_validator;