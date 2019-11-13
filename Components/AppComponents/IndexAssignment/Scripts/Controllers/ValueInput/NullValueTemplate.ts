namespace DW.IndexAssignment.Controllers.ValueInput {
    export class NullValueTemplate extends BaseValueInputTemplate {
        public readonly templateName: KnockoutObservable<string> = ko.observable('nullvalue-template');

        public canHandle(): boolean {
            //this is the default template, that's why it always can handle it
            return true;
        }
    }
}