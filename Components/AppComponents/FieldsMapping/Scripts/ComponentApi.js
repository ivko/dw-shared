//(function (factory) {
//    if (typeof define === "function" && define.amd) {
//        define([
//            "jquery",
//            "knockout",
//            "../../../global",
//            "../../../utils",
//            "../../../ViewModels/BaseComponentApi",
//            "../../../knockout-jquery-ui-widget",
//            "../../../Bindings/position",
//            "../../../Widgets/menus/js/ko.bindingHandlers.baseMenu",
//            "../../../Widgets/menus/js/ko.bindingHandlers.contextMenu"
//        ], factory);
//    } else {
//        factory(jQuery, ko);
//    }
//}(function ($, ko) {
(function () {
    /* Define SourceTargetFileCabinets template factories */
    var FieldsMappingTemplateFactory = {
        definitions: null,
        get: function (obj) {
            if (instanceOf(obj, DW.FieldsMapping.FieldsMappingDialogVM)) {
                return this.definitions.FieldsMappingDialogVM;
            }
            else {
                throw new TypeError('FieldsMappingTemplateFactory: invalid type');
            }
        }
    };

    var ComponentApi = new Class({
        Extends: DW.BaseComponentApi,
        initialize: function (options) {
            this.parent(options);
            this.set(DW.FieldsMapping);
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
        createFieldsMappingDialogVM: function (options) {
            return new DW.FieldsMapping.FieldsMappingDialogVM(options);
        },
        createFieldsMappingDialog: function(options) {
            return new DW.FieldsMapping.FieldsMappingDialog(options);
        }
    });

    //Define default vms that would be used inside the component. 
    extend(ns('DW.FieldsMapping'), {
        ComponentApi: ComponentApi,
        DefaultInstances: {
            createFieldsMappingDialogVM: function (options) {
                return new DW.FieldsMapping.FieldsMappingDialogVM(options);
            }
        },
        Templates: {},
        Resources: (DWResources && DWResources.FieldsMapping) ? DWResources.FieldsMapping : {},
        localize: function (key, params) {
            var resources = (DWResources && DWResources.FieldsMapping) ? DWResources.FieldsMapping : {};
            return DW.Utils.format((resources && resources[key]) || key || '', params);
        },
        getFieldsMappingTemplateFactory: function (definitions) {
            var factory = Object.clone(FieldsMappingTemplateFactory);
            factory.definitions = $.extend({}, FieldsMappingTemplateFactory.definitions, definitions);
            return factory;
        }
    });
    //}));
})();