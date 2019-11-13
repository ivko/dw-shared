(function(factory) {
    if (typeof define === "function" && define.amd) {
        define([
            "jquery",
            "knockout",
            "./ScheduleVM",
            "../../../ViewModels/BaseComponentApi",
            "../../../global"
            ],
            factory);
    } else {
        factory(jQuery, ko);
    }
}(function($, ko) {
    //Define default vms that would be used inside the component. 
    extend(ns('DW.ScheduleComponent'),
        {
            Templates: {},
            Resources: {},
            localize: function(key, params) {
                var resources = DW.ScheduleComponent.Resources;
                return DW.Utils.format((resources && resources[key]) || key || '', params);
            }
        });

    var ComponentApi = new Class({
        Extends: DW.BaseComponentApi,
        options: {
            changeHandler: function(scheduleSettings) {}
        },
        getDefaultInstances: function() {
            var self = this;
            return {
                getComponentVM: function (scheduleSettings, minimumMinutes, showMinimumMinutesInfobox, showSections) {
                    return new DW.ScheduleComponent.ScheduleVM({
                        changeHandler: self.options.changeHandler,
                        scheduleSettings: scheduleSettings,
                        minimumMinutes: minimumMinutes,
                        showMinimumMinutesInfobox: showMinimumMinutesInfobox,
                        showSections: showSections
                    });
                }
            };
        },
        templates: {
            main: "schedule-main"
        },
        resources: DWResources.Schedule,
        initialize: function(options) {
            this.parent(options);

            this.set(DW.ScheduleComponent);

            this.componentTemplate = this.templates.main;

            //this.utils = new DW.ScheduleComponent.Utils();
        },
        getComponentViewModel: function (scheduleSettings, minimumMinutes, showMinimumMinutesInfobox, showSections) {
            return this.instances.getComponentVM(scheduleSettings, minimumMinutes, showMinimumMinutesInfobox, showSections);
        }
    });

    DW.ScheduleComponent.ComponentApi = ComponentApi;

}));