(function (factory) {
    if (typeof define === "function" && define.amd) { // AMD.
        define(["jquery", "knockout", "./select2", "../../../Bindings/koJquiBindingFactory", "../../dwScrollbar/js/jquery.ui.dwScrollbar"], factory);
    } else { // Global
        factory(jQuery, ko);
    }
}(function ($, ko) {

    ko.jqui.bindingFactory.create({
        name: 'select2',
        controlsDescendantBindings: false,
        optionMethodName: false,
        options: [
            /* */
            "width", "placeholder", "allowClear", "loadMorePadding", "closeOnSelect", "openOnEnter", "selectOnBlur", "blurOnChange",

            /* CSS */
            "containerCss", "dropdownCss", "containerCssClass", "dropdownCssClass", "adaptContainerCssClass", "adaptDropdownCssClass",

            /* Min / Max values */
            "minimumResultsForSearch", "minimumInputLength", "maximumInputLength", "maximumSelectionSize",

            /* Search helpers */
            "matcher", "separator", "tokenSeparators", "tokenizer", "escapeMarkup", "nextSearchTerm", "noFocus", "autofocusInputOnOpen",

            /* Format */
            "formatResult", "formatSelection", "sortResults", "formatResultCssClass",
            "formatSelectionCssClass", "formatNoMatches", "formatInputTooShort",
            "formatInputTooLong", "formatSelectionTooBig", "formatLoadMore", "formatSearching",

            /* These options are not allowed when attached to a select because they are picked up off the element itself */
            "id", "multiple", "ajax", "query", "createSearchChoice", "initSelection", "data", "tags"
        ],
        callableOptions: [
            "id", "data", "matcher", "initSelection", "query", "formatResult", "formatSelection", "sortResults", "formatResultCssClass",
            "formatSelectionCssClass", "formatNoMatches", "formatInputTooShort",
            "formatInputTooLong", "formatSelectionTooBig", "formatLoadMore", "formatSearching"
        ],
        events: [
            'change', 'select2-opening', 'select2-open', 'select2-highlight', 'select2-selecting',
            'select2-clearing', 'select2-removing', 'select2-removed', 'select2-loaded', 'select2-focus', 'select2-blur'
        ],
        prepareOptions: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var options = valueAccessor();
            if ($(element).is(':not(select)')) {
                var newOptions = {};
                var formatter = function (current) {
                    var str = '',
                        keys = Array.from(this.keys);
                    
                    for (var i = 0; i < keys.length; i++) {
                        var val = current[keys[i]];
                        str += ko.isWriteableObservable(val) ? ko.utils.unwrapObservable(val) : (val || '').toString();
                    }
                    return str;
                };

                if (typeof options.optionsText !== 'undefined') {
                    newOptions.formatResult = options.formatResult || formatter.bind({ keys: options.optionsText});
                    newOptions.formatSelection = options.formatSelection || formatter.bind({ keys: options.optionsText });
                    delete options['optionsText'];
                };

                if (typeof options.optionsValue !== 'undefined') {
                    newOptions.id = options.id || formatter.bind({ keys: options.optionsValue });
                    delete options['optionsValue'];
                }

                if (ko.isObservable(options.data)) {
                    var data = options.data;
                    newOptions.data = function () {
                        return {
                            results: data()
                        };
                    };
                    delete options['data'];
                }

                Object.append(options, newOptions);
            }
            return options;
        },
        postInit: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var options = valueAccessor(),
                $element = $(element),
                dialogDisposeCallback = null;

            $element.on('select2-open', function (event) {
                var widget = $(this).data('select2');
                // Create scrollbar
                if (!widget.scrollbar) {
                    widget.scrollbar = true;
                    widget.results.dwScrollbar({
                        trackDragEventListener: '#select2-drop-mask',
                        autoAdjustContentPadding: true,
                        horizontalScrolling: false,
                        theme: 'scroll-theme-light'
                    });
                };

                // Mark selected item
                widget.results
                    .dwScrollbar('update')
                    .find('.select2-highlighted')
                    .addClass('select2-current');

                // We are selecting the current dialog where current element is
                var $dialog = $($(this).closest('.ui-dialog'));

                if ($dialog.length && !dialogDisposeCallback) {
                    var onDialogUpdatePosition = function () {
                        widget.positionDropdown();
                    },
                    onDialogClose = function () {
                        widget.close();
                    };

                    $dialog.on('dialogupdateposition', onDialogUpdatePosition);
                    $dialog.on('dialogclose', onDialogClose);

                    dialogDisposeCallback = function () {
                        $dialog.off('dialogupdateposition', onDialogUpdatePosition);
                        $dialog.off('dialogclose', onDialogClose);
                    };
                }

                // when we use "focusOnOpen" property we should be shure is element which we want to focus have "tabindex" property
                // ot it is an input or something that can be focused by default
                // in current case we are using it to hide focus from inputs when open select2 combobox
                // because if in IE input is focused and select2 expands itself over it inputs cursor is seen through select2 combobox
                if (options.focusOnOpen) {
                    $element.focus();
                }

            });
            // Keeps the value binding property in sync with the select value.
            if (ko.isWriteableObservable(options.selectedValue)) {
                $element.on("select2-selected", function (data) {
                    options.selectedValue(data.choice);
                });
            };

            if ($element.is('select') && ko.isWriteableObservable(allBindingsAccessor().value)) {
                $element.on('change', function () {
                    allBindingsAccessor().value(ko.selectExtensions.readValue(this));
                });
            }

            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                $element.off('change');
                $element.off('select2-selected');
                $element.off('select2-open');
                if (dialogDisposeCallback) dialogDisposeCallback();
            });
        },
        updateBindingHandler: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var options = valueAccessor(),
                $element = $(element);
            if ($element.is(':not(select)') && ko.isWriteableObservable(options.selectedValue)) {
                $element.select2('data', ko.utils.unwrapObservable(options.selectedValue));
            };
            $element.data('select2').initSelection();
        },
        hasRefresh: false
    });

    // Patch for select2 on UI Dialog wich need to allow interaction
    $.widget("ui.dialog", $.ui.dialog, {
        _allowInteraction: function (event) {
            return !!$(event.target).is(".select2-input, .select2-drop") || this._super(event);
        }
    });

    // Modify default options
    $.extend(true, $.fn.select2.defaults, {
        minimumResultsForSearch: -1,
        width: 200
    });

    ko.bindingHandlers.fireChange = {
        update: function (element, valueAccessor, allBindingsAccessor) {
            var value = valueAccessor();
            if (value != null) {
                $(element).change();
            }
        }
    };
}));