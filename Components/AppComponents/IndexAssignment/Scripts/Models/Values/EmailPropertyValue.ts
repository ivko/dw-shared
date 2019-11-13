namespace DW.IndexAssignment.Models.Values {
    import IValue = Interfaces.IValue;

    export class EmailPropertyValue implements IValue {
        public readonly exportValue: string;

        constructor(emailProperty: string) {
            this.exportValue = emailProperty;
        }

        public value(): any {
            return this.exportValue;
        }
    }
}