namespace DW.IndexAssignment.Controllers.ValueInput {
    import IValueSource = Interfaces.IValueSource;
    import StringValue = Models.Values.StringValue;
    import IDwField = IndexAssignment.Interfaces.IDwField;

    export class FixedValueStringTemplate extends BaseValueInputTemplate {
        public readonly templateName: KnockoutObservable<string> = ko.observable('text-fixedvalue-template');
        public showTooltip: KnockoutObservable<boolean> = ko.observable(false);
        public hasError: KnockoutObservable<boolean> = ko.observable(false);
        public readonly options: any;

        constructor(valueChangesArray: KnockoutObservableArray<string>, valueSourceField: IValueSource, dwField: IDwField) {
            super(valueSourceField);

            if (dwField.fieldMask) {
                this.value.extend({
                    pattern: {
                        params: dwField.fieldMask,
                        message: dwField.fieldMaskTooltip
                    }
                });

                this.options = {
                    placeholderText: dwField.fieldMaskPlaceholder,
                    tooltipContent: dwField.fieldMaskTooltip
                };

                this.hasError.subscribe((newState) => {
                    this.showTooltip(newState);
                });
            }

            this.value.subscribe(x => {
                try {
                    this.valueSourceField.valueField.setValue(new StringValue(x));
                    this.hasError(false);
                } catch (e) {
                    //we must suppress the error here, otherwise the red border around wrong field masks input won't work
                    console.log('WARN: %s, Field: "%s" \nThis is OK and required for providing backward compatibility', e.errorMessage, e.field.displayName);
                    this.hasError(true);
                } finally {
                    valueChangesArray.push(x);
                }
            });
        }

        public canHandle(): boolean {
            return (this.valueSourceField.name === 'FixedValueSource');
        }
    }
}