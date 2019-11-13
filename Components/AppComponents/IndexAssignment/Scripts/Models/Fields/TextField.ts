namespace DW.IndexAssignment.Models.Fields {
    import IDwField = Interfaces.IDwField;

    //Takes care of assigning and retrieving values, as well as culture related formatting.
    //field masks are only allowed for text & keyword fields in DocuWare
    export class TextField extends BaseFieldMaskField {
        public readonly maxLength: number = -1;
        public readonly prefillValue: string;

        constructor(validationRequired: boolean, dwField: IDwField) {
            super(validationRequired, dwField);
            this.name = 'TextField';

            this.maxLength = dwField.maxLength;
            if (dwField.prefillValue) {
                this.prefillValue = dwField.prefillValue;
            }

        }
    }
}