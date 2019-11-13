namespace DW.IndexAssignment.Controllers.ValueInput {
    import IValueSource = Interfaces.IValueSource;
    import IDwField = Interfaces.IDwField;
    import DwFieldType = Models.DwFieldType;
    import DateValue = Models.Values.DateValue;

    export class FixedValueDateTemplate extends BaseValueInputTemplate {
        public readonly templateName: KnockoutObservable<string>;

        constructor(valueChangesArray: KnockoutObservableArray<string>, valueSourceField: IValueSource, dwField: IDwField) {
            super(valueSourceField);

            if (dwField.fieldType === DwFieldType.Date) {
                this.templateName = ko.observable('date-fixedvalue-template');
            } else {
                this.templateName = ko.observable('datetime-fixedvalue-template');
            }

            this.value.subscribe(x => {
                if (x) {
                    this.valueSourceField.valueField.setValue(new DateValue(x));
                } else {
                    this.valueSourceField.valueField.removeValue();
                }
                
                valueChangesArray.push(x);
            });
        }

        public canHandle(): boolean {
            let fieldType: any = this.valueSourceField.valueField;

            return (this.valueSourceField.name === 'FixedValueSource' && fieldType.name === 'DateTimeField');
        }
    }
}