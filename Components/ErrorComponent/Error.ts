namespace DWTS {
    export interface IError {
        message: string;
        canceled?: boolean;
        handled?: boolean;
    }
    export class Error implements IError {
        constructor(public message: string, public canceled: boolean = false, public handled: boolean = false) { }
    }
}
