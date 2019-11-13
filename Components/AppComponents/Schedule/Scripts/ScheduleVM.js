(function (factory) {
    if (typeof define === "function" && define.amd) {
        define([
            "jquery",
            "knockout",
            "../../../jstz",
            "globalize",
            "knockout.validation",
            "dw/global",
            "dw/ViewModels/BusyTriggerVM",
            "./Utils",
            "./TimeZoneMapping"
        ], factory);
    } else {
        factory(jQuery, ko, Jstz, Globalize);
    }
}(function ($, ko, Jstz) {
    var MINIMUM_MINUTES = 1;
    var _MINIMUM_MINUTES = MINIMUM_MINUTES;
    var dftIanaIndx;
    DW.ScheduleComponent.TimeZoneMapping.IanaValues.forEach(function (ianas, index) {
        var localIanaIndex = ianas.indexOf("Etc/GMT");
        if (localIanaIndex > -1)
            dftIanaIndx = index;
    });
    var DEFAULT_IANA_INDEX = dftIanaIndx;

    var ScheduleVM = new Class({
        Extends: DW.BusyTriggerVM,
        options: {
            scheduleSettings: {
            },
            changeHandler: function (scheduleSettings) {
            },
            minimumMinutes: null
        },
        getSettings: function () {
            this.options.scheduleSettings.ClientTimeZone = this.clientTimeZone();
            return this.options.scheduleSettings;
        },
        initialize: function (options) {
            extend(this.options, options || {});

            this.showMinutely = ko.observable(true);
            this.showHourly = ko.observable(true);
            this.showDaily = ko.observable(true);
            this.showWeekly = ko.observable(true);
            this.showMonthly = ko.observable(true);

            if (this.options && this.options.showSections) {
                var o = this.options.showSections;
                this.showMinutely(DW.Utils.isEmptyNullUndefinedWhitespace(o.showMinutely) ? true : o.showMinutely);
                this.showHourly(DW.Utils.isEmptyNullUndefinedWhitespace(o.showHourly) ? true : o.showHourly);
                this.showDaily(DW.Utils.isEmptyNullUndefinedWhitespace(o.showDaily) ? true : o.showDaily);
                this.showWeekly(DW.Utils.isEmptyNullUndefinedWhitespace(o.showWeekly) ? true : o.showWeekly);
                this.showMonthly(DW.Utils.isEmptyNullUndefinedWhitespace(o.showMonthly) ? true : o.showMonthly);
            }

            this.summary = ko.observable();
            this.showTimeZoneDropdown = ko.observable(true);

            var scheduleSettings = this.options.scheduleSettings;
            if (scheduleSettings.LocalTimeZoneOffset === scheduleSettings.ClientTimeZoneOffset ||
                scheduleSettings.Type === DW.ScheduleComponent.Enums.ScheduleType.Never)
                this.showTimeZoneDropdown = ko.observable(false);

            var displayZone;
            if (!scheduleSettings.ClientTimeZone || scheduleSettings.ClientTimeZone.length < 1) {
                // if empty
                displayZone = this.getDisplayTimeZone(Jstz.determine().name());
            } else {
                displayZone = this.getDisplayTimeZone(scheduleSettings.ClientTimeZone);
            }

            this.displayTimeZone = ko.observable(displayZone);

            var self = this;

            this.isOnline = ko.observable(false);
            this.showMinimumMinutesInfobox = ko.observable(false);

            if (this.options.minimumMinutes) {
                _MINIMUM_MINUTES = this.options.minimumMinutes;
            } else {
                _MINIMUM_MINUTES = MINIMUM_MINUTES;
            }

            if (this.options.showMinimumMinutesInfobox) {
                this.showMinimumMinutesInfobox(this.options.showMinimumMinutesInfobox);
            }

            this.repeatType = ko.observable();

            this.clientTimeZone = ko.computed(function () {
                var displayValue = this.displayTimeZone();
                var displayIndex = DW.ScheduleComponent.TimeZoneMapping.DisplayValues.indexOf(displayValue);
                var local = Jstz.determine().name();
                if (DW.ScheduleComponent.TimeZoneMapping.IanaValues[displayIndex].indexOf(local) > -1) {
                    return local;
                } else {
                    return DW.ScheduleComponent.TimeZoneMapping.IanaValues[displayIndex][0];
                }
            }, this);

            this.dailyValidationEnabled = ko.computed(function () {
                return self.repeatType() == DW.ScheduleComponent.Enums.ScheduleRepeatingType.Hourly ||
                    self.repeatType() == DW.ScheduleComponent.Enums.ScheduleRepeatingType.By_minute;
            });

            this.repeatTypeList = DW.ScheduleComponent.Utils.convertObjectToArray(DW.ScheduleComponent.Enums.ScheduleRepeatingType, this.options.showSections ? this.options.showSections : null, DW.ScheduleComponent.Enums.ScheduleRepeatingType);

            this.dailyOccurrence = ko.observable(DW.ScheduleComponent.Enums.DailyOccurrenceType.EveryDay);

            this.dailyOccurrenceList = DW.ScheduleComponent.Utils.convertObjectToArray(DW.ScheduleComponent.Enums.DailyOccurrenceType);

            this.dailyRepeatEveryHourMax = ko.observable(24);
            this.dailyRepeatEveryHourMin = ko.observable(1);
            this.dailyRepeatEveryMinuteMax = ko.observable(24 * 60);
            this.dailyRepeatEveryMinuteMin = ko.observable(_MINIMUM_MINUTES);

            var today = new Date();

            this.dailyStartDate = ko.observable(today);
            this.dailyStartTime = ko.observable(today.getHours());

            this.fullEndTimeList = DW.ScheduleComponent.Utils.convertObjectToArray(DW.ScheduleComponent.Enums.EndTime);
            this.endTimeList = ko.observableArray(this.fullEndTimeList);

            this.dailyEndTime = ko.observable();
            this._setDailyEndTimeToDefault();

            this.dailyRepeatEveryRequired = ko.computed(function () {
                return self.dailyEndTime() == -1;
            });

            this.dailyRepeatEveryHourValue = ko.observable(1).extend({
                required: {
                    onlyIf: self.dailyValidationEnabled,
                    params: self.dailyRepeatEveryRequired,
                    message: function () {
                        return String.format(DW.ScheduleComponent.localize('MissingDailyRepeatEvery_Text'),
                            DW.ScheduleComponent.localize('Hours_Label'));
                    }
                },
                min: {
                    onlyIf: self.dailyValidationEnabled,
                    params: self.dailyRepeatEveryHourMin,
                    message: function () {
                        return String.format(DW.ScheduleComponent.localize("DailyRepeatEvery_Min_Text"),
                            self.dailyRepeatEveryHourMin(),
                            DW.ScheduleComponent.localize('Hours_Label'));
                    }
                },
                max: {
                    onlyIf: self.dailyValidationEnabled,
                    params: self.dailyRepeatEveryHourMax,
                    message: function () {
                        return String.format(DW.ScheduleComponent.localize("DailyRepeatEvery_Max_Text"),
                            self.dailyRepeatEveryHourMax(),
                            DW.ScheduleComponent.localize('Hours_Label'));
                    }
                }
            }).isModified(false);

            this.dailyRepeatEveryMinuteValue = ko.observable(_MINIMUM_MINUTES).extend({
                required: {
                    onlyIf: self.dailyValidationEnabled,
                    params: self.dailyRepeatEveryRequired,
                    message: function () {
                        return String.format(DW.ScheduleComponent.localize('MissingDailyRepeatEvery_Text'),
                            DW.ScheduleComponent.localize('Minutes_Label'));
                    }
                },
                min: {
                    onlyIf: self.dailyValidationEnabled,
                    params: self.dailyRepeatEveryMinuteMin,
                    message: function () {
                        return String.format(DW.ScheduleComponent.localize("DailyRepeatEvery_Min_Text"),
                            self.dailyRepeatEveryMinuteMin(),
                            DW.ScheduleComponent.localize('Minutes_Label'));
                    }
                },
                max: {
                    onlyIf: self.dailyValidationEnabled,
                    params: self.dailyRepeatEveryMinuteMax,
                    message: function () {
                        return String.format(DW.ScheduleComponent.localize("DailyRepeatEvery_Max_Text"),
                            self.dailyRepeatEveryMinuteMax(),
                            DW.ScheduleComponent.localize('Minutes_Label'));
                    }
                }
            }).isModified(false);

            this._initRepeatType(scheduleSettings);

            this.dailyEndDateList = [];

            this.timeList = DW.ScheduleComponent.Utils.convertObjectToArray(DW.ScheduleComponent.Enums.Time);

            this.weeklyOccurrence = ko.observable();

            this.weeklyOccurrenceList = DW.ScheduleComponent.Utils.convertObjectToArray(DW.ScheduleComponent.Enums.WeeklyOccurrenceType);

            this.weeklyWeekday = ko.observable();

            this.weekdaysList = DW.ScheduleComponent.Utils.convertObjectToArray(DW.ScheduleComponent.Enums.Weekdays);

            this.weeklyStartDate = ko.observable(today);

            this.monthlyOccurrence = ko.observable();

            this.monthlyOccurrenceList = DW.ScheduleComponent.Utils.convertObjectToArray(DW.ScheduleComponent.Enums.MonthlyOccurrenceType);

            this.monthlyStartDate = ko.observable(today);

            this.monthlyScheduleWeek = ko.observable();

            this.monthlyScheduleWeekList = DW.ScheduleComponent.Utils.convertObjectToArray(DW.ScheduleComponent.Enums.MonthlyRepeatOnType);

            this.dailyCustomOccurrenceMonday = ko.observable(false);
            this.dailyCustomOccurrenceTuesday = ko.observable(false);
            this.dailyCustomOccurrenceWednesday = ko.observable(false);
            this.dailyCustomOccurrenceThursday = ko.observable(false);
            this.dailyCustomOccurrenceFriday = ko.observable(false);
            this.dailyCustomOccurrenceSaturday = ko.observable(false);
            this.dailyCustomOccurrenceSunday = ko.observable(false);

            this.monthlyWeekday = ko.observable();

            this.dayOfMonth = ko.observable();

            this.dayOfMonthList = [];
            for (var dayIndex = 1; dayIndex <= 31; dayIndex++) {
                this.dayOfMonthList.push({ key: dayIndex, value: dayIndex });
            }

            this.scheduleEnabled = ko.computed(
                function () {
                    return self.repeatType() != DW.ScheduleComponent.Enums.ScheduleRepeatingType.Never;
                }
            );

            this.summary = ko.observable();

            this.init();

            this.updateSummary();

            this._addChangeHandler();
        },
        _addChangeHandler: function () {
            var self = this;
            return this.addDisposable(this.addDisposable(ko.computed(function () {
                return self.changeHandler.call(this);
            },
                this)).extend({ deferred: true }));
        }.protect(),
        _fixDateTimeFromSS: function (settings) {
            if (settings && settings.Type) {
                switch (settings.Type) {
                    case 1: { // Daily 
                        var daily = settings.DailySchedule;
                        daily.StartAt = DW.DateTime.getDateFromSSDate(daily.StartAt);
                        daily.EndAt = DW.DateTime.getDateFromSSDate(daily.EndAt);

                        break;
                    }
                    case 2: { // Weekly
                        var weekly = settings.WeeklySchedule;
                        weekly.StartAt = DW.DateTime.getDateFromSSDate(weekly.StartAt);

                        break;
                    }
                    case 3: { // Monthly
                        var monthly = settings.MonthlySchedule;
                        monthly.StartAt = DW.DateTime.getDateFromSSDate(monthly.StartAt);

                        break;
                    }
                }
            }
        },
        _fixDateTimeForSS: function (settings) {
            if (settings && settings.Type) {
                switch (settings.Type) {
                    case 1: { // Daily 
                        var daily = settings.DailySchedule;
                        daily.StartAt = DW.DateTime.getDateForSS(daily.StartAt);
                        daily.EndAt = DW.DateTime.getDateForSS(daily.EndAt);

                        break;
                    }
                    case 2: { // Weekly
                        var weekly = settings.WeeklySchedule;
                        weekly.StartAt = DW.DateTime.getDateForSS(weekly.StartAt);

                        break;
                    }
                    case 3: { // Monthly
                        var monthly = settings.MonthlySchedule;
                        monthly.StartAt = DW.DateTime.getDateForSS(monthly.StartAt);

                        break;
                    }
                }
            }
        },
        _getCustomWeekDays: function () {
            var customWeekDays = [];

            if (this.dailyCustomOccurrenceMonday()) {
                customWeekDays.push(DW.ScheduleComponent.Enums.Weekdays.Monday);
            }
            if (this.dailyCustomOccurrenceTuesday()) {
                customWeekDays.push(DW.ScheduleComponent.Enums.Weekdays.Tuesday);
            }
            if (this.dailyCustomOccurrenceWednesday()) {
                customWeekDays.push(DW.ScheduleComponent.Enums.Weekdays.Wednesday);
            }
            if (this.dailyCustomOccurrenceThursday()) {
                customWeekDays.push(DW.ScheduleComponent.Enums.Weekdays.Thursday);
            }
            if (this.dailyCustomOccurrenceFriday()) {
                customWeekDays.push(DW.ScheduleComponent.Enums.Weekdays.Friday);
            }
            if (this.dailyCustomOccurrenceSaturday()) {
                customWeekDays.push(DW.ScheduleComponent.Enums.Weekdays.Saturday);
            }
            if (this.dailyCustomOccurrenceSunday()) {
                customWeekDays.push(DW.ScheduleComponent.Enums.Weekdays.Sunday);
            }

            return customWeekDays;
        },
        _clearCustomWeekDays: function () {
            this.dailyCustomOccurrenceMonday(false);
            this.dailyCustomOccurrenceTuesday(false);
            this.dailyCustomOccurrenceWednesday(false);
            this.dailyCustomOccurrenceThursday(false);
            this.dailyCustomOccurrenceFriday(false);
            this.dailyCustomOccurrenceSaturday(false);
            this.dailyCustomOccurrenceSunday(false);
        },
        changeHandler: function () {
            var repeatType = this.repeatType();

            var changedSettings;
            if (this.dailyOccurrence() !== DW.ScheduleComponent.Enums.DailyOccurrenceType.Custom) {
                this._clearCustomWeekDays();
            }

            if (repeatType == DW.ScheduleComponent.Enums.ScheduleRepeatingType.Daily) {

                var customWeekDays = this._getCustomWeekDays();

                var startDate = this.dailyStartDate();
                this.dailyStartTime(startDate.getHours());
                this._setDailyEndTimeToDefault();

                changedSettings = DW.ScheduleComponent.Utils.createDailyModel(
                    startDate,
                    this.dailyOccurrence(),
                    customWeekDays,
                    DW.ScheduleComponent.Enums.DailyRepeatingEveryType.None,
                    _MINIMUM_MINUTES/*default value*/,
                    this.dailyEndTime() >= 0 ? this.calculateDateTime(startDate, this.dailyEndTime()) : null);
            }
            else if (repeatType == DW.ScheduleComponent.Enums.ScheduleRepeatingType.Hourly) {
                var startingHourlyDate = this.dailyStartDate();
                var customWeekDays = this._getCustomWeekDays();

                this.dailyStartTime(startingHourlyDate.getHours());

                if (this.dailyStartTime() >= this.dailyEndTime()) {
                    this._setDailyEndTimeToDefault();
                }
                this._filterEndTimeList();

                changedSettings = DW.ScheduleComponent.Utils.createDailyModel(
                    startingHourlyDate,
                    this.dailyOccurrence(),
                    customWeekDays,
                    DW.ScheduleComponent.Enums.DailyRepeatingEveryType.Hours,
                    parseInt(this.dailyRepeatEveryHourValue()),
                    this.dailyEndTime() >= 0 ? this.calculateDateTime(startingHourlyDate, this.dailyEndTime()) : null);
            }
            else if (repeatType == DW.ScheduleComponent.Enums.ScheduleRepeatingType.By_minute) {
                var startingMinutelyDate = this.dailyStartDate();
                var customWeekDays = this._getCustomWeekDays();

                this.dailyStartTime(startingMinutelyDate.getHours());

                if (this.dailyStartTime() >= this.dailyEndTime()) {
                    this._setDailyEndTimeToDefault();
                }
                this._filterEndTimeList();

                changedSettings = DW.ScheduleComponent.Utils.createDailyModel(
                    startingMinutelyDate,
                    this.dailyOccurrence(),
                    customWeekDays,
                    DW.ScheduleComponent.Enums.DailyRepeatingEveryType.Minutes,
                    parseInt(this.dailyRepeatEveryMinuteValue()),
                    this.dailyEndTime() >= 0 ? this.calculateDateTime(startingMinutelyDate, this.dailyEndTime()) : null);
            }
            else if (repeatType == DW.ScheduleComponent.Enums.ScheduleRepeatingType.Weekly) {
                changedSettings = DW.ScheduleComponent.Utils.createWeeklyModel(
                    this.weeklyStartDate(),
                    this.weeklyOccurrence(),
                    this.weeklyWeekday());
            }
            else if (repeatType == DW.ScheduleComponent.Enums.ScheduleRepeatingType.Monthly) {
                changedSettings = DW.ScheduleComponent.Utils.createMonthlyModel(
                    this.monthlyStartDate(),
                    this.monthlyOccurrence(),
                    this.monthlyScheduleWeek(),
                    this.monthlyWeekday(),
                    this.dayOfMonth());
            }
            else if (repeatType == DW.ScheduleComponent.Enums.ScheduleRepeatingType.Never) {
                changedSettings = DW.ScheduleComponent.Utils.createEmptyModel();
            }

            changedSettings.ClientTimeZone = this.clientTimeZone();
            changedSettings.ClientTimeZoneOffset = this.options.scheduleSettings.ClientTimeZoneOffset;
            changedSettings.LocalTimeZoneOffset = this.options.scheduleSettings.LocalTimeZoneOffset;

            this.options.changeHandler(changedSettings);
            this.updateSummary();
        },
        init: function () {
            var scheduleSettings = this.options.scheduleSettings;
            if (!scheduleSettings) {
                scheduleSettings = DW.ScheduleComponent.Utils.createEmptyModel();
            }

            if (scheduleSettings.Type == DW.ScheduleComponent.Enums.ScheduleType.Daily) {

                var startAt = scheduleSettings.DailySchedule.StartAt;
                this.dailyStartDate(startAt);
                this.dailyStartTime(startAt.getHours());
                if (scheduleSettings.DailySchedule.EndAt) {
                    var endAtDate = scheduleSettings.DailySchedule.EndAt;
                    this.dailyEndTime((endAtDate.getHours() == 23 && endAtDate.getMinutes() > 58)
                        ? 24
                        : endAtDate.getHours());
                } else {
                    this._setDailyEndTimeToDefault();
                }

                if (scheduleSettings.DailySchedule.DailyOccurrenceType) {
                    this.dailyOccurrence(scheduleSettings.DailySchedule.DailyOccurrenceType);
                }

                if (scheduleSettings.DailySchedule.RepeatEveryType == DW.ScheduleComponent.Enums.DailyRepeatingEveryType.Hours)
                    this.dailyRepeatEveryHourValue(scheduleSettings.DailySchedule.RepeatEveryValue ? scheduleSettings.DailySchedule.RepeatEveryValue : 1);
                else if (scheduleSettings.DailySchedule.RepeatEveryType == DW.ScheduleComponent.Enums.DailyRepeatingEveryType.Minutes)
                    this.dailyRepeatEveryMinuteValue(scheduleSettings.DailySchedule.RepeatEveryValue ? scheduleSettings.DailySchedule.RepeatEveryValue : _MINIMUM_MINUTES);

                if (scheduleSettings.DailySchedule.CustomWeekdays) {
                    var weekDays = scheduleSettings.DailySchedule.CustomWeekdays;
                    for (var index = 0; index < weekDays.length; index++) {
                        if (weekDays[index] == DW.ScheduleComponent.Enums.Weekdays.Monday) {
                            this.dailyCustomOccurrenceMonday(true);
                        }
                        else if (weekDays[index] == DW.ScheduleComponent.Enums.Weekdays.Tuesday) {
                            this.dailyCustomOccurrenceTuesday(true);
                        }
                        else if (weekDays[index] == DW.ScheduleComponent.Enums.Weekdays.Wednesday) {
                            this.dailyCustomOccurrenceWednesday(true);
                        }
                        else if (weekDays[index] == DW.ScheduleComponent.Enums.Weekdays.Thursday) {
                            this.dailyCustomOccurrenceThursday(true);
                        }
                        else if (weekDays[index] == DW.ScheduleComponent.Enums.Weekdays.Friday) {
                            this.dailyCustomOccurrenceFriday(true);
                        }
                        else if (weekDays[index] == DW.ScheduleComponent.Enums.Weekdays.Saturday) {
                            this.dailyCustomOccurrenceSaturday(true);
                        }
                        else if (weekDays[index] == DW.ScheduleComponent.Enums.Weekdays.Sunday) {
                            this.dailyCustomOccurrenceSunday(true);
                        }
                    }
                }
            }
            else if (scheduleSettings.Type == DW.ScheduleComponent.Enums.ScheduleType.Weekly) {
                var startAt = scheduleSettings.WeeklySchedule.StartAt;

                this.weeklyStartDate(new Date(startAt.getFullYear(), startAt.getMonth(), startAt.getDate(), startAt.getHours(), startAt.getMinutes()));

                this.weeklyOccurrence(scheduleSettings.WeeklySchedule.WeeklyOccurrenceType);

                this.weeklyWeekday(scheduleSettings.WeeklySchedule.RepeatOnWeekday);
            }
            else if (scheduleSettings.Type == DW.ScheduleComponent.Enums.ScheduleType.Monthly) {

                var startAt = scheduleSettings.MonthlySchedule.StartAt;

                this.monthlyStartDate(new Date(startAt.getFullYear(), startAt.getMonth(), startAt.getDate(), startAt.getHours(), startAt.getMinutes()));

                this.monthlyOccurrence(scheduleSettings.MonthlySchedule.MonthlyOccurrenceType);

                this.monthlyScheduleWeek(scheduleSettings.MonthlySchedule.RepeatOnType);

                this.monthlyWeekday(scheduleSettings.MonthlySchedule.RepeatOnWeekday);

                this.dayOfMonth(scheduleSettings.MonthlySchedule.RepeatOnMonthday);
            }

        },
        validate: function () {
            var self = this;
            return DW.Deferred(function (dfd) {
                var error = [];
                var currentHourError = self.dailyRepeatEveryHourValue.error();
                if (currentHourError) {
                    error.push(currentHourError);
                }

                var currentMinuteError = self.dailyRepeatEveryMinuteValue.error();
                if (currentMinuteError) {
                    error.push(currentMinuteError);
                }

                if (self.repeatType() == DW.ScheduleComponent.Enums.ScheduleRepeatingType.Daily) {

                    if (self.dailyOccurrence() == DW.ScheduleComponent.Enums.DailyOccurrenceType.Custom) {
                        if (!self.dailyCustomOccurrenceMonday() &&
                            !self.dailyCustomOccurrenceTuesday() &&
                            !self.dailyCustomOccurrenceWednesday() &&
                            !self.dailyCustomOccurrenceThursday() &&
                            !self.dailyCustomOccurrenceFriday() &&
                            !self.dailyCustomOccurrenceSaturday() &&
                            !self.dailyCustomOccurrenceSunday()) {
                            currentError = DW.ScheduleComponent.localize('SelectDayErrorText');
                            if (currentError) {
                                error.push(currentError);
                            }
                        }
                    }
                }

                if (self.repeatType() == DW.ScheduleComponent.Enums.ScheduleRepeatingType.Hourly ||
                    self.repeatType() == DW.ScheduleComponent.Enums.ScheduleRepeatingType.By_minute) {
                    if (self.dailyEndTime() >= 0 && self.dailyEndTime() < self.dailyStartTime()) {
                        currentError = DW.ScheduleComponent.localize('EndTimeIsBeforeStartTimeErrorText');
                        if (currentError) {
                            error.push(currentError);
                        }
                    }
                }

                (error && error.length > 0) ? dfd.reject({
                    message: error
                }) : dfd.resolve();
            }).promise();
        },
        _getWeekDaysText: function () {
            var weekDaysText = '';

            if (this.dailyOccurrence() == DW.ScheduleComponent.Enums.DailyOccurrenceType.Custom) {
                if (this.dailyCustomOccurrenceMonday()) {
                    weekDaysText += DW.ScheduleComponent.localize('Monday');
                }
                if (this.dailyCustomOccurrenceTuesday()) {
                    if (weekDaysText.length > 0) weekDaysText += ", ";
                    weekDaysText += DW.ScheduleComponent.localize('Tuesday');
                }
                if (this.dailyCustomOccurrenceWednesday()) {
                    if (weekDaysText.length > 0) weekDaysText += ", ";
                    weekDaysText += DW.ScheduleComponent.localize('Wednesday');
                }
                if (this.dailyCustomOccurrenceThursday()) {
                    if (weekDaysText.length > 0) weekDaysText += ", ";
                    weekDaysText += DW.ScheduleComponent.localize('Thursday');
                }
                if (this.dailyCustomOccurrenceFriday()) {
                    if (weekDaysText.length > 0) weekDaysText += ", ";
                    weekDaysText += DW.ScheduleComponent.localize('Friday');
                }
                if (this.dailyCustomOccurrenceSaturday()) {
                    if (weekDaysText.length > 0) weekDaysText += ", ";
                    weekDaysText += DW.ScheduleComponent.localize('Saturday');
                }
                if (this.dailyCustomOccurrenceSunday()) {
                    if (weekDaysText.length > 0) weekDaysText += ", ";
                    weekDaysText += DW.ScheduleComponent.localize('Sunday');
                }
            }
            if (this.dailyOccurrence() == DW.ScheduleComponent.Enums.DailyOccurrenceType.Weekdays) {
                weekDaysText += DW.ScheduleComponent.localize('Monday');
                weekDaysText += ", ";
                weekDaysText += DW.ScheduleComponent.localize('Tuesday');
                weekDaysText += ", ";
                weekDaysText += DW.ScheduleComponent.localize('Wednesday');
                weekDaysText += ", ";
                weekDaysText += DW.ScheduleComponent.localize('Thursday');
                weekDaysText += ", ";
                weekDaysText += DW.ScheduleComponent.localize('Friday');
            }
            if (this.dailyOccurrence() == DW.ScheduleComponent.Enums.DailyOccurrenceType.Weekends) {
                weekDaysText += DW.ScheduleComponent.localize('Saturday');
                weekDaysText += ", ";
                weekDaysText += DW.ScheduleComponent.localize('Sunday');
            }

            return weekDaysText;
        },
        updateSummary: function () {
            var repeatType = this.repeatType();
            var scheduleSettings = this.options.scheduleSettings;

            var changedSettings;
            var summaryText;
            if (repeatType == DW.ScheduleComponent.Enums.ScheduleRepeatingType.Daily) {                
                var startDateText = this.getDateText(this.dailyStartDate());

                if (this.dailyOccurrence() == DW.ScheduleComponent.Enums.DailyOccurrenceType.EveryDay) {
                    summaryText = DW.Utils.format(DW.ScheduleComponent.localize('DailyRepeatEveryDayNonRecurringText'), startDateText);
                } else {
                    var weekDaysText = this._getWeekDaysText();
                    summaryText = DW.Utils.format(DW.ScheduleComponent.localize('DailyRepeatCustomDaysNonRecurringText'), weekDaysText, startDateText);
                }
            }
            else if (repeatType == DW.ScheduleComponent.Enums.ScheduleRepeatingType.Hourly) {
                var startDateTextHourSummary = this.getDateText(this.dailyStartDate());
                var endTimeTextHourSummary = this.getDateText(this.dailyStartDate(), this.dailyEndTime());
                var everyValHourSummary = this.dailyRepeatEveryHourValue() + ' ' + DW.ScheduleComponent.localize('Hours');

                if (this.dailyOccurrence() == DW.ScheduleComponent.Enums.DailyOccurrenceType.EveryDay) {
                    summaryText = DW.Utils.format(DW.ScheduleComponent.localize('DailyRepeatEveryDayRecurringText'), everyValHourSummary, startDateTextHourSummary, endTimeTextHourSummary);
                } else {
                    var weekDaysText = this._getWeekDaysText();
                    summaryText = DW.Utils.format(DW.ScheduleComponent.localize('DailyRepeatCustomDaysRecurringText'), weekDaysText, everyValHourSummary, startDateTextHourSummary, endTimeTextHourSummary);
                }
            }
            else if (repeatType == DW.ScheduleComponent.Enums.ScheduleRepeatingType.By_minute) {
                var startDateTextMinuteSummary = this.getDateText(this.dailyStartDate());
                var endTimeTextMinuteSummary = this.getDateText(this.dailyStartDate(), this.dailyEndTime());
                var everyValMinuteSummary = this.dailyRepeatEveryMinuteValue() + ' ' + DW.ScheduleComponent.localize('Minutes');

                if (this.dailyOccurrence() == DW.ScheduleComponent.Enums.DailyOccurrenceType.EveryDay) {
                    summaryText = DW.Utils.format(DW.ScheduleComponent.localize('DailyRepeatEveryDayRecurringText'), everyValMinuteSummary, startDateTextMinuteSummary, endTimeTextMinuteSummary);
                } else {
                    var weekDaysText = this._getWeekDaysText();
                    summaryText = DW.Utils.format(DW.ScheduleComponent.localize('DailyRepeatCustomDaysRecurringText'), weekDaysText, everyValMinuteSummary, startDateTextMinuteSummary, endTimeTextMinuteSummary);
                }
            }
            else if (repeatType == DW.ScheduleComponent.Enums.ScheduleRepeatingType.Weekly) {
                var weeklyOccurrence = DW.ScheduleComponent.localize(DW.ScheduleComponent.Enums.getKeyByValue(DW.ScheduleComponent.Enums.WeeklyOccurrenceType, this.weeklyOccurrence()));

                var weekday = DW.ScheduleComponent.localize(DW.ScheduleComponent.Enums.getKeyByValue(DW.ScheduleComponent.Enums.Weekdays, this.weeklyWeekday()));

                var startDateWeeklyText = this.getDateText(this.weeklyStartDate());

                summaryText = DW.Utils.format(DW.ScheduleComponent.localize('WeeklyRepeatSummaryText'), weeklyOccurrence, weekday, startDateWeeklyText);
            }
            else if (repeatType == DW.ScheduleComponent.Enums.ScheduleRepeatingType.Monthly) {
                var monthlyOccurrence = DW.ScheduleComponent.localize(DW.ScheduleComponent.Enums.getKeyByValue(DW.ScheduleComponent.Enums.MonthlyOccurrenceType, this.monthlyOccurrence()));
                var startDateMonthlyText = this.getDateText(this.monthlyStartDate());

                if (this.monthlyScheduleWeek() == DW.ScheduleComponent.Enums.MonthlyRepeatOnType.SelectDate) {
                    var dayOfMonth = this.dayOfMonth();
                    var suffix = "";
                    switch (dayOfMonth) {
                        case 1: 
                        case 21:
                        case 31: {
                            suffix = DW.ScheduleComponent.localize('day_first');
                            break;
                        }
                        case 2:
                        case 22: {
                            suffix = DW.ScheduleComponent.localize('day_second');
                            break;
                        }
                        case 3:
                        case 23: {
                            suffix = DW.ScheduleComponent.localize('day_third');
                            break;
                        }
                        default: {
                            suffix = DW.ScheduleComponent.localize('day_other');
                        }
                    }

                    summaryText = DW.Utils.format(DW.ScheduleComponent.localize('MonthlyRepeatByMonthdaySummaryText'), monthlyOccurrence, dayOfMonth, suffix, startDateMonthlyText);
                }
                else {
                    var weekday = DW.ScheduleComponent.localize(DW.ScheduleComponent.Enums.getKeyByValue(DW.ScheduleComponent.Enums.Weekdays, this.monthlyWeekday()));
                    var repeatOn = DW.ScheduleComponent.localize(DW.ScheduleComponent.Enums.getKeyByValue(DW.ScheduleComponent.Enums.MonthlyRepeatOnType, this.monthlyScheduleWeek()));
                    summaryText = DW.Utils.format(DW.ScheduleComponent.localize('MonthlyRepeatByWeekdaySummaryText'), monthlyOccurrence, repeatOn, weekday, startDateMonthlyText);
                }

            }
            else if (repeatType == DW.ScheduleComponent.Enums.ScheduleRepeatingType.Never) {
                this.summary(DW.ScheduleComponent.localize('NeverRepeatSummaryText'));
            }

            if (repeatType !== DW.ScheduleComponent.Enums.ScheduleRepeatingType.Never && (scheduleSettings.ClientTimeZoneOffset !== scheduleSettings.LocalTimeZoneOffset)) {
                //var offsetInHours = scheduleSettings.ClientTimeZoneOffset / 60;
                //var hours = Math.floor(offsetInHours);
                //var minutesFraction = offsetInHours - hours;
                //var minutes = minutesFraction * 60;
                //var minutesStr = "00" + minutes;
                //clientTimeZoneOffsetString = hours + ':' + minutesStr.substr(minutesStr.length - 2);

                summaryText += scheduleSettings.ClientTimeZoneOffset !== 0 ? " " + this.getDisplayTimeZone(this.clientTimeZone()) : "";
            }

            if (summaryText) {
                if (summaryText.indexOf('{0}') < 0) {
                    this.summary(summaryText);
                } else {
                    this.summary(null);
                }
            }
        },
        getDateText: function (date, hours) {
            var resDate;

            if (hours)
                resDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours);
            else
                resDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes());

            return Globalize.format(resDate, "t", Globalize.culture().name);
        },
        calculateDateTime: function (date, hour) {
            if (date && hour != null) {
                if (hour == 24) {
                    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
                }
                else {
                    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour);
                }
            }
        },
        getDisplayTimeZone: function (ianaTimeZone) {
            var ianaIndex = DEFAULT_IANA_INDEX;
            DW.ScheduleComponent.TimeZoneMapping.IanaValues.forEach(function (ianas, index) {
                var localIanaIndex = ianas.indexOf(ianaTimeZone);
                if (localIanaIndex > -1)
                    ianaIndex = index;
            });
            return DW.ScheduleComponent.TimeZoneMapping.DisplayValues[ianaIndex];
        },
        _filterEndTimeList: function () {
            var self = this;
            var dailyStartTimeInEndTimeList = this.fullEndTimeList.first(function (endTime) {
                return endTime.value === self.dailyStartTime();
            });

            var dailyStartTimeIndex = self.fullEndTimeList.indexOf(dailyStartTimeInEndTimeList);
            self.endTimeList(self.fullEndTimeList.slice(dailyStartTimeIndex + 1));
        },
        _setDailyEndTimeToDefault: function () {
            this.dailyEndTime(this.fullEndTimeList.first(function (endTime) {
                return endTime.key === "24:00";
            }).value);
        },
        _initRepeatType: function (scheduleSettings) {
            switch (scheduleSettings.Type) {
                case DW.ScheduleComponent.Enums.ScheduleType.Monthly:
                    this.repeatType(DW.ScheduleComponent.Enums.ScheduleRepeatingType.Monthly.toString());
                    break;
                case DW.ScheduleComponent.Enums.ScheduleType.Weekly:
                    this.repeatType(DW.ScheduleComponent.Enums.ScheduleRepeatingType.Weekly.toString());
                    break;
                case DW.ScheduleComponent.Enums.ScheduleType.Daily: {
                    if (scheduleSettings.DailySchedule.RepeatEveryType == DW.ScheduleComponent.Enums.DailyRepeatingEveryType.Hours)
                        this.repeatType(DW.ScheduleComponent.Enums.ScheduleRepeatingType.Hourly.toString());
                    else if (scheduleSettings.DailySchedule.RepeatEveryType == DW.ScheduleComponent.Enums.DailyRepeatingEveryType.Minutes)
                        this.repeatType(DW.ScheduleComponent.Enums.ScheduleRepeatingType.By_minute.toString());
                    else
                        this.repeatType(DW.ScheduleComponent.Enums.ScheduleRepeatingType.Daily.toString());

                    break;
                }
                default:
                    this.repeatType(DW.ScheduleComponent.Enums.ScheduleRepeatingType.Never.toString());
            }
        },
        localizeDailyEndTime: function (timeItem) {
            var date = this.dailyStartDate();
            return this.getDateText(date, timeItem.value);
        }
    });

    extend(ns('DW.ScheduleComponent'), {
        ScheduleVM: ScheduleVM
    });
}));