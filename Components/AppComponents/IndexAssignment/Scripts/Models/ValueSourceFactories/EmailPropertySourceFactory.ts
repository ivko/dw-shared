namespace DW.IndexAssignment.Models.ValueSourceFactories {
    import IValueSourceFactory = Interfaces.IValueSourceFactory;
    import IDwField = Interfaces.IDwField;
    import IValueSource = Interfaces.IValueSource;
    import EmailPropertyValueSource = Models.ValueSources.EmailPropertyValueSource;

    export class EmailPropertySourceFactory implements IValueSourceFactory {
        public readonly name: string = "EmailPropertyValueSource";

        constructor(private validationRequired: boolean) {
            this.validationRequired = validationRequired;
        }

        create(dwField: IDwField): IValueSource {
            return new EmailPropertyValueSource(this.validationRequired, dwField);
        }
    }
}