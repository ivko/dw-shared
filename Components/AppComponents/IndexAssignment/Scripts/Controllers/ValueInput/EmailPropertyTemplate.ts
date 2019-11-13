/// <reference path="../../IndexAssignment.ts"/>

namespace DW.IndexAssignment.Controllers.ValueInput {
    import IValueSource = Interfaces.IValueSource;
    import EmailPropertyValue = Models.Values.EmailPropertyValue;

    class EmailProperty {
        constructor(public readonly id: string, public readonly name: string) { }
    }

    export class EmailPropertyTemplate extends BaseValueInputTemplate {
        public readonly templateName: KnockoutObservable<string> = ko.observable('emailproperties-template');
        public readonly emailProperties: EmailProperty[] = [];

        constructor(valueChangesArray: KnockoutObservableArray<string>, valueSourceField: IValueSource) {
            super(valueSourceField);

            this.pushEmailPropertyArray('SendDate', 'IndexAssignment_EmailProperty_SendDate');
            this.pushEmailPropertyArray('ReceivedDate', 'IndexAssignment_EmailProperty_ReceivedDate');
            this.pushEmailPropertyArray('Recipients', 'IndexAssignment_EmailProperty_Recipients');
            this.pushEmailPropertyArray('RecipientsEmail', 'IndexAssignment_EmailProperty_Recipients_Email');
            this.pushEmailPropertyArray('Sender', 'IndexAssignment_EmailProperty_Sender');
            this.pushEmailPropertyArray('SenderEmail', 'IndexAssignment_EmailProperty_Sender_Email');
            this.pushEmailPropertyArray('Subject', 'IndexAssignment_EmailProperty_Subject');
            this.pushEmailPropertyArray('Contact', 'IndexAssignment_EmailProperty_Contact');
            this.pushEmailPropertyArray('ContactEmail', 'IndexAssignment_EmailProperty_Contact_Email');
            this.pushEmailPropertyArray('Direction', 'IndexAssignment_EmailProperty_Direction');
            this.pushEmailPropertyArray('Size', 'IndexAssignment_EmailProperty_Size');
            this.pushEmailPropertyArray('CC', 'IndexAssignment_EmailProperty_CC_Name');
            this.pushEmailPropertyArray('CCEmail', 'IndexAssignment_EmailProperty_CC_Email');
            this.pushEmailPropertyArray('BCC', 'IndexAssignment_EmailProperty_BCC_Name');
            this.pushEmailPropertyArray('BCCEmail', 'IndexAssignment_EmailProperty_BCC_Email');
            this.pushEmailPropertyArray('SendTo', 'IndexAssignment_EmailProperty_SendTo');
            this.pushEmailPropertyArray('SendToEmail', 'IndexAssignment_EmailProperty_SendTo_Email');
            this.pushEmailPropertyArray('AttachmentNames', 'IndexAssignment_EmailProperty_AttachmentNames');

            this.emailProperties.sort(this.sortEmailProperties);

            this.value.subscribe(x => {
                this.valueSourceField.valueField.setValue(new EmailPropertyValue(x));
                valueChangesArray.push(x);
            });
        }

        public canHandle(): boolean {
            return (this.valueSourceField.name === 'EmailPropertyValueSource');
        }

        private pushEmailPropertyArray(propertyId: string, localizationToken: string) : void {
            this.emailProperties.push(new EmailProperty(propertyId, DW.IndexAssignment.localize(localizationToken)));
        }

        private sortEmailProperties(a: EmailProperty, b: EmailProperty) {
            if (a.name.toLowerCase() < b.name.toLowerCase())
                return -1;
            if (a.name.toLowerCase() > b.name.toLowerCase())
                return 1;
            return 0;
        }
    }
}