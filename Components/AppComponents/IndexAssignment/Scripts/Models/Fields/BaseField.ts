namespace DW.IndexAssignment.Models.Fields {
    import IField = Interfaces.IField;
    import IValidation = Interfaces.IValidation;
    import IValue = Interfaces.IValue;
    import IDwField = Interfaces.IDwField;
    import IValidationError = Interfaces.IValidationError;
    import RequiredFieldValidation = Validations.RequiredFieldValidation;

    export class BaseField implements IField {
        public readonly validations: IValidation[] = [];    //holds all validation for this field, a set of validation rules should be passed from outside
        public readonly defaultValue: IValue; //TODO: is this the prefill value??
        public readonly readOnly: boolean = false;
        public readonly required: boolean = false;
        public readonly displayName: string;
        public name: string;

        protected _isValidationRequired: boolean;

        private _dwField: IDwField;
        private _validationErrors: IValidationError[] = [];

        get validationErrors(): IValidationError[] {
            return this._validationErrors;
        }

        protected _value: IValue;
        get value(): IValue {
            return this._value;
        }

        constructor(validationRequired: boolean, dwField?: IDwField) {
            this._isValidationRequired = validationRequired;
            if (dwField) {
                this._dwField = dwField;
                this.displayName = dwField.fieldLabel;

                if (this._dwField.readOnly) {
                    this.readOnly = this._dwField.readOnly;
                }
                
                if (this._dwField.required) {
                    this.required = this._dwField.required;
                }
            }

            this.initializeValidations();
        }

        public setValue(value: IValue): void {
            if (value.exportValue === '') {
                this._value = undefined;
                return;
            }

            this._value = value;
            this.validate();
        }

        public removeValue(): void {
            this._value = null;
            this.validate();
        }

        public validate(): void {
            if (!this._isValidationRequired) {
                return;
            }
            
            this._validationErrors = [];

            //must iterate through all validations
            this.validations.forEach((typeValidation) => {
                try {
                    typeValidation.validate(this.value);
                } 
                catch (e) {
                    this.validationErrors.push(e);
                    throw e;
                } 
                finally {
                    this._value = this.value;
                }
            });
        }

        private initializeValidations(): void {
            if (this.required === true) {
                this.validations.push(new RequiredFieldValidation(this));
            }
        }
    }
}