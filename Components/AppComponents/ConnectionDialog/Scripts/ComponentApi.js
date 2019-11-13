(function () {
    var ConnectionDialogTemplateFactory = {
        definitions: null,
        get: function (obj) {
            if (instanceOf(obj, DW.ConnectionDialog.ConnectionDialogVM)) {
                return this.definitions.ConnectionDialogVM;
            }
            else {
                throw new TypeError('ConnectionDialogTemplateFactory: invalid type');
            }
        }
    };

    var ComponentApi = new Class({
        Extends: DW.BaseComponentApi,
        initialize: function (options) {
            this.parent(options);
            this.set(DW.ConnectionDialog);
        },
        templateFactory: function (name, obj) {
            return this.options.templateFactories[name].get(obj);
        },
        createSetting: function (type, options) {
            return this.options.createSetting.apply(this, arguments);
        },
        getSelectListData: function (fieldId, prefix) {
            return this.options
                .getSelectListData(fieldId, prefix)
                .fail(function (error) {
                    DW.Utils.handleError(error);
                });
        },
        createConnectionDialogVM: function (options) {
            return new DW.ConnectionDialog.ConnectionDialogVM(options);
        },
        createConnectionDialog: function (options) {
            return new DW.ConnectionDialog.ConnectionDialog(options);
        }
    });

    //Define default vms that would be used inside the component. 
    extend(ns('DW.ConnectionDialog'), {
        ComponentApi: ComponentApi,
        DefaultInstances: {
            createConnectionDialogVM: function (options) {
                return new DW.ConnectionDialog.ConnectionDialogVM(options);
            }
        },
        Templates: {},
        Resources: (DWResources && DWResources.ConnectionDialog) ? DWResources.ConnectionDialog : {},
        localize: function (key, params) {
            var resources = (DWResources && DWResources.ConnectionDialog) ? DWResources.ConnectionDialog : {};
            return DW.Utils.format((resources && resources[key]) || key || '', params);
        },
        getConnectionDialogTemplateFactory: function (definitions) {
            var factory = Object.clone(ConnectionDialogTemplateFactory);
            factory.definitions = $.extend({}, ConnectionDialogTemplateFactory.definitions, definitions);
            return factory;
        }
    });
    //}));
})();