import { AuthConfig, AuthSystem } from './AuthSystem';
import { PostgresRepository } from '../database/PostgreSQL/auth.repository';
import pool from '../database/PostgreSQL/databaseConfig';

const repository = new PostgresRepository(pool);

const authConfig: AuthConfig = {
    jwtSecret: process.env.JWT_SECRET || '',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || '',
    saltRounds: 10,
    serverAddress: process.env.SERVER_ADDRESS || '',
    errorRecipient: process.env.EMAIL_ERROR_TO || process.env.EMAIL_USER || '',
    mail: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD || ''
    }
};

const auth = new AuthSystem(repository, authConfig);

export { auth, authConfig, repository };