/// <reference path="../../IndexAssignment.ts"/>

namespace DW.IndexAssignment.Models.Exceptions {
    import IValidationError = Interfaces.IValidationError;
    import IField = Interfaces.IField;

    export class MissingRequiredFieldError implements IValidationError {
        public field: IField;
        public errorMessage: string;

        constructor(field: IField, errorMessage: string = '') {
            this.field = field;

            if (errorMessage) {
                this.errorMessage = errorMessage;
            } else {
                this.errorMessage = DW.IndexAssignment.localize('IndexAssignment_ValidationError_Required');
            }
        }
    }
}