(function (factory) {
    if (typeof define === "function" && define.amd) {
        define([
            "jquery",
            "knockout",
            "../../../Widgets/dialogs/js/Dialog",
            "../../../Widgets/dwActivity/js/ko.bindingHandlers.dwActivity",
            "../../../Widgets/resizableColumns/js/ko.bindingHandlers.resizableColumns",
            "../../../Commands/Scripts/CommandBindingHandler"
        ], factory);
    } else {
        factory(jQuery, ko);
    }
}(function ($, ko) {
    var UsersAndRolesDialog = new Class({
        Extends: DW.Dialog,

        options: {
            template: 'add-users-and-roles-dialog',
            modes: [DW.DialogModes.disposableVM, DW.DialogModes.customEscape, DW.DialogModes.autoSize],
            options: {
                minHeight: 200,
                width: 660,
                minWidth: 660
            }
        },
        initialize: function (options) {
            options.title = options.title ? options.title : DW.AssignUsersAndRolesComponent.localize('AddUsersAndRolesDialog_Title');

            this.parent(options);
        },
        close: function () {
            //why do we setTitle on close ? 
            this.setTitle(this.options.options.title);
            return this.parent();
        }
    }); 

    extend(ns('DW.AssignUsersAndRolesComponent'), {
        UsersAndRolesDialog: UsersAndRolesDialog
    });

    }));
