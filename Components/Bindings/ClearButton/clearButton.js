(function () {
    var isIE = !!(/trident\/(\d+\.\d+)/i.exec(navigator.userAgent) || [])[1];

    var ClearButtonBindingHandler = new Class({
        Extends: BindingHandler,

        options: {
            buttonTemplateName: 'text-field-clear-button'
        },

        init: function (element, valueAccessor) {
            var self = this,
                $element = $(element),
                $button,
                options = $.extend({
                    clearValue: '',
                    enable: function () { return true; }
                }, valueAccessor() || {}),
                onElementEntered = function () {
                    $button.toggle(!!$element.val());
                },
                onElementBlur = function () {
                    $button.hide();
                },
                create = function () {
                    $button = $(DW.Utils.renderTemplate(self.options.buttonTemplateName, null).insertAfter(element)).hide(),
                    $element
                        .on('keyup focus cut paste', onElementEntered)
                        .on('blur', onElementBlur);

                    $button.on('mousedown', function () {
                        $element.val(options.clearValue).trigger('change');

                        setTimeout(function () {
                            $element.focus();
                        }, 0);
                    });
                },
                destroy = function () {
                    $element.off('keyup focus cut paste', onElementEntered);
                    $element.off('blur', onElementBlur);
                    $element.empty(); //this will clean the child elements. just in any case ...

                    $button.off('mousedown');
                    ko.removeNode($button[0]);
                    //ko.removeNode($button[0]);
                    //ko.cleanNode($button);
                    //$button.remove();
                },
                onEnabled = function (value) {
                    value ? create() : destroy();
                },
                isEnabled = ko.computed(function () {
                    return options.enable();
                }),
                enableSubscription = isEnabled.subscribe(onEnabled);

            if (isEnabled()) onEnabled(true);

            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                if (isEnabled()) onEnabled(false);
                enableSubscription.dispose();
            });
        }
    });

    ko.bindingHandlers.clearButton = new ClearButtonBindingHandler();
})();