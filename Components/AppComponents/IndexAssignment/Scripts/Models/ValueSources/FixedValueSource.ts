/// <reference path="../../IndexAssignment.ts"/>

namespace DW.IndexAssignment.Models.ValueSources {
    import IValueSource = Interfaces.IValueSource;
    import IField = Interfaces.IField;
    import IDwField = Interfaces.IDwField;
    import KeywordField = Models.Fields.KeywordField;
    import MemoField = Models.Fields.MemoField;
    import TextField = Models.Fields.TextField;
    import NumberField = Models.Fields.NumberField;
    import DateTimeField = Models.Fields.DateTimeField;

    export class FixedValueSource extends BaseValueSource {
        public readonly name: string = 'FixedValueSource';
        public readonly displayName: string = DW.IndexAssignment.localize('IndexAssignment_Grid_Source_Fixed');

        private _valueField: IField;
        get valueField(): IField {
            return this._valueField;
        }

        private _fieldType: DwFieldType;

        constructor(validationRequired: boolean, dwField: IDwField) {
            super(validationRequired);

            this._fieldType = dwField.fieldType;
            this.init(dwField);
        }

        private init(dwField: IDwField) {
            let field: IField;

            switch (this._fieldType) {
            case DwFieldType.Keyword:
            {
                field = new KeywordField(this.validationRequired, dwField);
                break;
            }
            case DwFieldType.Memo:
            {
                field = new MemoField(this.validationRequired, dwField);
                break;
            }
            case DwFieldType.Text:
            {
                field = new TextField(this.validationRequired, dwField);
                break;
            }
            case DwFieldType.Decimal:
            case DwFieldType.Numeric:
            {
                field = new NumberField(this.validationRequired, dwField);
                break;
            }
            case DwFieldType.Date:
            case DwFieldType.DateTime:
            {
                field = new DateTimeField(this.validationRequired, dwField);
                break;
            }
            default:
                throw new Error("unsupported DocuWare field type");
            }

            this._valueField = field;
        }
    }
}