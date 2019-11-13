namespace DW.IndexAssignment.Models.Fields {
    import IDwField = Interfaces.IDwField;

    export class NumberField extends BaseField {
        constructor(validationRequired: boolean, dwField: IDwField) {
            super(validationRequired, dwField);
            this.name = 'NumberField';
        }
    }
}