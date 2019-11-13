namespace DW.IndexAssignment.Models.Fields {
    import IDwField = Interfaces.IDwField;

    export class DateTimeField extends BaseField {
        constructor(validationRequired: boolean, dwField: IDwField) {
            super(validationRequired, dwField);

            this.name = 'DateTimeField';
        }
    }
}