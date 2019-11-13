/// <reference path="../../IndexAssignment.ts"/>

namespace DW.IndexAssignment.Models.Validations {
    import IValidation = Interfaces.IValidation;
    import IField = Interfaces.IField;
    import IValue = Interfaces.IValue;
    import IValidationError = Interfaces.IValidationError;

    export class ReadOnlyValidation implements IValidation {
        public field: IField;

        private _readOnly: boolean;
        private _prefillValue: any;

        constructor(readOnly: boolean, field: IField, prefillValue?: any) {
            this.field = field;

            if (readOnly) {
                this._readOnly = readOnly;
            }

            if (prefillValue) {
                this._prefillValue = prefillValue;
            }
        }

        public validate(input: IValue): void {
            if (this._readOnly) {
                if (input.value() !== this._prefillValue) {
                    throw new ValidationError(this.field, DW.IndexAssignment.localize('IndexAssignment_ValidationError_ReadOnly'));
                }
            }
        }
    }
}