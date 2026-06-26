import pool from "./database/databaseConfig";
import * as bcrypt from 'bcrypt';
import { usersDatabase } from "./@types/httpInterface";
import { HttpError } from "./utils/ThrowError";
import { StatusCode } from "./@types/headWriter";
import { JwtPayload } from "jsonwebtoken";
import { tables } from "./database/databaseEnum";

function debuggerDatabase(
    funcao: string,
    debug: boolean,
    step: number
) {
    if(debug) console.log('');
    if(debug) console.log('>------> auth.repository.ts <-----<');
    if(debug) console.log(`Step     | ${step}`);
    if(debug) console.log(`Function | ${funcao}`);
    step++;
};

async function getUsers(
    debug: boolean,
    step: number
) {
    debuggerDatabase('getUsers()', debug, step);

    try {
        const response = await pool.query('SELECT * FROM plataform.users;');
        console.log(response.rows);
        return response.rows;

    } catch (error) {
        console.log('Erro ao buscar users no database:', error);
        throw error;
    };
};

async function getProfile(
    email: string,
    debug: boolean,
    step: number
) {
    debuggerDatabase('getProfile()', debug, step);

    try {
        const response = await pool.query<usersDatabase>
        (
            `SELECT * FROM ${tables.users} WHERE email = $1`,
            [email]
        );
        return response.rows[0];
    } catch (error) {
        console.log('Erro ao buscar users no database:', error);
        const info = 'getProfile()';
        const message = 'Error trying to push information from database';
        throw new HttpError(StatusCode.NotFound, info, message, step);
    };
};

async function getProfileById(
    id: string | JwtPayload,
    debug: boolean,
    step: number
) {
    debuggerDatabase('getProfileById()', debug, step);

    try {
        const response = await pool.query<usersDatabase>
        (
            `SELECT id,
                    name,
                    email,
                    refresh_token
            FROM ${tables.users} WHERE id = $1`,
            [id]
        );

        if(debug) console.log(response.rows[0]);

        return response.rows[0];
    } catch (error) {
        console.log('Erro ao buscar users no database:', error);
        const info = 'getProfileById()';
        const message = 'Error trying to push information from database';
        throw new HttpError(StatusCode.NotFound, info, message, step);
    };
};

async function findUser(
    email: string,
    debug: boolean,
    step: number,
) {
    debuggerDatabase('findUser()', debug, step);

    try {
        const response = await pool.query<usersDatabase>
        (
            `SELECT * FROM ${tables.users} WHERE email = $1;`,
            [email]
        );
        if(response.rowCount == 1) {
            const exist = true;
            if(debug) console.log(`Email    | ${exist}`);
            return exist;
        }
        else {
            const exist = false
            if(debug) console.log(`Email    | ${exist}`);
            return exist;
        };
    } catch (error) {
        if(debug) console.log('!>---!> dataBaseCrl / Error <!---<!');
        if(debug) console.log(`Failed at:`);
        if(debug) console.log(`Function  | findUser()`);
        if(debug) console.log(`Step      | ${step}`);
        throw new Error(`error     | ${error}`);
    };
};

async function insertUser(
    name    : string, 
    email   : string, 
    password: string,
    debug   : boolean,
    step: number
) {
    debuggerDatabase('insertUser()', debug, step);

    try {
        const status = 'active';
        const hash = await bcrypt.hash(password, 10);

        const insert = await pool.query<usersDatabase>
        (
            `INSERT INTO plataform.users (name, email, password_hash, status) VALUES ($1, $2, $3, $4);`,
            [name, email.trim(), hash, status]
        );


        const response = await pool.query<usersDatabase>
        (
            `SELECT * FROM plataform.users WHERE email = $1;`,
            [email]
        );
        console.log(insert.rows);
        console.log(response.rows);

    } catch (error) {
        console.log('Erro ao inserir usuário no database:', error);
        throw error;
    };
};

async function setVerifyToken(      // For email verification
    email: string,
    token: string,
    expires: Date,
    debug: boolean,
    step: number
) {
    debuggerDatabase('setVerifyToken()', debug, step);

    const token_hash = await bcrypt.hash(token, 10);

    const query = `
        UPDATE plataform.users 
        SET verification_token = $1, 
            verification_expires = $2 
        WHERE email = $3;
    `;
    const update = await pool.query<usersDatabase>(query, [token_hash, expires, email]);

    return update;
};

async function updateEmail(         // For email verification
    email: string,
    debug: boolean,
    step: number
) {
    debuggerDatabase('updateEmail()', debug, step);

    try {
        const query = `
        UPDATE plataform.users
        SET verification_token = $1,
            verification_expires = $2,
            email_verified = $3
        WHERE email = $4;
        `;
        const response = await pool.query<usersDatabase>(
            query, 
            [null, null, true, email]
        );
        return response;

    } catch (error) {
        if(debug) console.log('!>---!> dataBaseCrl / Error <!---<!');
        if(debug) console.log(`Failed at:`);
        if(debug) console.log(`Function  | updateEmail()`);
        if(debug) console.log(`Step      | ${step}`);
        throw new HttpError(StatusCode.NotFound, 'updateEmail()', 'Email not found in the database!', step);
    };
};

async function setRefreshToken(
    email: string,
    refresh_token: any,
    debug: boolean,
    step: number
) {
    debuggerDatabase('setRefreshToken', debug, step);
    
    try {
        const encrypted_refresh = await bcrypt.hash(refresh_token, 10);
    
        const response = await pool.query(`
            UPDATE plataform.users
            SET refresh_token = $1
            WHERE email = $2;
            `,
            [encrypted_refresh, email]
        );
    
        return response;

    } catch (error) {
        if(debug) console.log('Erro ao setar refresh token no database:', error);
        const info = 'getProfile()';
        const message = 'Error trying to set refresh token into the database';
        throw new HttpError(StatusCode.NotFound, info, message, step);
    };
};



export { getUsers, insertUser, findUser, getProfile, setVerifyToken, updateEmail, setRefreshToken };
export { getProfileById };