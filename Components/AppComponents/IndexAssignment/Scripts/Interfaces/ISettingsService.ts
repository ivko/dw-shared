namespace DW.IndexAssignment.Interfaces {
    export interface ISettingsService {
        getDialogFields(dialogGuid: string, fcGuid: string, validationRequired: boolean): JQueryPromise<IIndexField[]>
    }
}