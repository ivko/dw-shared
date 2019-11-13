namespace DW.IndexAssignment.Models.Fields {
    import IDwField = Interfaces.IDwField;
    import FieldMaskValidation = Validations.FieldMaskValidation;
    
    export class BaseFieldMaskField extends BaseField {
        constructor(validationRequired: boolean, dwField: IDwField) {
            super(validationRequired, dwField);

            //field masks always have to be validated, regardless of tray or file cabinet storage
            if (dwField.fieldMask) {
                this.validations.push(new FieldMaskValidation(this, dwField));
            }
        }
    }
}