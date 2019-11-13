namespace DW.IndexAssignment.Interfaces {
    export interface IValue {
        readonly exportValue: string;
        value(): any;
    }
}