import * as http from 'http';
import { StatusCode } from '../@types/headWriter';

function debuggerEndPoints(
    StatusC: number,
    debug: boolean,
    info?: string
) {
    if(debug) console.log('');

    switch (StatusC) {
        case StatusCode.NotFound:
            if(debug) console.log('!>--------!> NotFound <!---------<!');
            break;

        case StatusCode.Conflict:
            if(debug) console.log('!>--------!> Conflict <!---------<!');
            break;

        case StatusCode.Unauthorized:
            if(debug) console.log('!>------!> Unauthorized <!-------<!');
            break;
        
        case StatusCode.BadRequest:
            if(debug) console.log('!>-------!> BadRequest <!--------<!');
            break;
        
        case StatusCode.MethodNotAllowed:
            if(debug) console.log('!>----!> MethodNotAllowed <!-----<!');
            break;
        
        case StatusCode.OK:
            if(debug) console.log('<>---------<> Sucess <>----------<>');
            break;
        default:
            break;
    };

    if(debug && info) console.log(`Information | ${info}`);
    if(debug) console.log(`StatusCode  | ${StatusC}`);
    if(debug) console.log('');
    let endSymbolOne = '!';
    let endSymbolTwo = '!';

    if(StatusC === StatusCode.OK) {
        endSymbolOne = '<';
        endSymbolTwo = '>';
    };

    if(debug) console.log(`${endSymbolOne}>-----------${endSymbolOne}> End <${endSymbolTwo}-----------<${endSymbolTwo}`);
};

type code =
      'AUTH_001'
    | 'AUTH_002'
    | 'AUTH_003'
    | 'AUTH_004'
    | 'AUTH_005'
    | 'AUTH_006'
    | 'AUTH_007'
    | 'AUTH_008'
    | 'AUTH_009'
    | 'AUTH_010'
    | 'AUTH_011'
    | 'AUTH_012'
    | 'AUTH_0121'
    | 'AUTH_0122'
    | 'AUTH_013'
    | 'AUTH_014'
    | 'AUTH_015'
    | 'AUTH_016'
    | 'AUTH_017'
    | 'AUTH_018'

    | 'PROD_001'
    | 'PROD_002'
    | 'PROD_003'
    | 'PROD_004'
    | 'PROD_005'
    | 'PROD_006'
    | 'PROD_007'
    | 'PROD_008'
    | 'PROD_009'
    | 'PROD_010'
    | 'PROD_011'

    | 'MAIN_001'
    | 'MAIN_002'
    | 'MAIN_003'
    | 'MAIN_004'
    | 'MAIN_005'
    ;

function codeCase(
    res: http.ServerResponse,
    codee: code,
    debug: boolean,
    step: number,
    data?: any
) {
    if(debug) console.log('');
    if(debug) console.log('!>------!> endPoints.ts <!-------<!');
    if(debug) console.log(`function | codeCase()`);
    if(debug) console.log(`at step  | ${step}`);
    if(debug) console.log(`code     | > ${codee} <`);


    const error_type = {
        // Authentication Lobby:    // ------ // ------ // ------ // ------ // ------ //
        AUTH_001: { // BadRequest
            status: 'error',
            code: StatusCode.BadRequest,
            info: 'Missing important information',
            more_info: 'email OR password doesn\'t exist'
        },
        AUTH_002: { // Unauthorized
            status: 'error',
            code: StatusCode.Unauthorized,
            info: 'Incorrect email password',
            more_info: 'Password sended doesn\'t match with the password in the database'
        },
        AUTH_003: {
            status: 'error',
            code: StatusCode.Unauthorized,
            info: 'Email wasn\'t verified',
            more_info: 'Email need to be verified!'
        },
        AUTH_004: {
            status: 'error',
            code: StatusCode.Unauthorized,
            info: 'Refresh_cookie does not exist!',
            more_info: 'Cookie de refresh não existe. necessário o login'
        },
        AUTH_005: {
            status: 'error',
            code: StatusCode.Unauthorized,
            info: 'refresh token doesn\'t match!',
            more_info: 'refresh token sended doesn\'t match with the one in the database'
        },
        AUTH_006: {
            status: 'error',
            code: StatusCode.Unauthorized,
            info: 'Token missing',
            more_info: 'Authorization header not provided'
        },
        AUTH_007: {
            status: 'error',
            code: StatusCode.Unauthorized,
            info: 'JWT expired',
            more_info: 'JWT não autorizado no middleware'
        },
        AUTH_008: {
            status: 'error',
            code: StatusCode.Unauthorized,
            info: 'Verification Token expired!',
            more_info: 'Token sended does not work anymore!'
        },
        AUTH_009: {
            status: 'error',
            code: StatusCode.Unauthorized,
            info: 'Verification Token invalid!',
            more_info: 'Email token verification does not match!'
        },
        AUTH_010: { // Conflict
            status: 'error',
            code: StatusCode.Conflict,
            info: 'Email already exist',
            more_info: 'Error trying to sign up with an existent email in the database!'
        },
        AUTH_011: { // NotFound
            status: 'error',
            code: StatusCode.NotFound,
            info: 'Email not found!',
            more_info: 'Failed to find user in the database'
        },
        AUTH_012: {
            status: 'error',
            code: StatusCode.NotFound,
            info: 'Token not issued',
            more_info: 'Token doesn\'t exist in the database'
        },
        AUTH_0121: {
            status: 'error',
            code: StatusCode.NotFound,
            info: 'Refresh token invalid!',
            more_info: 'Refresh token either expired or is invalid'
        },
        AUTH_0122: {
            status: 'error',
            code: StatusCode.NotFound,
            info: 'Tenant id NotFound!',
            more_info: 'Tenant-id NotFound in the database'
        },
        AUTH_013: { // SUCESS
            status: 'success',
            code: StatusCode.OK,
            info: 'Email verification sended',
            more_info: 'Sended email verification for user email!'
        },
        AUTH_014: {
            status: 'success',
            code: StatusCode.OK,
            info: 'Email already verified',
            more_info: 'Email has already been verified!'
        },
        AUTH_015: {
            status: 'success',
            code: StatusCode.OK,
            info: 'Email verified!',
            more_info: 'Email has been verified successfully'
        },
        AUTH_016: {
            status: 'success',
            code: StatusCode.OK,
            info: 'Login successful',
            more_info: 'User logged in successfully!'
        },
        AUTH_017: {
            status: 'success',
            code: StatusCode.Created,
            info: 'success creating token',
            more_info: 'Access token created and sended sucessfully'
        },
        AUTH_018: {
            status: 'success',
            code: StatusCode.Created,
            info: 'Email created sucessfully',
            more_info: 'Email sucessfully inserted into the database'
        },
        // Production Lobby:        // ------ // ------ // ------ // ------ // ------ // 
        PROD_001: {
            status: 'error',
            code: StatusCode.BadRequest,
            info: 'Missing important information',
            more_info: 'title AND price are required'
        },
        PROD_002: {
            status: 'error',
            code: StatusCode.BadRequest,
            info: 'Missing important information',
            more_info: 'tenant_id not provided / Tenant_id required!'
        }, // 
        PROD_003: {
            status: 'error',
            code: StatusCode.Unauthorized,
            info: 'Missing important information',
            more_info: 'userID was not provided / user_id required!'
        },
        PROD_004: {
            status: 'error',
            code: StatusCode.Conflict,
            info: 'Product already exist!',
            more_info: 'Produto já existe no banco de dados!'
        },
        PROD_005: {
            status: 'created',
            code: StatusCode.Created,
            info: 'Product created',
            more_info: 'Product created successfully!'
        },
        PROD_006: {
            status: 'success',
            code: StatusCode.OK,
            info: 'Products readed',
            more_info: 'Product readed successfully!'
        },
        PROD_007: {
            status: 'error',
            code: StatusCode.BadRequest,
            info: 'Missing products information',
            more_info: 'Products information not provided!'
        },
        PROD_008: {
            status: 'success',
            code: StatusCode.OK,
            info: 'Product updated',
            more_info: 'Product information updated successfully!'
        },
        PROD_009: {
            status: 'error',
            code: StatusCode.NotFound,
            info: 'Product not found',
            more_info: 'Product information not found in the database!'
        },
        PROD_010: {
            status: 'success',
            code: StatusCode.NoContent,
            info: 'Product deleted successfully',
            more_info: 'Product information deleted successfully in the database!'
        },
        PROD_011: {
            status: 'error',
            code: StatusCode.BadRequest,
            info: 'Product id route is NaN',
            more_info: 'Product id provided needs to be a number!'
        },
        // General Lobby:           // ------ // ------ // ------ // ------ // ------ //
        MAIN_001: {
            status: 'error',
            code: StatusCode.MethodNotAllowed,
            info: 'Method Not Found',
            more_info: 'Method wasn\'t created yet!'
        },
        MAIN_002: {
            status: 'error',
            code: StatusCode.InternalServerError,
            info: 'Server Error',
            more_info: 'Internal Error Catched!'
        },
        MAIN_003: {
            status: 'error',
            code: StatusCode.NotFound,
            info: 'Origin NotFound',
            more_info: 'Origin designation wasn\'t expected!'
        },
        MAIN_004: {
            status: 'error',
            code: StatusCode.NotFound,
            info: 'Route NotFound',
            more_info: 'Route does not exist!'
        },
        MAIN_005: {
            status: 'error',
            code: StatusCode.NotFound,
            info: 'AuthRoute NotFound',
            more_info: 'AuthRoute does not exist!'
        },
    } as const;

    const payload = error_type[codee];
    if(!payload) {
        console.log('CODIGO NÃO IMPLEMENTADO!!!!');
        console.log(`CÓDIGO: > ${codee} <`);
        
        res.writeHead(StatusCode.InternalServerError, { "content-type": "application/json" });
        res.end(JSON.stringify({
            status: 'error', 
            code: `${StatusCode.InternalServerError}, InternalServerError`, 
            type: codee, 
            message: { 
                step: `Error at | step ${step}`, 
                info: 'Unknown code', 
                more_info: ''
            }
        }));
        return;
    };

    debuggerEndPoints(payload.code, debug);

    res.writeHead(payload.code, { "content-type": "application/json" });
    res.end(JSON.stringify({
        status: payload.status,
        code: `${payload.code}`,
        type: codee,
        message: {
            step: `${payload.status != 'error' ? 'Success' : 'Error' } at | ${step}`,
            info: payload.info,
            more_info: payload.more_info
        },
        data: data || null
    }));
    return;
};

export { code, codeCase };