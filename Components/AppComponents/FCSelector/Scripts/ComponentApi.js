(function () {
    /* Define SourceTargetFileCabinets template factories */
    var SourceTargetFileCabinetsTemplateFactory = {
        definitions: {
            'SourceTargetFileCabinetsVM': 'source-target-file-cabinets-template'
        },
        get: function (obj) {
            if (instanceOf(obj, DW.FCSelector.SourceTargetFileCabinetsVM)) {
                return this.definitions.SourceTargetFileCabinetsVM;
            }
            else {
                throw new TypeError('SourceTargetFileCabinetsTemplateFactory: invalid type');
            }
        }
    };

    var ComponentApi = new Class({
        Extends: DW.BaseComponentApi,
        initialize: function (options) {
            this.parent(options);
            this.set(DW.FCSelector);
        },
        templateFactory: function (name, obj) {
            return this.options.templateFactories[name].get(obj)
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
        createSourceTargetFileCabinetsVM: function (options) {
            if (!options.dwActivityLeftOffset) {
                options.dwActivityLeftOffset = "0px";
            }
            return new DW.FCSelector.SourceTargetFileCabinetsVM(options);
        }
    });

    //Define default vms that would be used inside the component. 
    extend(ns('DW.FCSelector'), {
        ComponentApi: ComponentApi,
        DefaultInstances: {
            createSourceTargetFileCabinetsVM: function (options) {
                return new DW.FCSelector.SourceTargetFileCabinetsVM(options);
            }
        },
        Templates: {},
        Resources: (DWResources && DWResources.FCSelector) ? DWResources.FCSelector : {},
        localize: function (key, params) {
            var resources = (DWResources && DWResources.FCSelector) ? DWResources.FCSelector : {};
            return DW.Utils.format((resources && resources[key]) || key || '', params);
        },
        getSourceTargetFileCabinetsTemplateFactory: function (definitions) {
            var factory = Object.clone(SourceTargetFileCabinetsTemplateFactory);
            factory.definitions = $.extend({}, SourceTargetFileCabinetsTemplateFactory.definitions, definitions);
            return factory;
        }
    });
})();