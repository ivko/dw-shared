(function (factory) {
    if (typeof define === "function" && define.amd) {
        define(["jquery", "knockout", "../global", "./ViewModel"], factory);
    } else {
        factory(jQuery, ko);
    }
}(function ($, ko) {

    var OutOfOfficeSettingsVM = new Class({
        Extends: DW.ViewModel,
        errorMessages: {
            reverceDates: "",
            requiredDate: ""
        },
        formatters: {
            fromServer: function (date) { return date; },
            toServer: function (date) { return date; }
        },
        initialize: function (settings, errorMessages, formatters) {
            this.isOutOfTheOffice = ko.observable(false);

            this.errorMessages = $.extend(this.errorMessages, errorMessages);

            this.fromDate = ko.observable().extend({
                validation: {
                    validator: function (val) {
                        return !this.isOutOfTheOffice() || val;
                    }.bind(this),
                    message: this.errorMessages.requiredDate
                }
            });

            this.untilDate = ko.observable().extend({
                validation: {
                    validator: function (val) {
                        return !this.isOutOfTheOffice() || !val || val > this.fromDate();
                    }.bind(this),
                    message: this.errorMessages.reverceDates
                }
            });
            
            this.formatters = $.extend(this.formatters, formatters);
            this.parent();

            this.initSettings(settings);
        },

        initSettings: function (settings) {
            this.originalSettings = settings;

            this.isOutOfTheOffice(this.originalSettings.IsOutOfOffice);

            if (this.originalSettings.IsOutOfOffice) {
                this.fromDate(DW.DateTime.getValidDateTime(this.formatters.fromServer(this.originalSettings.StartDateTime)));
                this.untilDate(this.originalSettings.EndDateTimeSpecified ? DW.DateTime.getValidDateTime(this.formatters.fromServer(this.originalSettings.EndDateTime)) : null);
            }
        },

        mergeUIToSettings: function (settings) {
            var fromDate = settings.StartDateTime,
                toDate = settings.EndDateTime,
                endDateTimeSpecified = settings.EndDateTimeSpecified;

            if (this.isOutOfTheOffice()) {
                fromDate = this.formatters.toServer(this.fromDate());
                toDate = this.formatters.toServer(this.untilDate());
                if (toDate) {
                    endDateTimeSpecified = true;
                }
                else {
                    toDate = settings.EndDateTime;//new Date(-62135596800000)
                    endDateTimeSpecified = false;
                }
            }

            return {
                IsOutOfOffice: this.isOutOfTheOffice(),
                StartDateTime: fromDate,
                EndDateTime: toDate,
                EndDateTimeSpecified: endDateTimeSpecified,
            };
        },

        buildSettings: function () {
            return this.mergeUIToSettings(this.originalSettings);
        },

        hasChanges: function () {
            var settings = this.buildSettings();

            return this.originalSettings &&
                (settings.IsOutOfOffice !== this.originalSettings.IsOutOfOffice ||
                !DW.DateTime.compareDateTimes(this.formatters.fromServer(settings.StartDateTime), this.formatters.fromServer(this.originalSettings.StartDateTime)) ||
                !DW.DateTime.compareDateTimes(this.formatters.fromServer(settings.EndDateTime), this.formatters.fromServer(this.originalSettings.EndDateTime)));
        },

        getErrors: function () {
            return [this.fromDate.error(), this.untilDate.error()]
                .filter(function (error) { return !!error; });
        },
    });

    extend(ns('DW'), {
        OutOfOfficeSettingsVM: OutOfOfficeSettingsVM
    });

}));