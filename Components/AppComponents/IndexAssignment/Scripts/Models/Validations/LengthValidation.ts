/// <reference path="../../IndexAssignment.ts"/>

namespace DW.IndexAssignment.Models.Validations {
    import IValidation = Interfaces.IValidation;
    import IField = Interfaces.IField;
    import IValue = Interfaces.IValue;
    import IValidationError = Interfaces.IValidationError;

    export class LengthValidation implements IValidation {
        public allowedLength: number;
        public field: IField;

        constructor(allowedLength: number, field: IField) {
            this.field = field;

            if (allowedLength) {
                this.allowedLength = allowedLength;
            } else {
                this.allowedLength = -1;
            }
        }

        public validate(input: IValue): void {
            if (input && input.value() && input.value().length > this.allowedLength && this.allowedLength > 0) {
                throw new ValidationError(this.field, DW.IndexAssignment.localize('IndexAssignment_ValidationError_Length', this.allowedLength));
            }
        }
    }
}