(function () {    
    var FieldsMappingDialog = new Class({
        Extends: DW.Dialog,
        options: {
            template: 'fields-mapping-dialog',
            modes: [DW.DialogModes.disposableVM, DW.DialogModes.customEscape, DW.DialogModes.autoSize],
            options: {
                title: DW.FieldsMapping.localize('FieldsMappingDialog_Title'),
                width: 540,
                minWidth: 540,
                minHeight: 400
            }
        }
    });

    extend(ns('DW.FieldsMapping'), {        
        FieldsMappingDialog: FieldsMappingDialog
    });

})();