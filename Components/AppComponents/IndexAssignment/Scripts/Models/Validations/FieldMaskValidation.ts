/// <reference path="../../IndexAssignment.ts"/>

namespace DW.IndexAssignment.Models.Validations {
    import IValidation = Interfaces.IValidation;
    import IField = Interfaces.IField;
    import IValue = Interfaces.IValue;
    import IDwField = Interfaces.IDwField;
    import FieldMaskValidationError = Models.Exceptions.FieldMaskValidationError;


    export class FieldMaskValidation implements IValidation {
        private _dwField: IDwField;

        public field: IField;

        constructor(field: IField, dwField: IDwField) {
            this.field = field;
            this._dwField = dwField;
        }

        public validate(input: IValue): void {
            let hasFieldMaskDefined: boolean = (this._dwField && this._dwField.fieldMask) ? true : false;

            //leave if there is no field mask or input to check
            if (!hasFieldMaskDefined || !input) {
                return;
            }

            //throw also error if input does not match field mask
            let fieldMask: string = this._dwField.fieldMask;

            if (!this.testInput(fieldMask, input.exportValue)) {
                throw new FieldMaskValidationError(this.field);
            }
        }

        private testInput(maskDefinition: string, valueToTest: string): boolean {
            let isValid: boolean = false;

            try {
                var regExp = new RegExp(maskDefinition);
                var matches = regExp.exec(valueToTest);
                isValid = ((matches !== null) && (valueToTest === matches[0]));
            }
            catch (e) {
                isValid = false;
            }

            return isValid;
        }
    }
}