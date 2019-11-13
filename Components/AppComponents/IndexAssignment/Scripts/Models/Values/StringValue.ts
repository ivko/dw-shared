namespace DW.IndexAssignment.Models.Values {
    import IValue = Interfaces.IValue;

    export class StringValue implements IValue {
        public readonly exportValue: string;

        constructor(stringValue: string) {
            this.exportValue = stringValue;
        }

        public value(): any {
            return this.exportValue;
        }
    }
}