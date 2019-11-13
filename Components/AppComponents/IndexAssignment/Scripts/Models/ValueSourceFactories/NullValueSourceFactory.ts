namespace DW.IndexAssignment.Models.ValueSourceFactories {
    import IValueSourceFactory = Interfaces.IValueSourceFactory;
    import IDwField = Interfaces.IDwField;
    import IValueSource = Interfaces.IValueSource;
    import NullValueSource = Models.ValueSources.NullValueSource;

    export class NullValueSourceFactory implements IValueSourceFactory {
        public readonly name: string = "NullValueSourceFactory";

        constructor(private validationRequired: boolean) {
            this.validationRequired = validationRequired;
        }

        create(dwField: IDwField): IValueSource {
            return new NullValueSource(this.validationRequired, dwField);
        }
    }
}