namespace DW.IndexAssignment.Models.IndexFields {
    import IIndexField = Interfaces.IIndexField;
    import IValueSourceFactory = Interfaces.IValueSourceFactory;
    import IValueSource = Interfaces.IValueSource;
    import IDwField = Interfaces.IDwField;

    export class BaseIndexField implements IIndexField {
        public readonly name: string;
        public readonly displayName: string;

        private _valueSourceFactories: IValueSourceFactory[] = [];

        private _availableValueSources: IValueSource[] = [];
        get availableValueSources(): IValueSource[] {
            return this._availableValueSources;
        }

        private _valueSource: IValueSource;
        get valueSource(): IValueSource {
            return this._valueSource;
        }

        private _dwField: IDwField;
        get dwField(): IDwField {
            return this._dwField;
        }

        constructor(name: string, displayName: string, dwField: IDwField, valueSourceFactories: IValueSourceFactory[]) {
            this.name = name;
            this.displayName = displayName;
            this._dwField = dwField;

            if (valueSourceFactories) {
                this._valueSourceFactories = valueSourceFactories;
            }

            this._valueSourceFactories.forEach(x => {
                this._availableValueSources.push(x.create(dwField));
            });
        }

        public activateValueSource(valueSource: IValueSource): void {
            this._valueSource = valueSource;
        }
    }
}