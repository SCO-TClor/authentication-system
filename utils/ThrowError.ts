import { StatusCode as SC } from "../@types/headWriter";
import { code } from "./endPoints";

class HttpError extends Error {
    statuscode: number;
    name: string;
    at: string;
    info: string;
    step: number;
    partCode?: code | undefined;

    constructor(
        statusC: number, 
        at: string,
        info: string,
        step: number,
        partCode?: code | undefined
    ) {
        super(info);

        this.statuscode = statusC;
        this.at = at;
        this.info = info;
        this.step = step;
        if(partCode) {
            this.partCode = partCode;
        };

        switch (statusC) {
            case SC.BadRequest:
                this.name = 'BadRequest';
                break;
        
            case SC.Conflict:
                this.name = 'Conflict';
                break;
        
            case SC.NotFound:
                this.name = 'NotFound';
                break;
        
            case SC.Unauthorized:
                this.name = 'Unauthorized';
                break;
        
            case SC.MethodNotAllowed:
                this.name = 'MethodNotAllowed';
                break;
        
            case SC.Forbidden:
                this.name = 'Forbidden';
                break;
        
            case SC.InternalServerError:
                this.name = 'InternalServerError';
                break;

            default:
                this.name = 'UnknowHttpError';
                break;
        };
    };
};

export { HttpError };