namespace DW.IndexAssignment.Models.Values {
    import IValue = Interfaces.IValue;

    export class DateValue implements IValue {
        public readonly exportValue: string;
        private _dateValue: Date;

        constructor(dateValue: Date) {
            this.exportValue = dateValue.toUTCString();
            this._dateValue = dateValue;
        }

        public value(): any {
            return this._dateValue;
        }
    }
}