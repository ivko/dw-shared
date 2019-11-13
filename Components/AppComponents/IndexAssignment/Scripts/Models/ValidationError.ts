namespace DW.IndexAssignment.Models {
    import IValidationError = Interfaces.IValidationError;
    import IField = Interfaces.IField;

    export class ValidationError implements IValidationError {
        public field: IField;
        public errorMessage: string;

        constructor(field: IField, errorMessage: string) {
            this.field = field;
            this.errorMessage = errorMessage;
        }
    }
}