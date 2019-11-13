namespace DW.IndexAssignment.Interfaces {
    export interface IValidationImporter {
        import(entries: Interfaces.IValidationEntry[], validationModel: IValidationModel);
    }
}