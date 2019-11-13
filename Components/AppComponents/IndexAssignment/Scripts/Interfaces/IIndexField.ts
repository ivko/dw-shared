namespace DW.IndexAssignment.Interfaces {
    export interface IIndexField {
        readonly name: string;
        readonly displayName: string;
        readonly availableValueSources: IValueSource[];
        readonly valueSource: IValueSource;
        readonly dwField: IDwField;

        activateValueSource(valueSource: IValueSource): void;
    }
}