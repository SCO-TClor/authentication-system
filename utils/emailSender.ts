import * as nodemailer from 'nodemailer';
import { randomBytes } from 'crypto';

function emailSetup() {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
    return transporter;
}

async function emailInternalServerError(
    problem: string,
    funcao: string,
    step: number,
    debug: boolean
) {
    console.log('Creating error email...');
    
    const transporter = emailSetup();
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
        from: process.env.EMAIL_USER,
        to: "scotclor@gmail.com",
        subject: `🚨 INTERNAL SERVER ERROR - ${funcao}`,
        text: `ERRO INTERNO NO SERVIDOR\n\nFunção: ${funcao}\nStep: ${step}\nProblema: ${problem}\nData/Hora: ${timestamp}`,
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <table width="100%" style="background-color: #f5f5f5; padding: 40px 0;">
                <tr>
                    <td align="center">
                        <table width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); overflow: hidden;" cellpadding="0" cellspacing="0">
                            <!-- Header com alerta -->
                            <tr>
                                <td style="padding: 30px; background: linear-gradient(135deg, #ff4757 0%, #ff3838 100%); text-align: center;">
                                    <div style="font-size: 48px; margin-bottom: 10px;">🚨</div>
                                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                                        Internal Server Error
                                    </h1>
                                </td>
                            </tr>

                            <!-- Timestamp -->
                            <tr>
                                <td style="padding: 20px 30px; background-color: #fff3cd; border-left: 4px solid #ffc107;">
                                    <p style="margin: 0; color: #856404; font-size: 14px;">
                                        <strong>📅 Data/Hora:</strong> ${timestamp}
                                    </p>
                                </td>
                            </tr>

                            <!-- Informações do Erro -->
                            <tr>
                                <td style="padding: 30px;">
                                    <table width="100%" cellpadding="0" cellspacing="0">
                                        <!-- Função -->
                                        <tr>
                                            <td style="padding: 15px; background-color: #f8f9fa; border-left: 4px solid #007bff; margin-bottom: 15px;">
                                                <p style="margin: 0 0 5px 0; color: #666; font-size: 12px; text-transform: uppercase; font-weight: 600;">
                                                    Função
                                                </p>
                                                <p style="margin: 0; color: #212529; font-size: 16px; font-family: 'Courier New', monospace; font-weight: 700;">
                                                    ${funcao}
                                                </p>
                                            </td>
                                        </tr>
                                        
                                        <!-- Step -->
                                        <tr>
                                            <td style="padding: 15px; background-color: #f8f9fa; border-left: 4px solid #6c757d; margin-top: 15px;">
                                                <p style="margin: 0 0 5px 0; color: #666; font-size: 12px; text-transform: uppercase; font-weight: 600;">
                                                    Step
                                                </p>
                                                <p style="margin: 0; color: #212529; font-size: 20px; font-weight: 700;">
                                                    #${step}
                                                </p>
                                            </td>
                                        </tr>

                                        <!-- Problema -->
                                        <tr>
                                            <td style="padding: 15px; background-color: #fff5f5; border-left: 4px solid #dc3545; margin-top: 15px;">
                                                <p style="margin: 0 0 8px 0; color: #721c24; font-size: 12px; text-transform: uppercase; font-weight: 600;">
                                                    ⚠️ Descrição do Problema
                                                </p>
                                                <p style="margin: 0; color: #721c24; font-size: 15px; line-height: 1.6; white-space: pre-wrap; font-family: 'Courier New', monospace;">
                                                    ${problem}
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <!-- Divisor -->
                            <tr>
                                <td style="padding: 0 30px;">
                                    <hr style="border: none; border-top: 2px solid #e9ecef; margin: 0;">
                                </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                                <td style="padding: 25px 30px; background-color: #f8f9fa; text-align: center;">
                                    <p style="margin: 0; color: #6c757d; font-size: 13px;">
                                        Este é um email automático do sistema de monitoramento
                                    </p>
                                    <p style="margin: 10px 0 0 0; color: #adb5bd; font-size: 12px;">
                                        MarketAPI Error Logger | © 2025
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
    
    console.log('Sending error email...');
    await transporter.sendMail(mailOptions);
    if(debug) console.log(`Error email sent to scotclor@gmail.com`);
    return;
};

export { emailInternalServerError };

async function emailPasswordReset() { // implementar depois
    const transporter = emailSetup(); 
}

async function emailVerifier(
    user: string, 
    email: string, 
    token: string,
    debug: boolean
) {
    console.log('Creating email...');
    const apiGoal = process.env.SERVER_ADDRESS || '';
    const apiRout = apiGoal.concat(`/platform/auth/verify?token=${token}&email=${email}`)

    const transporter = emailSetup();
    
    console.log('Editing email...');
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Bem-vindo à Ceugant! 🎉',
        text: `Bem-vindo ${user}! Ative sua conta com o token: ${token}`,
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                @media (prefers-color-scheme: dark) {
                    body { background-color: #1a1a1a !important; }
                    .container { background-color: #2d2d2d !important; }
                    .text { color: #f0f0f0 !important; }
                }
            </style>
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
                            <!-- Conteúdo Principal -->
                            <tr>
                                <td style="padding: 30px; text-align: center;">
                                    <p style="color: #333; margin: 0 0 20px 0; font-size: 15px; line-height: 1.6;">
                                        Clique no botão abaixo para ativar sua conta e começar a usar a Ceugant:
                                    </p>
                                    
                                    <!-- CTA Button -->
                                    <a href="${apiRout}" 
                                       style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #00f2ff 0%, #00d4ff 100%); color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0; transition: transform 0.2s;">
                                        ✓ Ativar Conta Agora
                                    </a>

                                    <p style="color: #999; margin: 20px 0 0 0; font-size: 13px;">
                                        <h3>Ou copie este código:\ <code style="background-color: #f5f5f5; padding: 4px 8px; border-radius: 4px; color: #00d4ff; font-family: monospace; font-weight: 600;">${token}</code></h3>
                                    </p>
                                </td>
                            </tr>
                            <!-- Security alert -->
                            <tr>
                                <td style="padding: 20px 30px; background-color: #f9f9f9; border-left: 4px solid #00d4ff;">
                                    <p style="color: #666; margin: 0; font-size: 13px; line-height: 1.5;">
                                        <strong>⚠️ Segurança:</strong> Este link expira em 24 horas. Se você não solicitou este cadastro, ignore este email.
                                    </p>
                                </td>
                            </tr>
                            <!-- Divisorzin -->
                            <tr>
                                <td style="padding: 0 30px;">
                                    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 0;">
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 30px; background-color: #f9f9f9; text-align: center;">
                                    <p style="color: #999; margin: 0 0 15px 0; font-size: 13px;">
                                        <a href="#" style="color: #00d4ff; text-decoration: none; margin: 0 10px;">Privacidade</a> | 
                                        <a href="#" style="color: #00d4ff; text-decoration: none; margin: 0 10px;">Termos</a> | 
                                        <a href="#" style="color: #00d4ff; text-decoration: none; margin: 0 10px;">Suporte</a>
                                    </p>
                                    <p style="color: #ccc; margin: 10px 0 0 0; font-size: 12px;">
                                        © 2025 Ceugant. Todos os direitos reservados.
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
    
    console.log('Sending email...');
    await transporter.sendMail(mailOptions);
    if(debug) console.log(`Email sended for ${user} / ${email}`);
    return true;
};

function generateSecureToken() {
    const randomToken = randomBytes(32).toString('hex');

    return randomToken;
};

export { emailVerifier };