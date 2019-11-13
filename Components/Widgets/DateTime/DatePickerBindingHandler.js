(function( factory ) {
    if ( typeof define === "function" && define.amd ) { // AMD.
        define(["jquery", "knockout", "globalize", "moment", "jquery.dateentry", "./BaseDatePickerBindingHandler"], factory);
    } else { // Global
        factory(jQuery, ko, Globalize, moment);
    }
}(function ($, ko, Globalize, moment) {

    var DatePickerBindingHandler = function () {
        var self = new DW.DateTime.BaseDatePickerBindingHandler();

        var baseInit = self.init;
        self.init = function (element, valueAccessor, allBindingsAccessor) {
            baseInit(element, valueAccessor, allBindingsAccessor);

            var options = allBindingsAccessor().datepickerOptions || {},
                maxValueObservable = allBindingsAccessor().maxValue,
                minValueObservable = allBindingsAccessor().minValue,
                enable = allBindingsAccessor().enable, //handle ko enable binding applied to the element
                visible = allBindingsAccessor().visible, //handle ko visible binding
                disabled = options.disabled, 
                $element = $(element), 
                observable = valueAccessor(),
                valSubscr, minSubscr, maxSubscr,
                enableSubscr, visibleSubscr, disabledSubscr,
                setToday = false,
                gcn = DW.DateTime.CommonSettings.calendarName,
                //gc = $.calendars.instance(gcn, Globalize.culture().language), //en-GB does not work this way 
                gc = $.calendars.picker._defaults.calendar, // find a better way
                enableDateEntry = (gcn === 'gregorian'),
                setDate = function (date) {
                    observable(date ? formatter.getDateTime(date, isEmpty) : null);
                    isEmpty = !date;
                    $element.focus();
                },
                formatterOptions = self.getFormatterOptions(gc, options.isRangeStartDate, options.isRangeEndDate),
                formatter = self.getFormatter(formatterOptions),
                validateValue = function (value) {
                    return (value instanceof Date) ? value : null;
                },
                value = validateValue(observable()),
                isEmpty = !value;

            if (enableDateEntry)
                self.enableEntry($element);

            $element.val(value ? formatter.getLocalizedString(value) : '');

            var onValueChanged = function (date) {
                $element.off('change.kodatepicker', onElemChanged);

                date = validateValue(date);
                var _date = formatter.getDate(date, true);
                isEmpty = !date;
                $element.val(formatter.getLocalizedString(_date));

                $element.on('change.kodatepicker', onElemChanged);

                //sync DW Request autocomplete menu bug:121050//TODO remove
                if (enableDateEntry) self.setEntryValue($element, date);

                self.updateTriggerLayout($element);
            };
            valSubscr = observable.subscribe(onValueChanged);
           
            $element.calendarsPicker($.extend({
                onShow: function (pickerElement, calendarOptions, pickerInstance) {
                    $(document).data('calendarsPicker.pickerElement', pickerElement);
                    pickerElement.find('a[href^="javascript"]').on('click.calendarsPickerClick', function (event) {
                        event.preventDefault();
                    });
                },
                onClose: function () {
                    $(document)
                        .data('calendarsPicker.pickerElement')
                        .find('a[href^="javascript"]')
                        .off('click.calendarsPickerClick');
                },
                onSelect: function (dates) {
                    setDate(formatter.getJSDateFromCalendar(dates, setToday, observable()));
                    setToday = false;
                },
                onToday: function () {
                    setToday = true;
                }
            }, options));

            self.updateTriggerLayout($element);

            //var calendar = $element.calendarsPicker('option', 'calendar');
            //if (calendar) {
            //    var baseParseDate = calendar.parseDate.bind(calendar);
            //    calendar.parseDate = function (format, dateText, settings) {
            //        var _dateText = dateText ? formatter.getCalendarDateString(dateText) : dateText;
            //        console.log(dateText);
            //        return baseParseDate(format, _dateText, settings);
            //    };
            //}

            //Handle enabling and disabling of datepicker trigger button
            if (typeof (enable) != 'undefined') {
                if (ko.isObservable(enable)) {
                    enableSubscr = enable.subscribe(function (enabled) {
                        self.enableTrigger(enabled, element);
                    });
                    self.enableTrigger(enable(), element);
                } else {
                    self.enableTrigger(enable, element);
                }
            }

            //Handle visibility of datepicker trigger button
            if (typeof (visible) != 'undefined') {
                if (ko.isObservable(visible)) {
                    visibleSubscr = visible.subscribe(function () {
                        self.showTrigger(visible(), element);
                    });
                    self.showTrigger(visible(), element);
                } else {
                    self.showTrigger(visible, element);
                }
            }

           
            //Handle disabled from datepickerOptions
            if (ko.isObservable(disabled)) {
                disabledSubscr = disabled.subscribe(function (value) {
                    self._toggleDisabled($element, value, enableDateEntry);
                });
                self._toggleDisabled($element, disabled(), enableDateEntry);
            } else if ($.isFunction(disabled)) {
                disabledSubscr = ko.computed(function() {
                    self._toggleDisabled($element, disabled(), enableDateEntry);
                });
            } else {
                self._toggleDisabled($element, disabled, enableDateEntry);
            }

            var onElemChanged = function () {
                var subscribe = false;
                if (!isEmpty) {
                    //allow trigger of onValueChanged if the input was empty till now, so range values can be adjusted and applied
                    valSubscr.dispose();
                    subscribe = true;
                }
                setDate(formatter.getJSDate($element.val()));
                if (subscribe) valSubscr = observable.subscribe(onValueChanged);
            };
            $element.on('change.kodatepicker', onElemChanged);

            $element.on('keypress.kodatepicker', function (event) {
                var c = event.keyCode || event.charCode;
                var d = formatter.getJSDate($element.val()),
                    date = null;

                if (c == 120 || c == 88) { // 'x' today
                    var m = moment();
                    date = formatter.getDate(m.getDate());
                }
                else if (c == 45 || c == 109) { // '-' prev day
                    var m = moment(d ? d : void 0).add('days', -1);
                    date = m.getDate();
                }
                else if (c == 43 || c == 107) { // '+' next day
                    var m = moment(d ? d : void 0).add('days', 1);
                    date = m.getDate();
                }

                if (!date) return true;

                setDate(date);

                event.preventDefault();

                //if (minValueObservable && minValueObservable()) {
                //    m = m.min(minValueObservable());
                //}
                //if (maxValueObservable && maxValueObservable()) {
                //    m = m.max(maxValueObservable());
                //}

                $element.calendarsPicker('hide');
                return false;
            });

            var lastValue;
            $element.on('keydown.kodatepicker', function (event) {
                if (event.keyCode === 229) {
                    lastValue = $element.val();
                }
            });

            $element.on('keyup.kodatepicker', function (event) {
                if (!$element.val()) {
                    setDate(null);
                } else if (lastValue !== void 0) {
                    var newChar = $element.val().charAt(event.target.selectionStart - 1);
                    $element.val(lastValue);
                    lastValue = void 0;

                    $element.trigger(
                        self._createKeypressEvent(newChar));

                    return false;
                }
            });
            var setMaxDate = function (date) {                
                date = gcn === "ummalqura" ? ((date || DW.DateTime.ummAlQuraEndDate) >= DW.DateTime.ummAlQuraEndDate ? DW.DateTime.ummAlQuraEndDate : date): null;
                $element.calendarsPicker('option', { maxDate: date ? gc.fromJSDate(date) : null });
            };

            setMaxDate(maxValueObservable ? maxValueObservable()||null:null);
            if (maxValueObservable) {
                maxSubscr = maxValueObservable.subscribe(function (newValue) {
                    setMaxDate(newValue || null);
                });
            }

            var setMinDate = function (date) {
                date = gcn === "ummalqura" ? ((date || DW.DateTime.ummAlQuraStartDate) <= DW.DateTime.ummAlQuraStartDate ? DW.DateTime.ummAlQuraStartDate : date) : null;
                $element.calendarsPicker('option', { minDate: date ? gc.fromJSDate(date) : null });
            };

            setMinDate(minValueObservable ? minValueObservable() || null : null);
            if (minValueObservable) {
                minSubscr = minValueObservable.subscribe(function (newValue) {
                    setMinDate(newValue || null);
                });
            }
           
            //handle disposal (if KO removes by the template binding)
            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                $element.off('.kodatepicker');
                if (enableDateEntry) self.disposeEntry($element);
                $element.calendarsPicker('destroy');

                if (valSubscr) valSubscr.dispose();
                if (minSubscr) minSubscr.dispose();
                if (maxSubscr) maxSubscr.dispose();
                if (enableSubscr) enableSubscr.dispose();
                if (disabledSubscr) disabledSubscr.dispose();
                if (visibleSubscr) visibleSubscr.dispose();
                formatter.dispose();
            });

        };

        self.updateTriggerLayout = function ($element) { };

        self.enableTrigger = function (enable, element) {
            //$(element).calendarsPicker(enable ? 'enable' : 'disable'); //TODO use it instead
            var currentTrigger = $.calendars.picker._getTrigger(element);
            if (currentTrigger) {
                if (enable) {
                    $.calendars.picker._enablePlugin(element);
                    $(currentTrigger).removeClass("ui-state-disabled");
                }
                else {
                    $.calendars.picker._disablePlugin(element);
                    $(currentTrigger).addClass("ui-state-disabled");
                }
            }
        };

        self._createKeypressEvent = function (keyName) {
            var keyCode = keyName.charCodeAt(0);

            return $.Event('keypress', {
                keyCode: keyCode,
                which: keyCode,
                charCode: keyCode
            });
        };

        self._toggleDisabled = function (element, isDisabled, enableDateEntry) {
            if (enableDateEntry) self.toggleEntry(element, isDisabled);
            element.calendarsPicker(isDisabled ? 'disable' : 'enable');
        };

        self.showTrigger = function (show, element) {
            var currentTrigger = $.calendars.picker._getTrigger(element);
            if (currentTrigger) {
                if (show) {
                    currentTrigger.show();
                }
                else {
                    currentTrigger.hide();
                }
            }
        }

        self.enableEntry = function ($element) {
            $element.dateEntry({});
        };

        self.disposeEntry = function ($element) {
            $element.dateEntry('destroy');
        };

        self.toggleEntry = function ($element, optionsDisabled) {
            $element.dateEntry(optionsDisabled ? 'disable' : 'enable');
        };

        self.setEntryValue = function ($element, date) {
            $element.dateEntry('setDate', date);
        };

        return self;
    };
    var __doMouseWheel = $.calendars.picker._doMouseWheel;
    $.calendars.picker._doMouseWheel = function (event, delta) {
        //a workaround for IE where mouse wheel is handled in the picker and changes the months
        //this prevent this strange behaviour
        var select = $(event.target).parent();
        if (select.is(".dw-dropDownList.dw-calendar.year"))
            return;
        __doMouseWheel(event, delta);
    };
    
    $.extend(this.DW.DateTime, {
        DatePickerBindingHandler: DatePickerBindingHandler
    });


    //$.effects.effect.datepickerVisibility = function (options, callback) {
    //    var widget = $(this);

    //    if (options.mode == 'hide') {
    //        // Hide
    //        var scroll = widget.data('scroll');
    //        if (scroll) {
    //            widget.data('scroll', null);
    //            scroll.off('scroll.datepicker');
    //        }
    //        widget.hide('fade', options.complete, options.duration);
    //    } else {
    //        // Show
    //        var input = $($.datepicker._lastInput);
    //        var scroll = input.closest('.scroll-wrapper');
    //        if (scroll) {
    //            scroll.on('scroll.datepicker', function () {
    //                this.datepicker("hide").blur();
    //            }.bind(input));
    //            widget.data('scroll', scroll);
    //        }
    //        widget.show('fade', options.duration);
    //    }
    //    callback.call();
    //};
}));