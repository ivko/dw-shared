(function( factory ) {
    if ( typeof define === "function" && define.amd ) { // AMD.
        define(["jquery", "globalize", "moment", "jstz"], factory);
    } else { // Global
        factory(jQuery, Globalize, moment, Jstz);
    }
}(function ($, Globalize, moment, Jstz) {

    var setCommonDateTimeDefaults = function (options) {
        /// <summary>
        ///     Fills DW.DateTime.CommonSettings with settings: 
        ///             language, calendar, calendarName, calendarItemNames,
        ///             datePattern, dateSeparator, timeSeparator, ampmNames
        ///     The settings are used lated in datepicker, timepicker and datetimepicker
        /// </summary>
        /// <param name="options">culture info should be passed in options</param>
        var _options = $.extend({
            getCultureInfo: function () {
                return Globalize.culture().name;
            }
        }, options),
        getCalendarName = function () {
            var calendar = Globalize.culture().calendar.name;
            if (calendar === 'UmAlQura') {
                return 'ummalqura';
            } else if (calendar === 'Hijri') {
                return 'islamic';
            } else {
                return 'gregorian';
            }
        },
        getDateFormatSeparator = function (pattern) {
            /// <summary>
            ///     Finds the separator between day, month and year in the date pattern defined in Globalize for the current culture
            /// </summary>
            /// <param name="pattern" type="String">May be dd/MM/yyyy, yyyy-MM-dd, etc...</param>
            /// <returns type="String">May be "/", ".", etc...</returns>
            var separator;

            '-/. '.split('').some(function (s) {
                if (pattern.split(s).length > 1) {
                    separator = s;
                    return true;
                }
                return false;
            });

            return separator;
        },
        getAMPMNames = function (regCalendar) {
            /// <summary>
            ///     From the culture calendar finds the names of the AM, PM time postfixes
            /// </summary>
            /// <param name="regCalendar">globalize culture calendar</param>
            /// <returns type="Array">[] or [AM_name, PM_name]</returns>

            var AMPM = [],
                pattern = regCalendar.patterns.t;

            if (!pattern || pattern.indexOf('h') !== (-1)) {

                if (typeof regCalendar.AM === 'string') {
                    AMPM[0] = regCalendar.AM;
                    AMPM[1] = regCalendar.PM;
                }
                else {
                    AMPM[0] = regCalendar.AM[0];
                    AMPM[1] = regCalendar.PM[0];
                }
            }

            return AMPM;
        },
        culture = Globalize.culture(),
        language = _options.getCultureInfo(),
        calendarName = getCalendarName(),
        calendar = (calendarName === "ummalqura") ? culture.calendar : (Globalize.findClosestCulture(language) || (Globalize.cultures['default'])).calendar,  //ugly arabic patch: if using UmAlQura use arabic month names, otherwise use UI-language ones
        calendarItemNames = {
            monthNames: calendar.months.names.slice(0, 12),
            monthNamesShort: calendar.months.namesAbbr.slice(0, 12),
            dayNames: calendar.days.names,
            dayNamesShort: calendar.days.namesAbbr
        },
        datePattern = culture.calendar.patterns.d;

        DW.DateTime.CommonSettings = {
            calendar: calendar,
            calendarName: calendarName,
            calendarItemNames: calendarItemNames,
            datePattern: datePattern,
            dateSeparator: getDateFormatSeparator(datePattern),
            language: language,
            timeSeparator: ':',
            calendarFirstDay: culture.calendar.firstDay,
            ampmNames: getAMPMNames(culture.calendar)
        };

    };

    var getCommonDateTimeDefaults = function (options) {
        if (!DW.DateTime.CommonSettings)
            setCommonDateTimeDefaults(options);

        return DW.DateTime.CommonSettings;
    };

    var fromString = function (value) {
        /// <summary>
        ///     Try to get date from whatever string we pass. If the string is date-only:'2017-01-17', it stays as is: the date is not moved by the local timezone.
        /// </summary>
        /// <param name="value" type="string">string date</param>
        /// <returns type="Date">js date object</returns>
        if (!value) return null;

        var mDate = moment(value);
        return mDate.isValid() ? mDate.getDate() : null;
    };

    var fromISODateString = function (value) {
        /// <summary>
        ///     Ignores the timezone and skips its display. If the string is date-only:'2017-01-17', the date part is moved by the local timezone!
        /// </summary>
        /// <param name="value">'$1901-01-01T22:00:00.0000000Z' or better: '$1901-01-01T22:00:00.000Z'</param>
        /// <returns type="Date">js date object</returns>
        if (!value) return "";
        return new Date(value);
    };

    var toISODateString = function (value) {
        /// <summary>
        ///     Convert to settings services date format - ignore the timezone
        /// </summary>
        /// <param name="value" type="Date">js date object</param>
        /// <returns type="String">'YYYY-MM-DD' date string</returns>
        if (!value) return "";
        return moment(value).format("YYYY-MM-DD");
    }

    var toUtcISODateTimeString = function (value) {
        /// <summary>
        ///     Convert to settings services date-time format
        /// </summary>
        /// <param name="value" type="Date"></param>
        /// <returns type="String"> ISO string: "2013-07-17T23:00:00.000Z", that represents the recieved date in UTC</returns>
        if (!value) return "";
  
        return moment(value).toISOString();
    };

    var getRangeStartDate = function (date) {
        /// <summary>
        ///     Adjusts the recieved js date time part to (0:0:0:0)
        /// </summary>
        /// <param name="date" type="Date"></param>
        /// <returns type="Date"></returns>
        //
        if (!date) return date;
        return normalizeDate(new Date(date.getTime()));
    };

    var getRangeEndDate = function (date) {
        /// <summary>
        ///      Adjusts the recieved js date time part to (23:59:59)
        /// </summary>
        /// <param name="date" type="Date"></param>
        /// <returns type="Date"></returns>
        //
        if (!date) return date;

        var toDate = new Date(date.getTime());

        toDate = normalizeDate(toDate);
        toDate.setDate(toDate.getDate() + 1);
        toDate.setSeconds(toDate.getSeconds() - 1);

        return toDate;
    };

    var getDateTimeRangeEnd = function (date) {
        /// <summary>
        ///     Adjusts the recieved js date seconds to 59
        /// </summary>
        /// <param name="date" type="Date"></param>
        /// <returns type="Date"></returns>

        if (!date || date.getSeconds() != 0) return date;

        var toDate = new Date(date.getTime());

        toDate.setMinutes(toDate.getMinutes() + 1);
        toDate.setSeconds(toDate.getSeconds() - 1);

        return toDate;
    };

    var getDateFromSSDate = function (date) {
        var dateVal = date ? moment.utc(date) : date;
        if (dateVal) {
            dateVal = dateVal.getDate();
        }

        return dateVal;
    };

    var getDateForSS = function (date) {
        /// <summary>
        ///     Move the date with time zone hours and make utc from it
        /// </summary>
        /// <param name="date" type="Date"></param>
        /// <returns type="Date"></returns>
        if (!date) return date;

        //move the date with time zone hours (although local) so serializer will bring it back 
        var m = moment(new Date(date.getTime()));

        return moment.utc([m.year(), m.month(), m.date(), m.hour(), m.minute(), m.second()]).toDate();
    };

    var normalizeDate = function (date) {
        if (date) {
            date.setHours(0, 0, 0, 0);
        }
        return date;
    };

    var getLocalizedDateStringFromISO = function (dateValue) {
        if (dateValue && dateValue !== '') {
            var date = moment(dateValue.substr(0, 10));

            if (date && date.isValid()) {
                return Globalize.format(date.getDate(), 'd');
            }
        }
       
        return '';
    };

    var getLocalizedDateTimeString = function (dateValue) {
        var date = moment(dateValue);
        if (date && date.isValid()) {
            return Globalize.format(date.getDate(), 'X');
        }

        return '';
    };

    var getLocalizedUTCDateTimeString = function (dateValue) {
        var date = moment(dateValue);
        if (date && date.isValid()) {
            var dateResult = moment.utc([date.year(), date.month(), date.date(), date.hour(), date.minute(), date.second()]).toDate();
            return Globalize.format(dateResult, 'X');
        }

        return '';
    };

    var compareDateTimes = function (date, originalDate) {
        if (!date && !originalDate)
            return true; //equal
        if (!date || !originalDate)
            return false; //not equal

        return date.toString() == originalDate.toString();
    };

    var ummAlQuraStartDate = new Date(1937, 2, 14);//Julian date of start of UmmAlQura epoch: 14 March 1937 CE
    var ummAlQuraEndDate = new Date(2077, 10, 16);//Julian date of end of UmmAlQura epoch: 16 November 2077 CE
    var minGregorianDate = new Date(-59011459200000);//Fri Jan 01 100 00:00:00
    var jsMinDate = new Date(0);//Jan 01 1970 00:00:00

    var getValidDateTime = function (datetime) {
        if (Globalize.culture().calendar.name === 'UmAlQura') {
            if (datetime < ummAlQuraStartDate) return null;
        }
        else if (datetime < minGregorianDate) return null;
        
        return datetime;
    };

    var getCurrentTimeZoneId = function () {
       return Jstz.determine().name();
    }

    if (!moment.fn.getDate) {
        //TODO remove when Formatters are added to ValueFormattingBundle
        moment.fn.getDate = function () {
            //takes care of _isUTC !!!!
            //return this.toDate(); //can handle <1000 year AC
            return new Date(this.year(), this.month(), this.date(), this.hour(), this.minute(), this.second());
        };
    }

    this.DW = this.DW || {};
    this.DW.DateTime = this.DW.DateTime || {};

    $.extend(this.DW.DateTime, {
        getCommonDateTimeDefaults: getCommonDateTimeDefaults,
        setCommonDateTimeDefaults: setCommonDateTimeDefaults,
        fromString: fromString,
        fromISODateString: fromISODateString,
        toISODateString: toISODateString,
        toUtcISODateTimeString: toUtcISODateTimeString,
        getRangeStartDate: getRangeStartDate,
        getRangeEndDate: getRangeEndDate,
        getDateFromSSDate: getDateFromSSDate,
        getDateForSS: getDateForSS,
        normalizeDate: normalizeDate,
        getDateTimeRangeEnd: getDateTimeRangeEnd,
        getLocalizedDateTimeString: getLocalizedDateTimeString,
        getLocalizedDateStringFromISO: getLocalizedDateStringFromISO,
        getLocalizedUTCDateTimeString: getLocalizedUTCDateTimeString,
        compareDateTimes: compareDateTimes,
        ummAlQuraStartDate: ummAlQuraStartDate,
        ummAlQuraEndDate: ummAlQuraEndDate,
        getValidDateTime: getValidDateTime,
        getCurrentTimeZoneId: getCurrentTimeZoneId,
        CommonSettings: null
    });

}));