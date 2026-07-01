import crypto from 'crypto';
import nodemailer, { type Transporter } from 'nodemailer';

export interface EmailSenderContext {
    transporter?: Transporter;
    mail?: {
        user: string;
        pass: string;
        service?: string;
    };
    from?: string;
    baseUrl?: string;
    errorRecipient?: string;
};

function createTransporter(context?: EmailSenderContext): Transporter {
    if(context?.transporter) {
        return context.transporter;
    }

    if(!context?.mail?.user || !context?.mail?.pass) {
        throw new Error('Email transport is not configured');
    }

    return nodemailer.createTransport({
        service: context.mail.service || 'gmail',
        auth: {
            user: context.mail.user,
            pass: context.mail.pass,
        }
    });
}

function getSender(context?: EmailSenderContext): string {
    return context?.from || context?.mail?.user || process.env.EMAIL_USER || '';
}

function getBaseUrl(context?: EmailSenderContext): string {
    return (context?.baseUrl || process.env.SERVER_ADDRESS || '').replace(/\/$/, '');
}

function getErrorRecipient(context?: EmailSenderContext): string {
    return context?.errorRecipient || process.env.EMAIL_ERROR_TO || getSender(context);
}

async function emailInternalServerError(
    problem: string,
    funcao: string,
    step: number,
    debug: boolean,
    context?: EmailSenderContext
) {
    const transporter = createTransporter(context);
    const sender = getSender(context);
    const recipient = getErrorRecipient(context);
    const timestamp = new Date().toLocaleString('pt-BR', { 
        timeZone: 'America/Sao_Paulo',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    const mailOptions = {
        from: sender,
        to: recipient,
        subject: `INTERNAL SERVER ERROR - ${funcao}`,
        text: `ERRO INTERNO NO SERVIDOR\n\nFunção: ${funcao}\nStep: ${step}\nProblema: ${problem}\nData/Hora: ${timestamp}`,
        html: `<p><strong>Função:</strong> ${funcao}</p><p><strong>Step:</strong> ${step}</p><p><strong>Problema:</strong> ${problem}</p><p><strong>Data/Hora:</strong> ${timestamp}</p>`
    };
    
    await transporter.sendMail(mailOptions);
    if(debug) console.log(`Error email sent to ${recipient}`);
    return;
};

export { emailInternalServerError };

async function emailPasswordReset() {
    return;
}

async function emailVerifier(
    user: string, 
    email: string, 
    token: string,
    debug: boolean,
    context?: EmailSenderContext
) {
    const transporter = createTransporter(context);
    const sender = getSender(context);
    const baseUrl = getBaseUrl(context);
    const verificationUrl = `${baseUrl}/platform/auth/verify?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
    
    const mailOptions = {
        from: sender,
        to: email,
        subject: 'Bem-vindo à Ceugant! 🎉',
        text: `Bem-vindo ${user}! Ative sua conta com o token: ${token}`,
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f5f7fa; font-family: 'Segoe UI', Arial, sans-serif;">
            <table width="100%" style="background-color: #f5f7fa; padding: 40px 0;">
                <tr>
                    <td align="center">
                        <table width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;" cellpadding="0" cellspacing="0">
                            <tr>
                                <td style="padding: 20px 20px; background: linear-gradient(135deg, hsl(183, 100%, 50%) 0%, hsl(262, 100%, 30%) 100%); text-align: center;">
                                    <img src="https://i.imgur.com/26wGmlD.png" style="width: 180px; height: 180px; object-fit: contain; border-radius: 25%; background-color: rgba(255, 255, 255, 0.15); padding: 10px;">
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 30px 30px 10px 30px; text-align: center;">
                                    <h1 style="color: #1a1a1a; margin: 0; font-size: 28px; font-weight: 600;">
                                        Bem-vindo à <span style="color: #00d4ff;">Ceugant</span>
                                    </h1>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 30px 30px 30px; text-align: center;">
                                    <p style="color: #666; margin: 0; font-size: 16px; line-height: 1.6;">
                                        Olá <strong>${user}</strong>, sua conta foi criada com sucesso!
                                    </p>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 0 30px;">
                                    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 0;">
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 30px; text-align: center;">
                                    <p style="color: #333; margin: 0 0 20px 0; font-size: 15px; line-height: 1.6;">
                                        Clique no botão abaixo para ativar sua conta e começar a usar a Ceugant:
                                    </p>
                                    <a href="${verificationUrl}" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #00f2ff 0%, #00d4ff 100%); color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0;">
                                        Ativar Conta Agora
                                    </a>
                                    <p style="color: #999; margin: 20px 0 0 0; font-size: 13px;">
                                        Ou copie este código: <code style="background-color: #f5f5f5; padding: 4px 8px; border-radius: 4px; color: #00d4ff; font-family: monospace; font-weight: 600;">${token}</code>
                                    </p>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 20px 30px; background-color: #f9f9f9; border-left: 4px solid #00d4ff;">
                                    <p style="color: #666; margin: 0; font-size: 13px; line-height: 1.5;">
                                        <strong>Segurança:</strong> Este link expira em 15 minutos. Se você não solicitou este cadastro, ignore este email.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>`
    }
    
    await transporter.sendMail(mailOptions);
    if(debug) console.log(`Email sent for ${user} / ${email}`);
    return true;
};

function generateSecureToken() {
    return crypto.randomBytes(32).toString('hex');
};

export { emailVerifier, emailPasswordReset, generateSecureToken };