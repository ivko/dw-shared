/// <reference path="../../IndexAssignment.ts"/>

namespace DW.IndexAssignment.Models.ValueSources {
    import IValueSource = Interfaces.IValueSource;

    export class BaseValueSource implements IValueSource {
        public readonly name: string;
        public readonly displayName: string;
        public readonly validationRequired: boolean;
        public readonly valueField: Interfaces.IField;

        constructor(validationRequired: boolean) {
            this.validationRequired = validationRequired;
        }

        public validateValues(): void {
            if (this.valueField) {
                this.valueField.validate();
            }
        }
    }
}