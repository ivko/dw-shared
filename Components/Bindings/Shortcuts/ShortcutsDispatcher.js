(function ($) {

    var ShortcutsDispatcher = new Class({
        Extends: DW.Disposable,
        options: {
            limit: 3,
            debug: false,
            enabled: true
        },
        container: [],
        elements: [],
        log: function (message, event) {
            if (!this.options.debug) return;
            console.log(message, event.type, event.target);
        },
        initialize: function (options) {
            $.extend(true, this.options, options);

            if (!this.options.enabled) return;

            // Make sure that there will always be an element on focus
            $(document.body).on({
                'focusin.shortcutsdispatcher': this._handleFocus.bind(this),
                'focusout.shortcutsdispatcher': this._handleBlur.bind(this)
            });
        },
        dispose: function () {
            $(document.body).off('.shortcutsdispatcher');
            //this.elements = null;
            //this.container = null;
        },
        /* Private methods */
        _handleFocus: function (event) {
            this.log('Geting focus', event);
            var target = this._getFocusableTarget(event);
            if (!target) {
                this.log('No suitable target found', event);
                return;
            };
            // clear timeoutId
            clearTimeout(this.timeoutId);

            this.elements.unshift(target);
            this.elements = this.elements.unique();
            var limit = this.options.limit;
            if (this.elements.length > limit) {
                this.elements.splice(limit - 1, this.elements.length - limit);
            }
        },
        _getFocusableTarget: function (event) {
            var target = event.target;
            if (!target.tagName || !target.blur) return false;
            var $target = $(target);
            if ($target.is(':focusable') || ($target.is('[hidefocus]') && $target.parent().is(':visible'))) {
                // current element is OK, do nothing..
            } else {
                // find first nice focusable element
                var focusable = $target.closest(':focusable');
                if (focusable.length > 0) {
                    target = focusable.get(0);
                    target.focus();
                    return false;
                } else {
                    if (target.blur && !$(target).is('body')) { // DW-IV: task #122069 - Browser with Web Client is moved to the background when calling a linked result list
                        target.blur();
                    }
                    return false;
                }
            }
            return target.tagName ? target : false;
        },
        _isHandlerEnabled: function () {
            if ($(document.activeElement).is('iframe')) {
                // when clicking on iframe we want leave it. See Bug 262364: Text cannot be entered into Surveymonkey survey
                return false;
            }
            if (DW.Utils.isIE) {
                try {
                    return window.self === window.top && document.hasFocus();
                } catch (e) {
                    return false;
                }
            }
            return document.hasFocus();
        },
        _handleBlur: function (event) {
            this.log('Atempt to blur', event);
            // create tumeoutId and delay amount of seconds
            this.timeoutId = this.__handleBlur.delay(0, this, [event]);
        },
        __handleBlur: function (event) {
            if (!this._isHandlerEnabled()) return;
            this.log('Loosing focus', event);
            // put back the focus to the first visible element
            var visibles = this.elements.filter(function (element) {
                var $el = $(element);
                return $el.is(':visible') || ($el.is('[hidefocus]') && $el.parent().is(':visible'));
            });

            if (visibles[0] && visibles[0].focus) {
                this.log('Put focus back', event);
                visibles[0].focus();
            }
        },

        ///* Public methods */
        register: function (bundle) {
            this.unregister(bundle);
            this.container.unshift(bundle);
        },
        unregister: function (bundle) {
            var i = this.container.indexOf(bundle);
            if (i < 0) return;
            this.container.splice(i, 1);
        },
        dispatch: function (key, bindingContext, handled) {
            var shortcutsData = null;
            this.container.some(function (bundle) {
                if (bundle.shortcuts[key]) {
                    shortcutsData = bundle;
                    return true;
                }
            });
            if (!shortcutsData) return;

            this.process(shortcutsData.shortcuts[key], shortcutsData.bindingContext, handled);

        },
        process: function (command, bindingContext, handled) {

            if (!command) return;

            handled();

            if (command.id) {
                var adapter = new DW.CommandBindingAdapter(command, bindingContext);
                adapter.execute().always(function () { adapter.dispose(); });
            }
            else { // ko.Command
                if (!command.hasOwnProperty("canExecute") && !command.canExecute) {
                    command();
                }
                else if (command.canExecute() && (command.visible && command.visible(bindingContext) || !command.visible)) {
                    command.execute(bindingContext);
                }
            }
        }
    }).extend({
        instance: false,
        getInstance: function () {
            if (!ShortcutsDispatcher.instance) {
                ShortcutsDispatcher.instance = new ShortcutsDispatcher();
            }
            return ShortcutsDispatcher.instance;
        }
    });

    extend(ns('DW'), {
        ShortcutsDispatcher: ShortcutsDispatcher
    });
})(jQuery);