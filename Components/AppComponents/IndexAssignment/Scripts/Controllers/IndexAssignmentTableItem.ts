namespace DW.IndexAssignment.Controllers {
    import IValueSource = Interfaces.IValueSource;
    import BaseValueInputTemplate = Controllers.ValueInput.BaseValueInputTemplate;
    import IIndexField = Interfaces.IIndexField;
    import InputTemplate = Controllers.ValueInput.InputTemplate;

    export class IndexAssignmentTableItem {
        public valueSources: IValueSource[] = [];
        public selectedValueSource: KnockoutObservable<IValueSource> = ko.observable(null);

        public readonly isValueSourceSelected: KnockoutObservable<boolean> = ko.observable(false);
        public readonly indexingTemplate: KnockoutObservable<BaseValueInputTemplate> = ko.observable(null);
        public readonly showMinus: KnockoutObservable<boolean> = ko.observable(true);
        public readonly mandatoryFieldName: KnockoutComputed<string>;

        constructor(public indexField: IIndexField, public valueChangesArray: KnockoutObservableArray<string>) {
            indexField.availableValueSources.forEach(x => {
                if (x.name !== 'KeywordValueSource') {
                    this.valueSources.push(x);
                }
            });

            this.selectedValueSource.subscribe((valueSource) => {
                this.isValueSourceSelected(!(valueSource.name === 'NullValueSource'));
            });

            this.mandatoryFieldName = ko.computed(() => {
                if (indexField.dwField.required) {
                    return indexField.displayName + ' *';
                }

                return indexField.displayName;
            });
        }

        public loadExistingValues() {
            if (this.indexField.valueSource.name !== 'NullValueSource') {
                this.selectedValueSource(this.indexField.valueSource);

                this.indexingTemplate(InputTemplate.createInputTemplate(this.selectedValueSource(), this.indexField.dwField, this.valueChangesArray));

                let valueSource = this.selectedValueSource();

                if (valueSource) {
                    if (valueSource.valueField) {
                        if (valueSource.valueField.value) {
                            this.indexingTemplate().value(valueSource.valueField.value.value());
                        }
                    }
                }
            }
        }
    }
}