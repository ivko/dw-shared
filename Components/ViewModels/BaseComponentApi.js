(function (factory) {
    if (typeof define === "function" && define.amd) {
        define(["jquery", "../global", "./ViewModel"], factory);
    } else {
        factory(jQuery);
    }
}(function ($) {

    var BaseComponentApi = new Class({
        Extends: DW.ViewModel,
        Implements: Options,
        instances: {},
        getDefaultInstances: function () {
            return {};
        },
        templates: {},
        resources: {},
        options: {
            getInstances: function () {
                return {};
            },
            getResources: function () {
                return {};
            },
            getTemplates: function () {
                return {};
            }
        },
        initialize: function (options) {
            this.setOptions(options);
            this.parent();

            this.instances = $.extend({}, this.getDefaultInstances(), this.options.getInstances());
        },

        set: function (ns) {
            //TODO: find better way
            ns.Templates = $.extend({}, this.templates, this.options.getTemplates());
            ns.Resources = $.extend({}, this.resources, this.options.getResources()); 
        }
    });

    extend(ns('DW'), {
        BaseComponentApi: BaseComponentApi
    });

}));