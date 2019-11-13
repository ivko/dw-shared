/// <reference path="../../IndexAssignment.ts"/>

namespace DW.IndexAssignment.Models.ValueSources {
    import IValueSource = Interfaces.IValueSource;
    import IField = Interfaces.IField;
    import IDwField = Interfaces.IDwField;
    import EmailPropertyField = Models.Fields.EmailPropertyField;

    export class EmailPropertyValueSource extends BaseValueSource {
        public readonly name: string = 'EmailPropertyValueSource';
        public readonly displayName: string = DW.IndexAssignment.localize('IndexAssignment_Grid_Source_EmailProperty');

        private _valueField: IField;
        get valueField(): IField {
            return this._valueField;
        }

        constructor(validationRequired: boolean, dwField: IDwField) {
            super(validationRequired);
            this._valueField = new EmailPropertyField(validationRequired, dwField);
        }
    }
}