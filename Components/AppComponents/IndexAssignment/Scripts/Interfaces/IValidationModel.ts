namespace DW.IndexAssignment.Interfaces {
    export interface IValidationModel {
        readonly hasValidationErrors: boolean;
        readonly activeIndexFields: IIndexField[];
        readonly availableIndexFields: IIndexField[];
        readonly valueSourceFactories: IValueSourceFactory[];
        readonly defaultValueSourceFactory: IValueSourceFactory;

        filecabinetGuid: string;
        dialogGuid: string;
        trayGuid: string;
        name: string;

        validateFields(): JQueryDeferred<void>;
        activateIndexField(field: IIndexField): void;
        deactivateIndexField(field: IIndexField): void;
        exportEntries(): IValidationEntry[];
        importEntries(entries: IValidationEntry[]);
    }
}