
interface AuthMailConfig {
    user: string;
    pass: string;
    service?: string;
};

interface AuthConfig {
    jwtSecret: string;
    jwtRefreshSecret: string;
    saltRounds?: number;
    serverAddress?: string;
    errorRecipient?: string;
    mail?: AuthMailConfig;
};

export { AuthConfig, AuthMailConfig }