declare module DW.QueryBuilder {

    export var allowedSystemFields: { [systemField: string]: string };

    export class QueryBuilderVM {
        getSettings: () => any;
        validate: () => { errors: Array<string>, isValid: boolean };
        isEmpty: () => boolean;
        dispose: () => void;
    }

    export interface IQueryBuilderComponentOptions {
        maxNestingLevel?: number,
        operatorsMode?: any,
        fieldOperators?: any,
        templateFactories?: any,
        getResources?: () => any,
        getInstances?: () => any,
        conditionProviderFactory?: (options, field, api) => any,
        suggestionsProviderFactory?: () => any,
        createSetting?: (type, options) => any,
        getSelectListData?: (fieldId, prefix) => JQueryPromise<Array<any>>,
        generateConditionProviderId?: (type, operation) => string,
    }

    export class ComponentApi extends DW.BaseComponentApi{
        constructor(options?: IQueryBuilderComponentOptions)
        public createQueryBuilderVM: (options: {
            loadSettings: () => dev.docuware.com.settings.web.querybuilder.GroupCondition,
            loadFcFields: () => Array<dev.docuware.com.settings.filecabinet.Field>
        }) => QueryBuilderVM;
    }

    export class QueryBuilderComponent extends ComponentApi{}


    //export var SettingsService: dev.docuware.com.settings.web.querybuilder;

}