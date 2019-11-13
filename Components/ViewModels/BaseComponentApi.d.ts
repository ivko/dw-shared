declare module DW {

    export interface BaseComponentApiOptions {
        instances: Object;  
        getResources: () => Object;
        getTemplates: () => Object; 
    }

    export class BaseComponentApi extends DWTS.ViewModel {
        options: BaseComponentApiOptions;

        constructor(options?: any);

        set: (Object) => void; 
    }

} 