namespace DW.IndexAssignment.Controllers.ValueInput {
    import IValueSource = Interfaces.IValueSource;
    import IDwField = IndexAssignment.Interfaces.IDwField;

    export class KeywordTemplate extends FixedValueStringTemplate {
        public readonly templateName: KnockoutObservable<string> = ko.observable('keyword-template');

        constructor(valueChangesArray: KnockoutObservableArray<string>, valueSourceField: IValueSource, dwField: IDwField) {
            super(valueChangesArray, valueSourceField, dwField);
        }

        public canHandle(): boolean {
            let fieldType: any = this.valueSourceField.valueField;

            return (fieldType.name === 'KeywordField');
        }
    }
}