(function (factory) {
    if (typeof define === "function" && define.amd) { // AMD.
        define(["jquery", "knockout", "jquery-ui", "../koJquiBindingFactory", "../../Widgets/numeric/js/ko.numericBinding"], factory);
    } else { // Global
        factory(jQuery, ko);
    }
}(function ($, ko) {
    ko.jqui.bindingFactory.create({
        name: 'spinner',
        options: [
            'culture',
            'disabled',
            'icons',
            'incremental',
            'max',
            'min',
            'numberFormat',
            'page',
            'step'
        ],
        events: [
            'create',
            'start',
            'spin',
            'stop',
            'change'
        ],
        postInit: function (element, valueAccessor, allBindingsAccessor) {
            var options = valueAccessor(), $element = $(element);

            $element.autoNumeric('init', {
                aSep: options.thousandSep !== undefined ? options.thousandSep : Globalize.culture().numberFormat[","],
                aDec: Globalize.culture().numberFormat["."],
                lZero: 'deny',
                aForm: false,
                vMax: ko.utils.unwrapObservable(options.max),
                //vMin: options.min, skip min validation - it might be not possible to type multi digit number - http://www.decorplanit.com/plugin/ -> Notes on the minimum (vMin) / maximum (vMax) values:
                //then use manual validation
                mDec: ko.utils.unwrapObservable(options.precision) || 0,
                isDecimal: false
            });
           
            if (ko.isWriteableObservable(options.value)) {

                $element.on('spin.kospinner', function (ev, ui) {
                    options.value(ui.value);
                });

                $element.on('spinchange.kospinner', function () {
                    var value = $element.spinner('value');

                    if (options.value() === value) return;

                    if (options.min !== undefined && value < options.min) value = options.min;
                    //else if (options.max !== undefined && value > options.max) value = options.max; implemented by the numeric widget

                    if (options.value() === value) options.value.valueHasMutated();//this will force updateBindingHandler
                    else options.value(value);//this will call updateBindingHandler

                    //$element.spinner('value', value)
                });
            }

            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                $element.autoNumeric('destroy');
                $element.off('.kospinner');
            });
        },
        updateBindingHandler: function (element, valueAccessor, allBindingsAccessor) {
            var options = valueAccessor(), $element = $(element);
            if (typeof options.value !== 'undefined') {
                //MN is just the poor guy who makes it less bugy
                //1. get value only once - get method always parse the input
                //2. remove dummy number convertion ("1 234,08" * 1) - get the value from the spiner widget
                //  2.1 Ask AK to make different fix for Schedule component

                var vmValue = ko.utils.unwrapObservable(options.value),
                    widgetValue = $element.spinner('value');

                if (widgetValue !== vmValue) {
                    $element.spinner('value', vmValue);
                    var widgetValue2 = $element.spinner('value');
                    if (widgetValue2 !== vmValue) {
                        //console.log("widgetValue", widgetValue2);
                        //console.log("vmValue", vmValue);
                        options.value(widgetValue2);
                    }
                }

                //TP: fix for bug 203075
                var newMax = ko.utils.unwrapObservable(options.max);
                if (newMax) {
                    var oldMax = $element.spinner('option', 'max');
                    if (oldMax !== newMax) {
                        $element.spinner('option', 'max', newMax);
                    }
                }
            }
            if (!ko.isObservable(options.disabled) && $element.spinner("option", "disabled") !== options.disabled) {
                $element.spinner("option", "disabled", options.disabled);
            }
        }
    });

    $.widget("ui.spinner", $.ui.spinner, {
        options: {
            numberFormat: 'n0'
        },
        // we need this extension only to use 'spinner component' in Patern Library because of <a>
        _buttonHtml: function () {
            return "" +
              "<button class='ui-spinner-button ui-spinner-up'>" +
                "<span class='ui-icon " + this.options.icons.up + "'></span>" +
              "</button>" +
              "<button class='ui-spinner-button ui-spinner-down'>" +
                "<span class='ui-icon " + this.options.icons.down + "'></span>" +
              "</button>";
        }
    });

    ko.components.register('spinner', {
        viewModel: function (params) {
            this.params = params || {};
            this.classes = params.classes || "";
            this.width = params.width;
        },
        template: "<input type='text' data-bind='css: classes, style: { width: width }, spinner: params' />"
    });

}));
