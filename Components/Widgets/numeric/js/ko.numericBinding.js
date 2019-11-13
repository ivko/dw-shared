(function (factory) {
    if (typeof define === "function" && define.amd) {
        define(["jquery", "knockout", "./utils.numeric", "./jquery.numeric"], factory);
    } else {
        factory(jQuery, ko);
    }
}(function ($, ko) {
    var numberToString = function (value, precision) {
        return Globalize.format(value, "n" + (typeof precision == 'undefined' ? '0' : precision));
    };

    var NumericValueBehavior = function (element, valueObservable, numericValueOptions, viewModel) {
        var self = {},
            $element = $(element),
            optionsObservable = ko.isObservable(numericValueOptions) ? numericValueOptions : ko.observable(numericValueOptions);
        //isRangeValue = (viewModel.minimum && viewModel.maximum) ? true : false;

        self.optionsSubscription = optionsObservable.subscribe(function (newOptions) {
            $element.autoNumeric('destroy');
            self.initAutoNumeric(newOptions);
        });

        // change transfer data from VM for the view (input text element)
        var onObservableChange = function (newValue) {
            $element.val(numberToString(newValue, optionsObservable().precision));
        };

        // change transfer data from View to the VM
        var textBoxChange = function (event) {
            //detach
            self.observableSubscription.dispose();

            //change (for the VM)
            if (!optionsObservable().isDecimal) {
                var val = $element.val();
                if (val != '-') {
                    var val = Globalize.parseFloat(val);
                    val = isNaN(val) ? null : val;
                }
                valueObservable(val);
            }
            else {
                // if decimal - pass a string to the VM
                // convert to invariant - e.g remove thousand separatotor and replace decimal separator with '.'
                // 1. replace all the thousand separators with "" 2. Replace the decimal separator with .
                valueObservable(DW.Utils.stringDecimalNumberUnify($element.val()));
            }

            //attach
            self.observableSubscription = valueObservable.subscribe(onObservableChange);//subscribe for change of the observable
        };

        self.init = function () {
            self.observableSubscription = valueObservable.subscribe(onObservableChange);

            self.initAutoNumeric(optionsObservable());

            $element.on('keyup', textBoxChange);
            $element.on('change', textBoxChange);
        };

        self.initAutoNumeric = function (_options) {
            var val = valueObservable();
            // if the current bind value is not RangeValue - the string is culture invariant
            // if ((typeof val === 'string') && isRangeValue) { val = DW.FileCabinet.Utils.stringDecimalNumberUnify(val); }

            if (val !== '' && !isNaN(val))
                $element.val(numberToString(val, _options.precision));

            $element.autoNumeric('init', {
                aSep: _options.thousandSep !== undefined ? _options.thousandSep : Globalize.culture().numberFormat[","],
                aDec: Globalize.culture().numberFormat["."],
                mDec: _options.precision,
                lZero: 'deny',
                aForm: false,
                vMax: _options.max,
                vMin: _options.min,
                isDecimal: optionsObservable().isDecimal
            });
            $element.trigger('change');
        };

        self.dispose = function () {
            self.optionsSubscription.dispose();
            self.observableSubscription.dispose();
            $element.autoNumeric('destroy');
            $element.off('keyup', textBoxChange);
            $element.off('change', textBoxChange);
        };

        return self;
    };

    ko.bindingHandlers.numericValue = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var $element = $(element),
                allBindings = allBindingsAccessor();

            var behaviour = new NumericValueBehavior(element, valueAccessor(), allBindings.numericValueOptions, viewModel);
            behaviour.init();

            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                behaviour.dispose();
            });
        }
    };

}));