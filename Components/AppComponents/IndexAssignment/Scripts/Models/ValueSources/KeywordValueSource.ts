/// <reference path="../../IndexAssignment.ts"/>

namespace DW.IndexAssignment.Models.ValueSources {
    import IValueSource = Interfaces.IValueSource;
    import IField = Interfaces.IField;
    import IDwField = Interfaces.IDwField;
    import IValueSourceFactory = Interfaces.IValueSourceFactory;

    export class KeywordValueSource extends BaseValueSource {
        public readonly name: string = 'KeywordValueSource';
        public readonly displayName: string = DW.IndexAssignment.localize('IndexAssignment_Grid_Source_KeywordField');
        public readonly availableKeywordValueSources: IValueSourceFactory[] = [];

        private _currentValueSource: IValueSource;
        get currentValueSource(): IValueSource {
            return this._currentValueSource;
        }

        private _activeValueSources: IValueSource[] = [];
        get activeValueSources(): IValueSource[] {
            return this._activeValueSources;
        }

        constructor(valueSourcesFactories: IValueSourceFactory[], validationRequired: boolean) {
            super(validationRequired);

            if (valueSourcesFactories) {
                this.availableKeywordValueSources = valueSourcesFactories;
            }
        }

        public activateValueSource(valueSourceFactory: IValueSourceFactory, dwField: IDwField): IValueSource {
            let valueSource = valueSourceFactory.create(dwField);

            this._activeValueSources.push(valueSource);
            this._currentValueSource = valueSource;

            return valueSource;
        }

        public validateValues(): void {
            this._activeValueSources.forEach(x => {
                if (x.valueField) {
                    x.valueField.validate();
                }
            });
        }
    }
}