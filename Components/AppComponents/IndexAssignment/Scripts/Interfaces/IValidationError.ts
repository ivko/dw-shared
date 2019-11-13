namespace DW.IndexAssignment.Interfaces {
    export interface IValidationError {
        readonly field: IField;
        readonly errorMessage: string;
    }
}