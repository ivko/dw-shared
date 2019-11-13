namespace DW.IndexAssignment.Interfaces {
    import DwFieldType = Models.DwFieldType;

    export interface IValidationEntry {
        readonly indexFieldName: string;
        readonly indexFieldType: DwFieldType;
        readonly valueSourceName: string;
        readonly value: any;
    }
}