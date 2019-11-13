namespace DW.IndexAssignment.Interfaces {
    export interface IValueSource {
        readonly name: string;
        readonly displayName: string;
        readonly valueField: IField;
        readonly validationRequired: boolean;

        validateValues(): void;
    }
}