# AuthSystem

Biblioteca de autenticação em TypeScript para login, cadastro, refresh token e verificação de e-mail com PostgreSQL, bcrypt, JWT e Nodemailer.

## Instalação

1. Instale as dependências:

```bash
npm install
```

2. Configure o arquivo `.env` na raiz do projeto.

3. Garanta que o banco PostgreSQL e a tabela de usuários estejam disponíveis antes de inicializar a biblioteca.

## Configuração Essencial do `.env`

Os parâmetros abaixo são os que a biblioteca usa de forma direta:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=senha_do_banco
DB_DATABASE=auth_db

JWT_SECRET=sua_chave_jwt_de_acesso
JWT_REFRESH_SECRET=sua_chave_jwt_de_refresh
SERVER_ADDRESS=http://localhost:3000

EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_ou_app_password
EMAIL_ERROR_TO=destino_para_erros@exemplo.com
```

`EMAIL_PASS` é o campo principal de senha do transporte. `EMAIL_ERROR_TO` é opcional. `SERVER_ADDRESS` é usado para montar o link de verificação.

## Configuração de E-mail

O envio de e-mail usa Nodemailer com as credenciais do `.env`.

- `EMAIL_USER` é o remetente.
- `EMAIL_PASS` é a senha do transporte SMTP.
- `SERVER_ADDRESS` gera o link de verificação.

Se estiver usando Gmail, prefira senha de aplicativo.

## Parte Mais Pesada Da Integração

A parte mais trabalhosa é adaptar o banco escolhido ao schema esperado pela biblioteca. Se você trocar PostgreSQL, ORM ou driver, o principal ajuste fica no repository e no arquivo de conexão.

## Como Conseguir o Passcode

O passcode de verificação é gerado automaticamente e enviado por e-mail.

- O código tem 6 dígitos.
- Ele é salvo no banco de forma protegida.
- O usuário usa o código recebido para validar a conta.

## Como Implementar

O pacote exporta a instância `auth` e os handlers de controller pelo arquivo principal.

### Uso direto da instância

```ts
import { auth } from './index';

const loginResult = await auth.login({
	email: 'user@example.com',
	password: 'senha123'
});

const refreshToken = await auth.refreshService('cookie_refresh_aqui');
```

### Uso com controller HTTP

Se você já trabalha com `http.IncomingMessage` e `http.ServerResponse`, use os handlers exportados pelo pacote:

```ts
import { login, signup, refresh, sendVerifyEmail, verifyEmail } from './index';
```

## API Principal

- `auth.login(data)` - autentica o usuário.
- `auth.signupService(data)` - cria um novo usuário.
- `auth.refreshService(refreshCookie)` - gera novo access token.
- `auth.verifyService(email)` - gera e envia o passcode.
- `auth.verifyEmailService({ email, token })` - confirma o e-mail.

## Estrutura Esperada do Banco

O banco precisa ter uma tabela de usuários com campos como:

- `id`
- `name`
- `email`
- `password_hash`
- `status`
- `email_verified`
- `verification_token`
- `verification_expires`
- `refresh_token`

## Contrato Esperado Do Repository

Para a biblioteca funcionar, o repository precisa expor estas operações:

- `findUser(email)` - verifica se o e-mail já existe.
- `getProfile(email)` - retorna o perfil completo do usuário pelo e-mail.
- `getProfileById(id)` - busca o usuário pelo ID, usado no refresh token.
- `insertUser(name, email, password)` - cria um novo usuário com senha hash.
- `setRefreshToken(email, refresh_token)` - salva o refresh token no banco.
- `setVerifyToken(email, token, expires)` - grava o token de verificação e a validade.
- `updateEmail(email)` - marca o e-mail como verificado e limpa os dados temporários.

Se algum nome, assinatura ou retorno mudar, o restante da biblioteca precisa ser ajustado junto.
