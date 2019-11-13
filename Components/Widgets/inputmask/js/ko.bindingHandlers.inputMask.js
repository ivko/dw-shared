(function ($, ko) {  

    var InputMaskBindingHandler = new Class({
        Extends: BindingHandler,       
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var mask = valueAccessor(),
                subscription = null;

            var observable = mask.value,
                updater = function () {
                    //if ($(element).inputmask('isComplete')) {
                    //    observable($(element).val());
                    //} else {
                    //    observable(null);
                    //}
                };

            if (ko.isObservable(observable)) {
                $(element).on('focusout change', updater);
            }

            $(element).inputmask(mask);
            //$(element).inputmask(mask);

            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                $(element).off('focusout change', updater);
            });
        },
        update: function (element, valueAccessor) {
            var mask = valueAccessor();

            var observable = mask.value;

            if (ko.isObservable(observable)) {

                //var valuetoWrite = observable();

                //$(element).val(valuetoWrite);
            }
        }
    });
    ko.bindingHandlers.inputMask = new InputMaskBindingHandler();

}).call(this, jQuery, ko);