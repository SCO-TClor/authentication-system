import * as http from 'http';

function debuggerController(        // Manual debugger!
    archive: string,
    funcao: string,
    req: http.IncomingMessage,
    debug: boolean,
    step: number,
) {
    if(debug) console.log(`Archive | >--> ${archive} <--<`);
    if(debug) console.log(`Função  | ${funcao}`);
    if(debug) console.log(`Step    | ${step}`);
    if(debug) console.log(`Method  | "${req.method}"`);
    return step++;
};

export { debuggerController };