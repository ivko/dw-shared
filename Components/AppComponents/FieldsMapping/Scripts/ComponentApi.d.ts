declare namespace DW.FieldsMapping {
    export class ComponentApi {
        constructor();
        createFieldsMappingDialogVM(options: IFieldsMappingDialogOptions): FieldsMappingDialogVM;
        createFieldsMappingDialog(options: any): FieldsMappingDialog;
    }

    export class FieldsMappingDialogVM extends BaseDialogVM {
        constructor(options: IFieldsMappingDialogOptions);
    }

    export class FieldsMappingDialog extends Dialog {
        constructor(options: any);
    }

    export interface IFieldsMappingDialogOptions {
        mappedIndexFields: Array<FieldsMapping>;
        sourceFileCabinetFields: Array<dev.docuware.com.settings.filecabinet.Field>;
        targetFileCabinetFields: Array<dev.docuware.com.settings.filecabinet.Field>;
        sourceFileCabinetName: string;
        targetFileCabinetName: string;
    }

    export class FieldsMapping {
        constructor();
        Source: dev.docuware.com.settings.filecabinet.Field;
        Target: dev.docuware.com.settings.filecabinet.Field;
    }

    // Example how to call this dialog and how to use the result
    // just call _changeFieldsMapping() in ViewModel
    //
    //
    //private indexFieldAssignments: KnockoutObservableArray<DW.FieldsMapping.FieldsMapping> = ko.observableArray<DW.FieldsMapping.FieldsMapping>();
    //
    //private _changeFieldsMapping(): void {
    //    const componentApi = new DW.FieldsMapping.ComponentApi();
    //
    //    const vm = componentApi.createFieldsMappingDialogVM({
    //        mappedIndexFields: this.indexFieldAssignments(),
    //        sourceFileCabinetFields: this.sourceFields,
    //        targetFileCabinetFields: this.targetFields,
    //        sourceFileCabinetName: this.selectedSourceFC.Header.Name,
    //        targetFileCabinetName: this.selectedTargetFC.Header.Name
    //    });
    //
    //    vm.finished.done(((newFieldsMapping: Array<this.indexFieldAssignments>) => {
    //        this.indexFieldAssignments(newFieldsMapping);
    //    }).bind(this));
    //
    //    const dialog = componentApi.createFieldsMappingDialog({ getVM: function () { return vm; } });
    //
    //    setTimeout(() => {
    //        dialog.open();
    //    }, 0);
    //}
}
