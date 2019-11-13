namespace DW.IndexAssignment.Models.ValueSourceFactories {
    import IValueSourceFactory = Interfaces.IValueSourceFactory;
    import IDwField = Interfaces.IDwField;
    import IValueSource = Interfaces.IValueSource;
    import FixedValueSource = Models.ValueSources.FixedValueSource;

    export class FixedValueSourceFactory implements IValueSourceFactory {
        public readonly name: string = "FixedValueSource";

        constructor(private validationRequired: boolean) {
            this.validationRequired = validationRequired;
        }

        create(dwField: IDwField): IValueSource {
            return new FixedValueSource(this.validationRequired, dwField);
        }
    }
}