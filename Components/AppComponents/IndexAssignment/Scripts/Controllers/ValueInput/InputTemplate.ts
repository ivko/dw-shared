namespace DW.IndexAssignment.Controllers.ValueInput {
    import IValueSource = Interfaces.IValueSource;
    import IDwField = Interfaces.IDwField;

    export abstract class InputTemplate {
        public static createInputTemplate(valueSource: IValueSource, dwField: IDwField, valueChangesArray: KnockoutObservableArray<string>): BaseValueInputTemplate {
            let inputTemplates: BaseValueInputTemplate[] = this.getInputTemplates(valueSource, dwField, valueChangesArray);

            //based on the value source and field type we have to return the right template for inputs
            for (let template of inputTemplates) {
                if (template.canHandle()) {
                    return template;
                }
            }

            //no matching template couldn't be found, return default template
            return new NullValueTemplate();
        }

        private static getInputTemplates(valueSource: IValueSource, dwField: IDwField, valueChangesArray: KnockoutObservableArray<string>): BaseValueInputTemplate[] {
            let output: BaseValueInputTemplate[] = [];

            //all possible input template are defined here
            output.push(new FixedValueNumberTemplate(valueChangesArray, valueSource, dwField));
            output.push(new FixedValueDateTemplate(valueChangesArray, valueSource, dwField));
            output.push(new KeywordTemplate(valueChangesArray, valueSource, dwField));
            output.push(new EmailPropertyTemplate(valueChangesArray, valueSource));
            output.push(new FixedValueStringTemplate(valueChangesArray, valueSource, dwField));

            return output;
        }
    }
}