(function () {    
    var ConnectionDialog = new Class({
        Extends: DW.Dialog,
        options: {
            template: 'connection-dialog',
            modes: [DW.DialogModes.disposableVM, DW.DialogModes.customEscape, DW.DialogModes.autoSize],
            options: {
                title: DW.ConnectionDialog.localize('ConnectionDialog_Title'),
                width: 600,
                minWidth: 460,
                minHeight: 200
            }
        }
    });

    extend(ns('DW.ConnectionDialog'), {        
        ConnectionDialog: ConnectionDialog
    });
})();