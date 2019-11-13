namespace DW.IndexAssignment.Models {
    import IValidationEntry = Interfaces.IValidationEntry;

    export class ValidationEntry implements IValidationEntry {
        constructor(
            public readonly indexFieldName: string,
            public readonly indexFieldType: DwFieldType,
            public readonly valueSourceName: string,
            public readonly value: any) { }
    }
}