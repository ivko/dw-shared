namespace DW.IndexAssignment.Models.Validations {
    import IValidation = Interfaces.IValidation;
    import IField = Interfaces.IField;
    import IValue = Interfaces.IValue;
    import IValidationError = Interfaces.IValidationError;
    import MissingRequiredFieldError = Models.Exceptions.MissingRequiredFieldError;

    export class RequiredFieldValidation implements IValidation {
        public field: IField;

        constructor(field: IField) {
            this.field = field;
        }

        public validate(input: IValue): void {
            if (input === undefined) {
                throw new MissingRequiredFieldError(this.field);
            }
        }
    }
}