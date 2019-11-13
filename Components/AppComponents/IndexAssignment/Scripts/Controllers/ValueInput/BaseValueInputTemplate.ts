namespace DW.IndexAssignment.Controllers.ValueInput {
    import IValueSource = Interfaces.IValueSource;

    export abstract class BaseValueInputTemplate {
        public abstract readonly templateName: KnockoutObservable<string>;

        public readonly value: KnockoutObservable<any> = ko.observable(null);
        public readonly valueSourceField: IValueSource;

        constructor(valueSourceField?: IValueSource) {
            if (valueSourceField) {
                this.valueSourceField = valueSourceField;
            }
        }

        public abstract canHandle(): boolean;
    }
}