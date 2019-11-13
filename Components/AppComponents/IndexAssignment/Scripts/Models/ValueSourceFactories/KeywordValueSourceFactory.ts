namespace DW.IndexAssignment.Models.ValueSourceFactories {
    import IValueSourceFactory = Interfaces.IValueSourceFactory;
    import IDwField = Interfaces.IDwField;
    import IValueSource = Interfaces.IValueSource;
    import KeywordValueSource = Models.ValueSources.KeywordValueSource;

    export class KeywordValueSourceFactory implements IValueSourceFactory {
        public readonly name: string = "KeywordValueSourceFactory";

        constructor(private validationRequired: boolean) {
            this.validationRequired = validationRequired;
        }

        create(dwField: IDwField): IValueSource {
            let valueSourceFactories: IValueSourceFactory[] = [];

            valueSourceFactories.push(new FixedValueSourceFactory(this.validationRequired));
            valueSourceFactories.push(new EmailPropertySourceFactory(this.validationRequired));

            return new KeywordValueSource(valueSourceFactories, this.validationRequired);
        }
    }
}