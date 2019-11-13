namespace DW.IndexAssignment.Interfaces {
    import DwFieldType = Models.DwFieldType;

    export interface IDwField {
        readonly fieldLabel: string,
        readonly fieldType: DwFieldType;
        readonly maxLength: number;
        readonly readOnly: boolean;
        readonly prefillValue: any;
        readonly fieldMask: string;
        readonly fieldMaskTooltip: string;
        readonly fieldMaskPlaceholder: string;
        readonly visible: boolean;
        readonly required: boolean;
        readonly numberPrecision: number;
    }
}