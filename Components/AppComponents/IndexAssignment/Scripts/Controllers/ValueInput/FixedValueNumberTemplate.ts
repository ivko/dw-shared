namespace DW.IndexAssignment.Controllers.ValueInput {
    import IValueSource = Interfaces.IValueSource;
    import IDwField = Interfaces.IDwField;
    import DwFieldType = Models.DwFieldType;
    import NumericValue = Models.Values.NumericValue;

    export class FixedValueNumberTemplate extends BaseValueInputTemplate {
        public readonly templateName: KnockoutObservable<string> = ko.observable('numeric-fixedvalue-template');
        public options: any;

        constructor(valueChangesArray: KnockoutObservableArray<string>, valueSourceField: IValueSource, dwField: IDwField) {
            super(valueSourceField);

            if (dwField.fieldType === DwFieldType.Numeric) {
                this.options = DW.Utils.getNumericValueOptions(dwField.numberPrecision);
            } else {
                this.options = DW.Utils.getDecimalValueOptions(dwField.numberPrecision);
            }

            this.value.subscribe(x => {
                if (x) {
                    this.valueSourceField.valueField.setValue(new NumericValue(x));
                } else {
                    this.valueSourceField.valueField.removeValue();
                }

                valueChangesArray.push(x);
            });
        }

        public canHandle(): boolean {
            let fieldType: any = this.valueSourceField.valueField;

            return (this.valueSourceField.name === 'FixedValueSource' && fieldType.name === 'NumberField');
        }
    }
}