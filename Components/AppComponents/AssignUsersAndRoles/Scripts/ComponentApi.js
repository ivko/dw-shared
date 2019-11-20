(function (factory) {
    if (typeof define === "function" && define.amd) {
        define([
            "jquery",
            "knockout",
            "./UsersAndRolesDialog",
            "./UsersAndRolesDialogVM",
            "../../../ViewModels/BaseComponentApi"
        ], factory);
    } else {
        factory(jQuery, ko);
    }
}(function ($, ko) {

    var ComponentApi = new Class({
        Extends: DW.BaseComponentApi,
        getDefaultInstances: function () {
            return DW.AssignUsersAndRolesComponent.DefaultInstances;
        },
        templates: {
            info: "users-and-roles-dialog-info",
            row: "users-and-roles-table-row-template",
            dialogButtons: "users-and-roles-dialog-buttons",
            filterButtons: "users-and-roles-filter-buttons"
        },
 resources: DWResources.UsersAndRoles,
        initialize: function (options) {
            /// <summary></summary>
            /// <param name="options">
            ///     getResources: getResources: function () { return {}; }                      // resources
            ///     getTemplates: getTemplates: function () { return {}; }                      // templates
            ///     instances: {getDialog: function (options) { return new vm(options); }, 
            ///                 getDialogVM: function (options) { return new vm(options); }, 
            ///                 getTableRowVM: function (options) {return new vm(options); } }  // view models
            /// </param>
            this.parent(options);

            this.set(DW.AssignUsersAndRolesComponent);
            //DW.AssignUsersAndRolesComponent.Templates = this.getTemplates();
            //DW.AssignUsersAndRolesComponent.Resources = this.getResources();
        },
        getDialog: function (options) {
            return this.instances.getDialog(options);
        },
        getDialogVM: function (options) {
            return this.instances.getDialogVM($.extend({
                getTableRowVM: this.instances.getTableRowVM
            }, options));
        }
    });

    //Define default vms that would be used inside the component. 
    extend(ns('DW.AssignUsersAndRolesComponent'), {
        ComponentApi: ComponentApi,
        DefaultInstances: {
            getDialog: function (options) {
                return new DW.AssignUsersAndRolesComponent.UsersAndRolesDialog(options);
            },
            getDialogVM: function (options) {
                return new DW.AssignUsersAndRolesComponent.UsersAndRolesDialogVM(options);
            },
            getTableRowVM: function (options) {
                return new DW.AssignUsersAndRolesComponent.UsersAndRolesTableRowVM(options);
            }
        },
        Templates: {},
        Resources: DWResources.UsersAndRoles,
        localize: function (key, params) {
            var resources = DW.AssignUsersAndRolesComponent.Resources;
            return DW.Utils.format((resources && resources[key]) || key || '', params);
        }
    });
}));