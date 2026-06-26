export enum HttpMethod {
    GET = "GET",                // Lê a tabela
    POST = "POST",              // Salva alguma tabela
    PUT = "PUT",                // Atualiza tudo
    PATCH = "PATCH",            // Atualiza certos dados
    DELETE = "DELETE",          // Deleta dados
};

export enum StatusCode {
    OK = 200,                   // SUCESSO
    Created = 201,              // CRIADO
    NoContent = 204,            // SUCESSO SEM CORPO (DELETE ou operações silenciosas)
    BadRequest = 400,           // ERRO DO CLIENTE (Dados inválidos ou validação falha)
    Unauthorized = 401,         // NÃO AUTENTICADO (sem JWT ou token inválido)
    Forbidden = 403,            // SEM PERMISSÃO (autenticado, mas sem acesso)
    NotFound = 404,             // NÃO ENCONTRADO
    MethodNotAllowed = 405,     // MÉTODO NÃO PERMITIDO!
    Conflict = 409,             // CONFLITO (email já existente ou dado duplicado)
    InternalServerError = 500,  // ERRO DO SERVIDOR (exceção não tratada)
};