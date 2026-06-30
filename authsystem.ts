import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import type { StringValue } from "ms";

interface AuthConfig {
    jwtSecret: string;
    saltRounds?: number;

    mail?: {
        user: string;
        pass: string
    };
};

export class AuthSystem {
    private jwtSecret: string;
    private saltRounds: number;

    private mailer?: nodemailer.Transporter;

    constructor(config: AuthConfig) {
        this.jwtSecret = config.jwtSecret;
        this.saltRounds = config.saltRounds ?? 10;

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
};

const JWT_SECRET_KEY = process.env.JWT_SECRET || "";

const auth = new AuthSystem({
    jwtSecret: JWT_SECRET_KEY
})