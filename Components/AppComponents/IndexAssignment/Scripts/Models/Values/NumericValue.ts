namespace DW.IndexAssignment.Models.Values {
    import IValue = Interfaces.IValue;

    export class NumericValue implements IValue {
        public readonly exportValue: string;
        private _numericValue: number;

        constructor(numericValue: number) {
            this.exportValue = numericValue.toString();
            this._numericValue = numericValue;
        }

        public value(): any {
            return this._numericValue;
        }
    }
}