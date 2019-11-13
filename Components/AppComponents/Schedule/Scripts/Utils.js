(function (factory) {
    if (typeof define === "function" && define.amd) {
        define([
            "jquery",
            "knockout",
            "../../../global"
        ], factory);
    } else {
        factory(jQuery, ko);
    }
}(function ($, ko) {
    var Enums = {
        ScheduleType: {
            Never: 0,
            Daily: 1,
            Weekly: 2,
            Monthly: 3
        },
        ScheduleRepeatingType: {
            Never: 0,
            By_minute: 1,
            Hourly: 2,
            Daily: 3,
            Weekly: 4,
            Monthly: 5
        },
        DailyRepeatingEveryType: {
            None: 0,
            Hours: 1,
            Minutes: 2
        },
        DailyOccurrenceType: {
            None: 0,
            EveryDay: 1,
            Weekdays: 2,
            Weekends: 3,
            Custom: 4
        },
        WeeklyOccurrenceType: {
            None: 0,
            EveryWeek: 1,
            Every2Weeks: 2,
            Every3Weeks: 3
        },
        MonthlyOccurrenceType: {
            None: 0,
            EveryMonth: 1,
            Every2Month: 2,
            Every3Month: 3,
            Every4Month: 4,
            Every6Month: 5
        },
        Weekdays: {
            None: 0,
            Monday: 1,
            Tuesday: 2,
            Wednesday: 3,
            Thursday: 4,
            Friday: 5,
            Saturday: 6,
            Sunday: 7,
        },        
        MonthlyRepeatOnType: {
            None: 0,
            SelectDate: 1,
            First: 2,
            Second: 3,
            Third: 4,
            Fourth: 5
        },
        Time: {
            '00:00': 0,
            '01:00': 1,
            '02:00': 2,
            '03:00': 3,
            '04:00': 4,
            '05:00': 5,
            '06:00': 6,
            '07:00': 7,
            '08:00': 8,
            '09:00': 9,
            '10:00': 10,
            '11:00': 11,
            '12:00': 12,
            '13:00': 13,
            '14:00': 14,
            '15:00': 15,
            '16:00': 16,
            '17:00': 17,
            '18:00': 18,
            '19:00': 19,
            '20:00': 20,
            '21:00': 21,
            '22:00': 22,
            '23:00': 23
        },
        EndTime: {            
            '01:00': 1,
            '02:00': 2,
            '03:00': 3,
            '04:00': 4,
            '05:00': 5,
            '06:00': 6,
            '07:00': 7,
            '08:00': 8,
            '09:00': 9,
            '10:00': 10,
            '11:00': 11,
            '12:00': 12,
            '13:00': 13,
            '14:00': 14,
            '15:00': 15,
            '16:00': 16,
            '17:00': 17,
            '18:00': 18,
            '19:00': 19,
            '20:00': 20,
            '21:00': 21,
            '22:00': 22,
            '23:00': 23,
            '24:00': 24
        },
        getKeyByValue: function (obj, val) {
            var res;
            if (obj) {
                $.each(obj, function (key, value) {
                    if (value == val) {
                        res = key;
                        return false;
                    }
                });
                return res;
            }
        }
    };

    var scheduleNamespace = dev.docuware.com.settings.common.dwschedule;

    var Utils = {
        createEmptyModel: function ()
        {
            var emptyModel = new scheduleNamespace.ScheduleOnTime();
            emptyModel.Type = Enums.ScheduleType.Never;

            emptyModel.DailySchedule = null;
            emptyModel.WeeklySchedule = null;
            emptyModel.MonthlySchedule = null;

            return emptyModel;
        },
        createDailyModel: function (startAt, dailyOccurrenceType, weekdays, repeatEveryType, repeatEveryValue, endAt) {
            var dailyModel = new scheduleNamespace.ScheduleOnTime();
            dailyModel.Type = Enums.ScheduleType.Daily;
            dailyModel.DailySchedule = {};
            dailyModel.DailySchedule.StartAt = startAt;

            if (endAt) {                
                dailyModel.DailySchedule.EndAt = endAt;
            }
            else {
                // Fix a problem with date null parsing Bug 139245 and Bug 140441
                dailyModel.DailySchedule.EndAt = new Date(1, 1, 1);            
            }

            dailyModel.DailySchedule.RepeatEveryType = repeatEveryType;
            dailyModel.DailySchedule.RepeatEveryValue = repeatEveryValue;

            dailyModel.DailySchedule.DailyOccurrenceType = dailyOccurrenceType;
            dailyModel.DailySchedule.CustomWeekdays = weekdays;
            dailyModel.WeeklySchedule = null;
            dailyModel.MonthlySchedule = null;

            return dailyModel;
        },
        createWeeklyModel: function (startAt, weeklyOccurrenceType, repeatOnWeekday) {
            var weeklyModel = new scheduleNamespace.ScheduleOnTime();
            weeklyModel.Type = Enums.ScheduleType.Weekly;
            weeklyModel.WeeklySchedule = {};
            weeklyModel.WeeklySchedule.StartAt = startAt;
            weeklyModel.WeeklySchedule.WeeklyOccurrenceType = weeklyOccurrenceType;
            weeklyModel.WeeklySchedule.RepeatOnWeekday = repeatOnWeekday;
            weeklyModel.DailySchedule = null;
            weeklyModel.MonthlySchedule = null;

            return weeklyModel;
        },
        createMonthlyModel: function (startAt, monthlyOccurrenceType, monthlyRepeatingOnType, repeatOnWeekday, repeatOnMonthday) {
            var monthlyModel = new scheduleNamespace.ScheduleOnTime();
            monthlyModel.Type = Enums.ScheduleType.Monthly;
            monthlyModel.MonthlySchedule = {};
            monthlyModel.MonthlySchedule.StartAt = startAt;            
            monthlyModel.MonthlySchedule.MonthlyOccurrenceType = monthlyOccurrenceType;
            monthlyModel.MonthlySchedule.RepeatOnType = monthlyRepeatingOnType;
            if (monthlyRepeatingOnType == Enums.MonthlyRepeatOnType.SelectDate) {
                monthlyModel.MonthlySchedule.RepeatOnWeekday = 0;
                monthlyModel.MonthlySchedule.RepeatOnMonthday = repeatOnMonthday;
            }
            else {
                monthlyModel.MonthlySchedule.RepeatOnWeekday = repeatOnWeekday;
                monthlyModel.MonthlySchedule.RepeatOnMonthday = 0;
            }

            monthlyModel.DailySchedule = null;
            monthlyModel.WeeklySchedule = null;
            
            return monthlyModel;
        },
        convertObjectToArray: function (obj, showOptions, optionsType) {
            var result = [];
            var o = showOptions ? showOptions : null;

            if (obj) {
                $.each(obj, function (key, value) {
                    if (key === "None")
                        return;

                    if (o && optionsType && DW.Utils.isEqual(optionsType, DW.ScheduleComponent.Enums.ScheduleRepeatingType)) {
                        switch (value) {
                            case optionsType.By_minute: {
                                DW.Utils.isEmptyNullUndefinedWhitespace(o.showMinutely) ? result.push({ key: key, value: value }) : 
                                    o.showMinutely ? result.push({ key: key, value: value }) : function () { };
                                break;
                            }
                            case optionsType.Hourly: {
                                DW.Utils.isEmptyNullUndefinedWhitespace(o.showHourly) ? result.push({ key: key, value: value }) :
                                    o.showHourly ? result.push({ key: key, value: value }) : function () { };
                                break;
                            }
                            case optionsType.Daily: {
                                DW.Utils.isEmptyNullUndefinedWhitespace(o.showDaily) ? result.push({ key: key, value: value }) :
                                    o.showDaily ? result.push({ key: key, value: value }) : function () { };
                                break;
                            }
                            case optionsType.Weekly: {
                                DW.Utils.isEmptyNullUndefinedWhitespace(o.showWeekly) ? result.push({ key: key, value: value }) :
                                    o.showWeekly ? result.push({ key: key, value: value }) : function () { };
                                break;
                            }
                            case optionsType.Monthly: {
                                DW.Utils.isEmptyNullUndefinedWhitespace(o.showMonthly) ? result.push({ key: key, value: value }) :
                                    o.showMonthly ? result.push({ key: key, value: value }) : function () { };
                                break;
                            }
                            default: {
                                result.push({ key: key, value: value });
                                break;
                            }
                        }
                    } else {
                        result.push({ key: key, value: value });
                    }
                });
            }
            if (result.length > 0) {
                return result;
            }
        }
    };

    extend(ns('DW.ScheduleComponent'), {
        Enums: Enums,
        Utils: Utils
    });
}));