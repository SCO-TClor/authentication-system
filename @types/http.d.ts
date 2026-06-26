import 'http';

declare module 'http' {
    interface IncomingMessage {
        user?: {
            user_id: string,
            tenant_id?: string,
            email: string,
            role?: string
        };
    }
}