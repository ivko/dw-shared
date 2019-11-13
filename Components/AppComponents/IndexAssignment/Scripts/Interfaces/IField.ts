namespace DW.IndexAssignment.Interfaces {
    export interface IField {
        readonly validations: IValidation[];
        readonly defaultValue: IValue;
        readonly value: IValue;
        readonly validationErrors: IValidationError[];
        readonly name;

        setValue(value: IValue): void;
        removeValue(): void;
        validate(): void;
    }
}