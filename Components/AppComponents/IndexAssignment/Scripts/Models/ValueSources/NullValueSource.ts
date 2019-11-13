/// <reference path="../../IndexAssignment.ts"/>

namespace DW.IndexAssignment.Models.ValueSources {
    import IValueSource = Interfaces.IValueSource;
    import IField = Interfaces.IField;
    import IDwField = Interfaces.IDwField;
    import NullField = Models.Fields.NullField;

    export class NullValueSource extends BaseValueSource {
        public readonly name: string = 'NullValueSource';
        public readonly displayName: string = DW.IndexAssignment.localize('IndexAssignment_Grid_Source_PleaseSelect');

        public readonly validationRequired: boolean;
        public readonly valueField: IField;

        constructor(validationRequired: boolean, dwField: IDwField) {
            super(validationRequired);
            this.valueField = new NullField(validationRequired, dwField);
        }
    }
}