namespace DW.IndexAssignment.Interfaces {
    export interface IValidationExporter {
        exportEntries(activeIndexFields: IIndexField[]): IValidationEntry[];
    }
}