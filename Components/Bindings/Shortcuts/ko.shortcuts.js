(function ($, ko) {

    var ShortcutsBindingHandler = new Class({
        Extends: BindingHandler,
        //TODO: some keys fire up twice - further investigation needed
        dataKey: "koShortcutsActivateddatakey",
        exceptions: {
            textInput : {
                allow: ['Ctrl+Alt+j', 'Ctrl+Alt+k', 'Ctrl+Alt+x', 'Escape', 'Ctrl+Alt+r'],
            },
        },
        active: function (element) {
            return $(element).data(this.dataKey);
        },

        _addShortcuts: function (element, shortcutsBundle, registerShortcuts) {
            DW.ShortcutsDispatcher.getInstance().register(shortcutsBundle);
            element.addEventListener("focus", registerShortcuts, true);
        },
        _removeShortcuts: function (element, shortcutsBundle, registerShortcuts) {
            element.removeEventListener("focus", registerShortcuts, true);
            DW.ShortcutsDispatcher.getInstance().unregister(shortcutsBundle);
        },

        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var $element = $(element),
                self = this,
                shortcutOptions = ko.utils.unwrapObservable(allBindingsAccessor()).shortcutOptions || { shortcutOptions: { global: {} } },
                enable = ko.isObservable(valueAccessor()) ? valueAccessor() : function () { return valueAccessor(); },
                shortcutsBundle = shortcutOptions.shortcutsBundle || {
                    shortcuts: shortcutOptions.global || {},
                    bindingContext: bindingContext
                },
                registerShortcuts = function () {
                    DW.ShortcutsDispatcher.getInstance().register(shortcutsBundle);
                },
                onkeydown = function (evt) {
                    var $target = $(evt.target),
                        commandData = ko.utils.domData.get(evt.target, 'command_data'),
                        isHandledByCommand = commandData && commandData.handledKeyboardKeys && Object.keys(commandData.handledKeyboardKeys).reduce(function(arr, k) {
                            return arr.concat(commandData.handledKeyboardKeys[k]);
                        }, []).indexOf(evt.keyCode) >= 0,
                        isDialog = $target.closest('.dw-dialog.ui-widget-content').length > 0,
                        isTextInput = $target.is('input') || $target.is("textarea"),
                        isStamp = $("#stampPositioner").length > 0,
                        isTextAnnotation = $target.hasClass("textAnnotationEdit");
                    //shortcutExceptions = $target.data('koShortcutsExceptionsdatakey');

                    var key = DW.Utils.jsKeyCodes[evt.keyCode];
                    if (evt.shiftKey) key = "Shift+" + key;
                    if (evt.altKey) key = "Alt+" + key;
                    if (evt.ctrlKey) key = "Ctrl+" + key;

                    //check if we are in modal dialog or the target is bound with command and ignore shortcuts
                    //if (shortcutExceptions && shortcutExceptions.exclusive
                    //       && !shortcutExceptions.exclusive.some(function (keyCode) {
                    //           return keyCode == evt.keyCode;
                    //       })) return; //in case we want to execute only some specific shortcuts 

                    //should not stop propagation here: example is arrowdown for select lists in inputs
                    if (isHandledByCommand ||
                        (isDialog && evt.keyCode != $.ui.keyCode.ENTER) ||
                        (isTextInput && evt.keyCode != $.ui.keyCode.ENTER && !(self.exceptions.textInput.allow || []).some(function (shortcutKey) {
                            return key == shortcutKey;
                        })) ||
                        (isStamp && evt.keyCode == $.ui.keyCode.ESCAPE) ||
                        (isTextAnnotation && evt.keyCode == $.ui.keyCode.ENTER)) {
                        return;
                    }
                    
                    var processShortcut = function () {            

                        var handled = function () {
                            evt.keyCode = 0;
                            evt.which = 0;
                            evt.stopPropagation();
                            evt.preventDefault();
                        };

                        if (shortcutOptions.local && shortcutOptions.local[key]) {
                            DW.ShortcutsDispatcher.getInstance().process(shortcutOptions.local[key], bindingContext, handled);
                            return;
                        }

                        DW.ShortcutsDispatcher.getInstance().dispatch(key, bindingContext, handled);
                    };

                    if ((isDialog || isTextInput) && evt.keyCode == $.ui.keyCode.ENTER) {
                        //inputs update on 'afterkeyup', so make sure value is updated before submitting the value
                        //TODO: process shortcuts on 'keyup'

                        setTimeout(function () {
                            processShortcut();
                        }, 100);

                        evt.stopPropagation();
                        return;
                    }

                    processShortcut();

                },
                dispose = function () {
                    $element.off("keydown", onkeydown);
                    if (shortcutOptions.global) self._removeShortcuts(element, shortcutsBundle, registerShortcuts);
                };

            $element.addClass("shortcuts");
            $element.data(self.dataKey, enable);
            var enabled = ko.computed(function () {
                dispose();
                if (enable()) {
                    if (shortcutOptions.setFocus) setTimeout(function () { $element.focus(); }, 0);
                    $element.on("keydown", onkeydown);
                    if (shortcutOptions.global) self._addShortcuts(element, shortcutsBundle, registerShortcuts);
                }
            });

            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                dispose();
                $element.removeClass("shortcuts");
                if (enabled) enabled.dispose();
                $(element).data(self.dataKey, null);
            });
        }
    });

    $.extend(ns('DW.BindingHandler'), {
        ShortcutsBindingHandler: ShortcutsBindingHandler
    });

    ko.bindingHandlers.shortcuts = new ShortcutsBindingHandler();

}).call(this, jQuery, ko);