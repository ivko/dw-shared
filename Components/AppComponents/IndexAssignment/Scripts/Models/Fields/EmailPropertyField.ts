namespace DW.IndexAssignment.Models.Fields {
    import IDwField = Interfaces.IDwField;

    export class EmailPropertyField extends BaseField {
        constructor(validationRequired: boolean, dwField: IDwField) {
            super(validationRequired, dwField);

            this.name = 'EmailPropertyField';
        }
    }
}