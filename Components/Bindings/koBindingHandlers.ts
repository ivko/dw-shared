/// <reference path="TS/bindingHandlers.d.ts" />
/// <reference path="../ResizeObserver.d.ts" />

(function (factory) {
    if (typeof define === "function" && define.amd) { // AMD.
        define(["jquery", "knockout", "../utils"], factory);
    } else { // Global
        factory(jQuery, ko);
    }
}(function ($: JQueryStatic, ko: KnockoutStatic) {

    class JqDataBindingHandler implements KnockoutBindingHandler {
        public init: KnockoutBindingHandlerInitMethod = (element: any, valueAccessor: () => any) => {
            let $el = $(element),
                options = ko.utils.unwrapObservable(valueAccessor());

            if (options) {
                Object.keys(options).forEach((key) => $el.data(key, options[key]));

                ko.utils.domNodeDisposal.addDisposeCallback(element, () => Object.keys(options).forEach((key) => $el.removeData(key)));
            }
        }
    }

    ko.bindingHandlers.jqData = new JqDataBindingHandler();

    class BindIf implements KnockoutBindingHandler {
        private HIDE_CLASS_NAME = 'ui-hidden';
        private IS_BOUND_KEY = 'is-bound';

        private isBound = (element) => $(element).data(this.IS_BOUND_KEY);
        private isHidden = (element) => $(element).hasClass(this.HIDE_CLASS_NAME);

        public init: KnockoutBindingHandlerInitMethod = () => {
            return { controlsDescendantBindings: true };
        }

        public update: KnockoutBindingHandlerUpdateMethod = (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) => {
            let condition = ko.utils.unwrapObservable(valueAccessor());

            if (condition) {
                this.show(element, bindingContext);
            } else {
                this.hide(element);
            }
        }

        private show(element, bindingContext) {
            if (this.isHidden(element)) {
                $(element).removeClass(this.HIDE_CLASS_NAME);
            }
            if (!this.isBound(element)) {
                this.bind(element, bindingContext);
            }
        }

        private hide(element) {
            $(element).addClass(this.HIDE_CLASS_NAME);
        }

        private bind(element, bindingContext) {
            $(element).data(this.IS_BOUND_KEY, true);
            ko.applyBindingsToDescendants(bindingContext, element);
        }
    }

    ko.bindingHandlers.bindIf = new BindIf();

    /*class OnceRenderedIf implements KnockoutBindingHandler {
        private HIDE_CLASS_NAME = 'ui-hidden';
        private IS_RENDERED_KEY = 'is-rendered';
        private CHILD_NODES_KEY = 'child-nodes';

        private isRendered = (element) => $(element).data(this.IS_RENDERED_KEY);
        private isHidden = (element) => $(element).hasClass(this.HIDE_CLASS_NAME);
        private getChildNodes = (element) => $(element).data(this.CHILD_NODES_KEY);
        private copyChildNodes = (element) => $(element).data(this.CHILD_NODES_KEY, ko.utils.cloneNodes(ko.virtualElements.childNodes(element), true));
        private removeChildNodesFromData = (element) => $(element).removeData(this.CHILD_NODES_KEY);
        private setAsRendered = (element) => $(element).data(this.IS_RENDERED_KEY, true);

        public init: KnockoutBindingHandlerInitMethod = (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) => {
            let condition = ko.utils.unwrapObservable(valueAccessor());

            if (condition) {
                this.setAsRendered(element);
                ko.applyBindingsToDescendants(bindingContext, element);
            } else {
                this.copyChildNodes(element);
                ko.virtualElements.emptyNode(element);
            }

            return { controlsDescendantBindings: true };
        }

        public update: KnockoutBindingHandlerUpdateMethod = (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) => {
            let condition = ko.utils.unwrapObservable(valueAccessor());

            if (condition) {
                this.show(element, bindingContext);
            } else {
                this.hide(element);
            }
        }

        private show(element, bindingContext) {
            if (!this.isRendered(element)) {
                this.render(element, bindingContext);
            } else if (this.isHidden(element)) {
                $(element).removeClass(this.HIDE_CLASS_NAME);
            }
        }

        private hide(element) {
            if (!this.isHidden(element) && this.isRendered(element)) {
                $(element).addClass(this.HIDE_CLASS_NAME);
            }
        }

        private render(element, bindingContext) {
            this.setAsRendered(element);
            ko.virtualElements.setDomNodeChildren(element, this.getChildNodes(element));
            this.removeChildNodesFromData(element);
            ko.applyBindingsToDescendants(bindingContext, element);
        }
    }

    ko.bindingHandlers.onceRenderedIf = new OnceRenderedIf();*/

    //----------------------------------------------------------------------------
    class NumericBindingHandler implements KnockoutBindingHandler {
        public init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext): void {
            let options = allBindingsAccessor().numericOptions || {},
                value = allBindingsAccessor().value,
                isNegative = false,
                minus = "-";

            if (options.rational && ko.isObservable(value)) {
                isNegative = (value().indexOf(minus) >= 0);
                var valueSubscription = value.subscribe((val) => {

                    let index = val.indexOf(minus);
                    isNegative = (index >= 0);
                    if (isNegative && index != 0) {
                        //- is not on first place
                        let values = val.split(minus),
                            newValue = minus.concat(values[0], values[1]);

                        value(newValue);
                    }
                });
            }

            $(element).keydown((event: JQueryKeyEventObject) => {
                // Allow: backspace, delete, tab, escape, and enter
                if (event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 27 || event.keyCode == 13 ||
                    // Allow: Ctrl+A
                    (event.keyCode == 65 && event.ctrlKey === true) ||
                    // Allow: . ,
                    (!options.wholeNumbers && (event.keyCode == 188 || event.keyCode == 190 || event.keyCode == 110)) ||
                    // Allow: home, end, left, right
                    (event.keyCode >= 35 && event.keyCode <= 39) ||
                    // let it happen, don't do anything
                    (options.rational && !isNegative && ((DW.Utils.isFF && event.keyCode == 173) || event.keyCode == 189 || event.keyCode == 109))) {
                    //minus (-) in mozilla keyCode is 107; in others is 189; numpad (-) is 109
                    return;
                }
                else {
                    // Ensure that it is a number and stop the keypress
                    if (event.shiftKey || (event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105)) {
                        event.preventDefault();
                    }
                }
            });

            ko.utils.domNodeDisposal.addDisposeCallback(element,
                () => {
                    $(element).off('keydown');
                    if (valueSubscription) valueSubscription.dispose();
                });
        }
    }

    ko.bindingHandlers.numeric = new NumericBindingHandler();

    //---------------------------------------------------------------------------------------

    class DebugBindingHandler implements KnockoutBindingHandler {
        init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext): void {
            console.log(ko.utils.unwrapObservable(valueAccessor()));
        }

        update(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext): void {
            console.log(ko.utils.unwrapObservable(valueAccessor()));
        }
    }

    ko.bindingHandlers.debugBinding = new DebugBindingHandler();

    //-------------------------------------------------------------------------------------

    //// There are some issues with the standard hasFocus binding in knockout, described in the following links
    //// https://github.com/SteveSanderson/knockout/issues/554
    //// https://github.com/SteveSanderson/knockout/pull/698#issuecomment-10098934
    //// That's why we use this binding instead of the standard.
    //// Solution is found here: 
    //// https://github.com/SteveSanderson/knockout/issues/554#issuecomment-6714550
    //// NOTE: Check if fixed in next version of knockout (2.3). It should be there. Current is 2.2.1.
    //ko.bindingHandlers.setFocus = {
    //    init: function (element, valueAccessor) {
    //        var value = ko.utils.unwrapObservable(valueAccessor());
    //        value ? element.focus() : element.blur();
    //        ko.utils.triggerEvent(element, value ? "focusin" : "focusout");  //IE
    //    }
    //};

    //[{observable:ko,tag: string},{observable:ko,tag: string}...]

    class InsertToCaretBindingHandler implements KnockoutBindingHandler {
        public init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext): void {
            let options = ko.utils.unwrapObservable(valueAccessor()),
                subscriptions = new Array<any>();

            function removeTag(tag) {
                let text = element.value,
                    position = text.indexOf(tag);
                if (position === -1) return 0;
                else
                    options.value([text.slice(0, position), text.slice(position + tag.length)].join(''));
                return position;
            }

            function insertTag(tag, position) {
                let text = element.value;
                options.value([text.slice(0, position), tag, text.slice(position)].join(''));
            }

            options.tagBindings.forEach((binding) =>
                subscriptions.push(binding.observable.subscribe((val) => {
                    if (val == null) return;

                    let newPosition = InsertToCaretBindingHandler.getCaretCoordinatesInText(element),
                        oldPosition = removeTag(binding.tag);
                    if (oldPosition && (newPosition > oldPosition))
                        newPosition -= binding.tag.length;
                    insertTag(binding.tag, newPosition);
                }))
            );

            ko.utils.domNodeDisposal.addDisposeCallback(element,
                () => subscriptions.forEach((s) => s.dispose()));
        }

        private static getCaretCoordinatesInText(oField): number {
            // Initialize
            let iCaretPos = 0;

            // IE Support
            if (document.selection) {

                // Set focus on the element
                oField.focus();

                // To get cursor position, get empty selection range
                let oSel = document.selection.createRange();

                // Move selection start to 0 position
                oSel.moveStart('character', -oField.value.length);

                // The caret position is selection length
                iCaretPos = oSel.text.length;
            }

            // Firefox support
            else if (oField.selectionStart || oField.selectionStart === '0')
                iCaretPos = oField.selectionStart;

            // Return results
            return iCaretPos;
        }
    }

    ko.bindingHandlers.insertToCaret = new InsertToCaretBindingHandler();

    //-----------------------------------------------------------------------------------

    class SetFocusBindingHandler implements KnockoutBindingHandler {
        public init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext): void {
            let triggers = ko.utils.unwrapObservable(valueAccessor());

            let computed = ko.computed(function () {
                let focus = triggers.every(function (t) {
                    return t();
                });
                if (focus) {
                    element.focus();
                    ko.utils.triggerEvent(element, "focusin");  //IE
                }
                return focus;
            });

            ko.utils.domNodeDisposal.addDisposeCallback(element, () => computed.dispose());
        }
    }

    ko.bindingHandlers.setFocus = new SetFocusBindingHandler();

    //---------------------------------------------------------------------------

    class EnableExBindingHandler implements KnockoutBindingHandler {

        public update(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext): void {

            let value = ko.utils.unwrapObservable(valueAccessor()),
                options = (allBindingsAccessor && allBindingsAccessor.has('enableExOptions') ? allBindingsAccessor.get('enableExOptions') : null) || { mode: 'disabled' },
                $element = $(element),
                enableUpdate!: (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) => void;

            enableUpdate = <(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) => void>ko.bindingHandlers['enable']['update'];


            $element[value ? 'removeClass' : 'addClass']('ui-state-disabled');

            if ($element.is(':input')) {
                options.mode == 'readonly' ? $element.prop('readonly', !value) : enableUpdate(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
            }
        }
    }

    ko.bindingHandlers.enableEx = new EnableExBindingHandler();

    //-------------------------------------------------------------------------------

    class DisableExBindingHandler extends EnableExBindingHandler {
        public update(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext): void {
            super.update(element, function () { return !ko.utils.unwrapObservable(valueAccessor()) }, allBindingsAccessor, viewModel, bindingContext);
        }
    }

    ko.bindingHandlers.disableEx = new DisableExBindingHandler();

    //----------------------------------------------------------------------------

    // select the text from input field (just once, on init)
    // the binding uses select() method for text input field (use only on input element)
    // no params are needed if the value of the input is initially available
    // use as: <input data-bind="value: myText, selected">
    class SelectedBindingHandler implements KnockoutBindingHandler {
        public init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext): void {
            let val = ko.utils.unwrapObservable(valueAccessor());
            //select when an observable value exists, if it is set later the selection is not set on an empty input            
            if (ko.isObservable(valueAccessor()) && !val) {
                //wait until value is set
                let subscr = valueAccessor().subscribe((value) => {
                    if (value) {
                        element.select();
                        subscr.dispose();
                    }
                });
                //if editing we don't need to wait and select, otherwise the first character wil be lost if the valueAccessor is changed
                //on keydown, example is name description component which provides name observable
                //an alternative of this handle could be another observable used to prevent selection
                $(element).on('keydown', () => {
                    subscr.dispose();
                });
                ko.utils.domNodeDisposal.addDisposeCallback(element, () => {
                    subscr.dispose();
                    $(element).off('keydown');
                });

            }
            else {
                element.select();
            }
        }
    }

    ko.bindingHandlers.selected = new SelectedBindingHandler();

    //----------------------------------------------------------------------------------

    class SelectFocusedBindingHandler implements KnockoutBindingHandler {
        public update(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext): void {
            // needed for ie when used next to select
            let selected = ko.utils.unwrapObservable(valueAccessor());
            if (selected && $(element).is(":focus")) {
                element.select();
            }
        }
    }

    ko.bindingHandlers.selectFocused = new SelectFocusedBindingHandler();

    //---------------------------------------------------------------------------------

    //custom binding to initialize a jQuery UI button
    class JqButtonBindingHandler implements KnockoutBindingHandler {
        public init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext): void {
            let options = ko.utils.unwrapObservable(valueAccessor()) || {};

            //handle disposal
            ko.utils.domNodeDisposal.addDisposeCallback(element, () => $(element).button("destroy"));

            $(element).button(options);
        }
    }

    ko.bindingHandlers.jqButton = new JqButtonBindingHandler();

    //------------------------------------------------------------------------------

    class ClickRelayBindingHandler implements KnockoutBindingHandler {
        public init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext): void {
            let options = ko.utils.unwrapObservable(valueAccessor());
            let $element = $(element);
            if (!$element.is(options.from)) {
                $element = $element.siblings(options.from);
            }
            $element.click((event: JQueryEventObject) => $(event.currentTarget).siblings(options.to).trigger('click'));
        }
    }

    ko.bindingHandlers.clickrelay = new ClickRelayBindingHandler();

    //---------------------------------------------------------------------------

    class ClassBindingHandler implements KnockoutBindingHandler {
        public update(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext): void {
            if (element['__ko__previousClassValue__']) {
                $(element).removeClass(element['__ko__previousClassValue__']);
            }
            let value = ko.utils.unwrapObservable(valueAccessor());
            $(element).addClass(value);
            element['__ko__previousClassValue__'] = value;
        }
    }
    ko.bindingHandlers['class'] = new ClassBindingHandler();

    //----------------------------------------------------------------------------
    class LoggerBindingHandler implements KnockoutBindingHandler {
        public update(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext): void {
            //store a counter with this element
            let count = ko.utils.domData.get(element, "_ko_logger") || 0,
                data = ko.toJS(valueAccessor() || allBindingsAccessor());

            ko.utils.domData.set(element, "_ko_logger", ++count);

            if (console && console.log) {
                console.log(count, element, data);
            }
        }
    }

    ko.bindingHandlers.logger = new LoggerBindingHandler();

    //----------------------------------------------------------------------------

    class Spinner2BindingHandler implements KnockoutBindingHandler {
        public init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext): void {
            //initialize datepicker with some optional options
            let options = allBindingsAccessor().spinnerOptions || {};
            $(element).spinner(options);

            let validateAndSetValue = function (evt, uiValue) {
                let observable = valueAccessor();
                // try to get the value from the changed event instead of old value from the input
                // in order to get the actuon changes in the subscribers before second blur 
                let parsedVal = (typeof uiValue === 'number') ? uiValue : $(element).spinner("value");

                //if (!parsedVal ) return;
                if (!parsedVal && parsedVal !== 0) { // this will handle NaN
                    parsedVal = options.min ? options.min : 0;
                }

                if (parsedVal.toString().length > element.maxLength) { // todo: I need to change that control and use another
                    //evt.preventDefault(); // prevent default wouldn't work, because spinner throws the event after it has already happened
                    $(element).spinner("stepDown");
                    return;
                }

                //if (options && options.intOnly)
                //    parsedVal = parseInt(parsedVal);

                if (options.max && parsedVal > options.max) {
                    parsedVal = options.max;
                }
                if (options.min && parsedVal < options.min) {
                    parsedVal = options.min;
                }

                $(element).spinner("value", parsedVal);
                observable(parsedVal);
            };

            //handle the field changing
            $(element).on("spin spinchange", function (evt, ui) {
                validateAndSetValue(evt, (ui && ui.value ? ui.value : false));
            });

            $(element).keydown((event: JQueryKeyEventObject) => {
                // Allow: backspace, delete, tab, escape, enter and .
                if ($.inArray(event.keyCode, [46, 8, 9, 27, 190]) !== -1 ||
                    // Allow: Ctrl+A
                    (event.keyCode == 65 && event.ctrlKey === true) ||
                    // Allow: home, end, left, right
                    (event.keyCode >= 35 && event.keyCode <= 39)) {
                    // let it happen, don't do anything
                    return;
                }
                else if (event.keyCode == $.ui.keyCode.ENTER) {
                    validateAndSetValue(event, false);
                    return;
                }
                else {
                    // Ensure that it is a number and stop the keypress the other cases
                    if (event.shiftKey || (event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105)) {
                        event.preventDefault();
                    }
                }
            });

            $(element).on("change", function (evt, ui) {
                validateAndSetValue(evt, (ui && ui.value ? ui.value : false));
            });

            $(element).click(() => element.focus());

            //handle disposal (if KO removes by the template binding)
            ko.utils.domNodeDisposal.addDisposeCallback(element, () => {
                $(element).off("spin spinchange");
                $(element).off("change");
                $(element).spinner("destroy");
            });
        }

        public update(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext): void {
            let value = ko.utils.unwrapObservable(valueAccessor()),
                options = allBindingsAccessor().spinnerOptions || {},
                current = $(element).spinner("value");

            if (value !== current) {
                if (options && options.intOnly) {
                    $(element).spinner("value", parseInt(value));
                } else {
                    $(element).spinner("value", value);
                }

            }
            if (!ko.isObservable(options.disabled) && $(element).spinner("option", "disabled") != options.disabled) {
                $(element).spinner("option", "disabled", options.disabled);
            }
        }
    }

    ko.bindingHandlers.spinner2 = new Spinner2BindingHandler();

    //----------------------------------------------------------------------------

    class SafeHtmlBindingHandler implements KnockoutBindingHandler {

        private static escape(valueAccessor): string {
            let modelValue: KnockoutObservable<string | number | boolean> = valueAccessor(),
                unwrappedValue: string | number | boolean = ko.utils.peekObservable(modelValue) || '',
                exp = /&lt;(|\/)(b)&gt;/g,
                text = $('<div/>').text(unwrappedValue).html();

            return text.replace(exp, function (text) {
                return text.replace('&lt;', '<').replace('&gt;', '>');
            });
        }

        public init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext): void {
            $(element).html(SafeHtmlBindingHandler.escape(valueAccessor));
        }

        public update(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext): void {
            $(element).html(SafeHtmlBindingHandler.escape(valueAccessor));
        }
    }

    ko.bindingHandlers.safeHtml = new SafeHtmlBindingHandler();

    //----------------------------------------------------------------------------

    class EnterBindingHandler implements KnockoutBindingHandler {
        public init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext): void {
            let command = ko.utils.unwrapObservable(valueAccessor()),
                $input = $(element).find('input');


            $input.on({
                focus: (event: JQueryEventObject) => $(event.currentTarget).select(),

                change: (event: JQueryEventObject, afterKeyDown) => {
                    //'change' is triggered automaticaly in FF and Chrome, so execute the command only on manualy trigerred change event for all browsers
                    if (afterKeyDown) {
                        command.apply(command);
                    }
                },
                keydown: (event: JQueryEventObject) => {
                    if (event.keyCode == $.ui.keyCode.ENTER) {
                        $(event.currentTarget).trigger("change", true);
                        event.stopPropagation(); //the ENTER key is handled 
                    }
                }
            });
        }
    }

    ko.bindingHandlers.enter = new EnterBindingHandler();

    //----------------------------------------------------------------------------

    class ResponsiveNavigationBindingHandler implements KnockoutBindingHandler {

        private static handleResize(event: JQueryEventObject, data: { width: number } = { width: 0 }): void {
            ResponsiveNavigationBindingHandler.resize($(event.currentTarget), data);
        }

        private static resize($element: JQuery, size: { width: number }): void {
            let minWidth = $element.data('minWidth');
            if (!minWidth) {
                return;
            }
            let isLower = size.width < minWidth;
            $element[isLower ? 'addClass' : 'removeClass']($element.data('lowerWidthClass'));
        }

        private static handleUpdate($element: JQuery, value): void {
            if (value.items && typeof value.items === typeof function () { })
                value.items(); // 196734: we rely on the items change to recalculate minWidth
            let items = $element.find(value.contentItems),
                width = 16; // TODO: fix that

            $element.removeClass(value.lowerWidthClass);

            items.each((i, item) => width += $(item).outerWidth(true));

            $element.data('minWidth', width);

            ResponsiveNavigationBindingHandler.resize($element, { width: $element.outerWidth(true) });
        }

        public init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext): { controlsDescendantBindings: boolean; } {
            ko.applyBindingsToDescendants(bindingContext, element);

            let value = valueAccessor();

            $(element).data('lowerWidthClass', value.lowerWidthClass)
                .attr('data-dw-resizable', 'true')
                .bind('dwResize.koresponsiveNavigation', ResponsiveNavigationBindingHandler.handleResize);

            let computed = ko.computed(() => {
                ResponsiveNavigationBindingHandler.handleUpdate($(element), valueAccessor());
            });

            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                $(element).off('.koresponsiveNavigation');
                computed.dispose();
            });

            return { controlsDescendantBindings: true };
        }
    }

    ko.bindingHandlers.responsiveNavigation = new ResponsiveNavigationBindingHandler();

    //----------------------------------------------------------------------------

    class TreeViewNavigationBindingHandler implements KnockoutBindingHandler {
        private static handleResize(event, data: { width: number } = { width: 0 }): void {
            TreeViewNavigationBindingHandler.resize($(event.currentTarget), data);
        }

        private static _normalizeWidths($element: JQuery, folderClass: string): void {
            $element.removeClass($element.data('lowerWidthClass'));
            $element.find(folderClass).css({ 'width': 'auto' }); //reset all li widths
        }

        private static _recalculateWidths($element: JQuery, folderClass: string): void {
            let folders = $element.find(folderClass);

            if (folders.first().width() < 20) { //here lowerClassWidth is already applied, therefore all cells except the last one have equal widths (because of 'auto') therefore check just the first one
                folders.each((i, item) => {
                    if (i < (folders.length - 1)) $(item).width(20); //all cells except the last one
                    else $(item).width('auto'); //the last cell 
                });
            }
        }

        private static resize($element: JQuery, size: { width: number }) {
            let folderClass = $element.data('folderClass'),
                childrenSumWidth = $element.data('childrenSumWidth');
            if (!childrenSumWidth) {
                return;
            }

            let isLower = size.width < childrenSumWidth;

            if (isLower) {
                $element.find(folderClass).css({ 'width': 'auto' }); //reset all li widths

                $element.find(folderClass).last().width($element.data('lastElemFullWidth')); //set the last element to have full width
                $element.addClass($element.data('lowerWidthClass'));

                //check widths and recalculate
                TreeViewNavigationBindingHandler._recalculateWidths($element, folderClass);
            }
            else {
                TreeViewNavigationBindingHandler._normalizeWidths($element, folderClass);
            }
        }

        private static handleUpdate($element: JQuery, value: any, folderClass: string) {
            let items = $element.find(value.contentItems),
                childrenSumWidth = -20; // this is the width of the last arrow, which must not take part into the sum width (it is hidden)

            $element.data('folderClass', folderClass);

            //reset breadcrumb items before calculations
            TreeViewNavigationBindingHandler._normalizeWidths($element, folderClass);

            items.each(function (i, item) {
                childrenSumWidth += $(item).outerWidth(true);
            });

            $element.data('childrenSumWidth', childrenSumWidth);

            let lastElemFullWidth = $element.find(folderClass).last().width() + 1; //IE workaround (it calculates 1px less)
            $element.data('lastElemFullWidth', lastElemFullWidth);

            TreeViewNavigationBindingHandler.resize($element, { width: $element.outerWidth(true) });
        }

        public init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext): void {
            let value = valueAccessor();

            $(element).data('lowerWidthClass', value.lowerWidthClass)
                .attr('data-dw-resizable', 'true')
                .bind('dwResize.kotreeViewNavigation', TreeViewNavigationBindingHandler.handleResize);

            let computed = ko.computed(() => {
                let justTouchIt1 = value.items();
                justTouchIt1.forEach(function (i) {
                    var justTouchIt2 = i.name();
                });

                (<any>TreeViewNavigationBindingHandler.handleUpdate).delay(0, this, [$(element), valueAccessor(), value.folderClass]);
            });

            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                $(element).off('.kotreeViewNavigation');
                computed.dispose();
            });
        }
    }

    ko.bindingHandlers.treeViewNavigation = new TreeViewNavigationBindingHandler();

    //----------------------------------------------------------------------------

    class UniqueIdBindingHandler implements KnockoutBindingHandler {
        public static counter: number = 0;
        public static prefix: string = "unique";

        public init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext): void {
            let value = valueAccessor();
            element.id = value.id = value.id || UniqueIdBindingHandler.prefix + (++UniqueIdBindingHandler.counter);
        }
    }

    ko.bindingHandlers.uniqueId = new UniqueIdBindingHandler();

    //----------------------------------------------------------------------------

    class UniqueForBindingHandler implements KnockoutBindingHandler {
        public init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext): void {
            let value = valueAccessor();
            value.id = value.id || UniqueIdBindingHandler.prefix + (++UniqueIdBindingHandler.counter);
            element.setAttribute("for", value.id);
        }
    }

    ko.bindingHandlers.uniqueFor = new UniqueForBindingHandler();

    //----------------------------------------------------------------------------

    type ScrollElementIntoViewNativeMethodOptions = {
        options?: boolean | {
            behavior?: 'auto' | 'instant' | 'smooth',
            block?: 'start' | 'center' | 'end' | 'nearest',
            inline?: 'start' | 'center' | 'end' | 'nearest'
        }
    };
    type ScrollElementIntoViewOptions = { shouldScroll: (() => boolean) | KnockoutObservable<boolean>, options: ScrollElementIntoViewNativeMethodOptions };
    type ScrollElementIntoViewParams = (() => boolean) | KnockoutObservable<boolean> | ScrollElementIntoViewOptions;

    //TODO: use only ScrollElementIntoViewOptions as interface to this binding on all places => remove extra logic that supports dual interface currently
    class ScrollElementIntoViewBindingHandler implements KnockoutBindingHandler {
        private areParamsOptions(params: ScrollElementIntoViewParams): params is ScrollElementIntoViewOptions {
            return (<ScrollElementIntoViewOptions>params).shouldScroll !== void 0;
        }

        public update: KnockoutBindingHandlerUpdateMethod = (element, valueAccessor: () => ScrollElementIntoViewParams, allBindingsAccessor, viewModel, bindingContext) => {
            let params = valueAccessor(),
                shouldScroll: (() => boolean) | KnockoutObservable<boolean>,
                options: ScrollElementIntoViewNativeMethodOptions = false;

            if (this.areParamsOptions(params)) {
                shouldScroll = params.shouldScroll;
                if (params.options) {
                    options = params.options;
                }
            } else {
                shouldScroll = params;
            }

            if (shouldScroll() === true && element.scrollIntoView) {
                element.scrollIntoView(options);
            }
        }
    }

    ko.bindingHandlers.scrollElementIntoView = new ScrollElementIntoViewBindingHandler();

    //----------------------------------------------------------------------------

    class AutoSelectTextBindingHandler implements KnockoutBindingHandler {

        public init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext): void {
            let $element = $(element);

            $element.on("focus", (event: JQueryEventObject) => $(event.currentTarget).select());

            ko.utils.domNodeDisposal.addDisposeCallback(element, () => $element.off("focus"));
        }
    }

    ko.bindingHandlers.autoSelectText = new AutoSelectTextBindingHandler();

    //----------------------------------------------------------------------------
    /*
        repositionOnWindowResize takes as parameterers:
        - showEvent: required
            Show widget event. For exammple: "popoveropen"
            When it fires this binding starts listening for window resize event
        - hideEvent: required
            Close widget event. For example: "popoverclose"
            When it fires this binding stops listening for window resize event
        - widget: required
            Widget name. For example: "popover"
        - method: required
            Widgets method which we would lime to invoke. For example: "refresh"
        - params: optional
            If current widgets method takes some parameter we can attach it here
            like an Object, Array or single Property
        
        Example invokeing:
            data-bind="repositionOnWindowResize: { showEvent: 'contextmenushow', hideEvent: 'contextmenuhide',
                widget: 'contextMenu', method: 'reposition', params: $('button.my-profile-button') }"
    */
    class RepositionOnWindowResizeBindingHandler implements KnockoutBindingHandler {

        public init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext): void {
            let repositionOnResize: () => void;
            let params = ko.utils.unwrapObservable(valueAccessor());

            let onShowElement = () => {
                repositionOnResize = function () {
                    let widget = params['widget'],
                        method = params['method'],
                        parameters = params['params'] ? params['params'] : null;

                    (<any>$(element)[widget])(method, parameters);
                    //$(element)[params['widget']](params['method'],
                    //    (params['params'] ? params['params'] : null));
                };

                $(window).on('resize', repositionOnResize);
            }

            let onHideElement = () => $(window).off('resize', repositionOnResize);

            // Assign according event to target element
            $(element)
                .on(params['showEvent'], onShowElement)
                .on(params['hideEvent'], onHideElement);

            // Clear cache
            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                $(window).off('resize', repositionOnResize);
                $(element)
                    .off(params['showEvent'], onShowElement)
                    .off(params['hideEvent'], onHideElement);
            });
        }
    }

    ko.bindingHandlers.repositionOnWindowResize = new RepositionOnWindowResizeBindingHandler();

    //----------------------------------------------------------------------------

    class InsertAtCaretBindingHandler implements KnockoutBindingHandler {

        public init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext): void {
            let $element = $(element);
            let baseOptions = ko.utils.unwrapObservable(allBindingsAccessor()).insertAtCaret;

            let subscriptor = baseOptions.valueProvider.subscribe(function (serverVariable) {
                //TODO: Make DW.FileCabinet.DynamicEntries accessible
                if (serverVariable.type !== (<any>DW).FileCabinet.DynamicEntries.None.type) {
                    //TODO: insertAtCaret define in JQuery typescript
                    (<any>$element).insertAtCaret(serverVariable.sqlCommand).val();
                    $element.change();
                    baseOptions.valueProvider(viewModel.serverVariables()[0]);
                }
            });

            ko.utils.domNodeDisposal.addDisposeCallback(element,
                () => {
                    if (subscriptor) {
                        subscriptor.dispose();
                    }
                });
        }
    }

    ko.bindingHandlers.insertAtCaret = new InsertAtCaretBindingHandler();

    //----------------------------------------------------------------------------


    //You can choose whether to apply the bindings in the chosen element
    //(It controls the bindings for all children too)
    class ApplyBindings implements KnockoutBindingHandler {
        public init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext): { controlsDescendantBindings: boolean; } {
            var shouldApplyBindings = ko.unwrap(valueAccessor());

            return { controlsDescendantBindings: !shouldApplyBindings };
        }
    }

    ko.bindingHandlers.applyBindings = new ApplyBindings();


    class ContentSizeObserver implements KnockoutBindingHandler {

        public init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext): void {
            // Using resize-observer-polyfill from https://github.com/que-etc/resize-observer-polyfill


            var observer = new (<any>window).ResizeObserver((entries) => {
                if (ko.unwrap(valueAccessor)) {
                    $(element).trigger('contentsize', entries[0].contentRect);
                }
            });

            observer.observe(element);

            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                observer.unobserve(element);
            });
        }
    }

    ko.bindingHandlers.contentSizeObserver = new ContentSizeObserver();


    class AfterRender implements KnockoutBindingHandler {
        public init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext): { controlsDescendantBindings: boolean; } {
            let options = valueAccessor(),
                callback = this.initCallback(element, options.callback),
                controlsDescendantBindings = options.controlsDescendantBindings,
                isVisible = options.isVisible,
                visibleCallback = function () {
                    this.callWhenVisible(isVisible, callback);
                },
                onDemandCallSettings = options.onDemandCallSettings;

            if (controlsDescendantBindings === undefined) {
                controlsDescendantBindings = true;
            }

            if (controlsDescendantBindings) {
                ko.applyBindingsToDescendants(bindingContext, element);
            }

            if (onDemandCallSettings) {
                var subscriptions = this.startOnDemandListeners(onDemandCallSettings, visibleCallback);
                this.handleOnDemandListenersDisposal(element, subscriptions);
            } else {
                visibleCallback();
            }

            return { controlsDescendantBindings: controlsDescendantBindings };
        }
        getChildren(element) {
            var child = ko.virtualElements.firstChild(element),
                children = Array<KnockoutVirtualElement>();
            while (child) {
                children.push(child);
                child = ko.virtualElements.nextSibling(child);
            }
            return children;
        }
        callOnDemand(executing, callback) {
            if (!executing) {
                executing = true;

                callback = callback.bind(this);
                DW.When(callback()).always(function () {
                    executing = false;
                });
            }
        }
        startOnDemandListeners(onDemandCallSettings, callback) {
            let executing = false,
                triggerSubcriptions = new Array<any>();

            onDemandCallSettings.triggers.forEach(function (onDemandCallTrigger) {
                if (onDemandCallTrigger()) {
                    this.callOnDemand(executing, callback);
                } else {
                    var triggerSubscription = onDemandCallTrigger.subscribe(function (trigger) {
                        if (trigger) {
                            this.callOnDemand(executing, callback);
                            if (!onDemandCallSettings.callForEachTriggering) {
                                triggerSubscription.dispose();
                            }
                        }
                    }, this);
                    triggerSubcriptions.push(triggerSubscription);
                }
            }, this);
            return triggerSubcriptions;
        }
        handleOnDemandListenersDisposal(element, subscriptions) {
            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                subscriptions.forEach(function (subscription) {
                    if (!subscription.isDisposed) {
                        subscription.dispose();
                    }
                });
            });
        }
        callWhenVisible(isVisible, callback) {
            var dfd = DW.Deferred(),
                resolveCallback = function () {
                    DW.When(callback()).then(function () {
                        dfd.resolve();
                    });
                };
            if (isVisible && !isVisible()) {
                var visibilitySubscription = isVisible.subscribe(function (isVisible) {
                    if (isVisible) {
                        resolveCallback();
                        visibilitySubscription.dispose();
                    }
                });
            } else {
                resolveCallback();
            }
            return dfd.promise();
        }
        initCallback(element, callback) {
            var self = this;
            return function () {
                setTimeout(function () {
                    var callbackParam = element.nodeType === Node.COMMENT_NODE ?
                        self.getChildren(element) : element;
                    callback.call(null, callbackParam);
                }, 0);
            }
        }
    }

    ko.bindingHandlers.afterRender = new AfterRender();
    ko.virtualElements.allowedBindings.afterRender = true;

    class NotifyOnTrigger implements KnockoutBindingHandler {
        public init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext): void {
            let options = ko.utils.unwrapObservable(valueAccessor()),
                updateTriggers: { dispose: () => void },
                callback = options.callback ? options.callback : () => { };

            if (options.updateTriggers) {
                updateTriggers = ko.updateTriggers(options.updateTriggers, callback);
            }

            callback();

            ko.utils.domNodeDisposal.addDisposeCallback(element, function (element) {
                DW.Utils.dispose(updateTriggers);
            });
        }
    }

    ko.bindingHandlers.notifyOnTrigger = new NotifyOnTrigger();
    ko.virtualElements.allowedBindings.notifyOnTrigger = true;

    class ResizeDialog implements KnockoutBindingHandler {
        /// <summary>Listens for dialog activation.
        ///     Marks active dialogs with 'data-dw-resizableDialog' attribute (so it can be searched later as a visible dialog).
        ///     Updates element's dimensions.
        /// </summary>
        /// <param name='element' type='Object'>Dialog element</param>
        /// <param name='valueAccessor' type='Object'>A boolean observable</param>
        public update: KnockoutBindingHandlerUpdateMethod = (element, valueAccessor, ...args) => {
            var isActive = ko.utils.unwrapObservable(valueAccessor());
            DW.Utils.alterListeningForDWResizeEvent(element, isActive, 'data-dw-resizableDialog');
        }
    }

    ko.bindingHandlers.resizeDialog = new ResizeDialog();

    type ScrollViewOptions = {
        observers: DW.ScrollViewObserver[];
        resizeEventType: string; 
        isActive: KnockoutObservable<boolean>;
    };
    class ScrollView {
        public init: KnockoutBindingHandlerInitMethod = (element, valueAccessor: () => ScrollViewOptions, ...args) => {
            var options = valueAccessor(),
                scrollView = new DW.ScrollView($(element), element, options.resizeEventType).createInstance({
                    isActive: options.isActive
                });
            scrollView.addObservers(options.observers);

            options.observers.forEach((observer) => {
                observer.dispose = DW.Utils.extendMethod.call(
                    observer,
                    observer.dispose,
                    (result: void) => {
                        scrollView.removeObserver(observer);
                    });
            });

            ko.utils.domNodeDisposal.addDisposeCallback(element, () => {
                scrollView.removeObservers(options.observers);
                scrollView.dispose();
            });
        }
    }

    ko.bindingHandlers.scrollView = new ScrollView();
}));

namespace DWTS.BindingHandlers.Table {
    export const SCROLLABLE_CONTAINER_HEIGHT_CHANGE_EVENT_TYPE = 'heightChange';
    type ResizableColumnsOptions = {
        updateTriggers?: KnockoutObservable<any>[];
    };
    type StateHolders = {
        isVisible?: KnockoutObservable<boolean>;
    };
    type ViewModels<T> = {
        mainVM: DWTS.ViewModel;
        tableVM: DWTS.Interfaces.Tables.ITable<T> | DWTS.Interfaces.Tables.IVirtualTable<T>;
        tableForCreateVM: DWTS.Interfaces.Tables.ITable<T> | DWTS.Interfaces.Tables.IVirtualTable<T>;
        headerVM: DWTS.ViewModel;
    };
    interface IResizableBehaviourTemplates {
        wrapper: string;
        scroll: string;
        container: string;
        body: string;
        tHeader: string;
        rowsPrefix?: string; //the place for dummy rows at the beggining of the table
        rowsPostfix?: string; //the place for dummy rows at the end of the table
        tRow: string;
        editableRow?: string; // this is required if you want to have editable table row. Otherwise is not needed
    }
    interface ITemplates extends IResizableBehaviourTemplates {
        itemsView: string;
    }
    interface IOptionalResizableBehaviourTemplates {
        wrapper?: string;
        scroll?: string;
        container?: string;
        body?: string;
        tHeader: string;
        rowsPrefix?: string; //the place for dummy rows at the beggining of the table
        rowsPostfix?: string; //the place for dummy rows at the end of the table
        tRow: string;
        editableRow?: string; // this is required if you want to have editable table row. Otherwise is not needed
    }
    interface IOptionalTemplates extends IOptionalResizableBehaviourTemplates {
        itemsView?: string;
    }

    interface IOptionalElementAccessors {
        header: {
            getCellsContainer: () => JQuery;
            getCells: () => JQuery;
        },
        table: {
            get?: () => JQuery;
            getResizableContainer: () => JQuery;
            getScrollableContainer: () => JQuery;
            getHeaderCells: () => JQuery;
        },
        footer?: {
            get: () => JQuery;
            getCellsContainer: () => JQuery;
            getCells: () => JQuery;
        }
    };

    interface IElementAccessors {
        header: {
            getCellsContainer: () => JQuery;
            getCells: () => JQuery;
        },
        table: {
            get: ($root: JQuery) => JQuery;
            getResizableContainer: () => JQuery;
            getScrollableContainer: () => JQuery;
            getHeaderCells: () => JQuery;
        },
        footer: {
            get: () => JQuery;
            getCellsContainer: () => JQuery;
            getCells: () => JQuery;
        }
    };

    interface ICellAccessors {
        getHeaderCells: () => JQuery;
        getTableHeaderCells?: () => JQuery;
        getFooterCells?: () => JQuery;
    }

    interface IBehaviourOptions<T> {
        stateHolders?: StateHolders;
        viewModels: ViewModels<T>;
        updateTriggers?: { [id: string]: KnockoutObservable<any>[] };
    }

    interface ITableBehaviour<T> {
        init: ($root: JQuery) => void;
        templates: ITemplates;
        viewModels: ViewModels<T>;
        updateTriggers: { [id: string]: KnockoutObservable<any>[] };
        isVisible: KnockoutObservable<boolean>;
    }

    interface IResizableBehaviour<T> extends ITableBehaviour<T> {
        afterRender: () => void;
    }

    interface IDefaultBehaviourOptions<T> extends IBehaviourOptions<T> {
        templates: IOptionalTemplates;
    }

    interface IResizableBehaviourOptions<T> extends IBehaviourOptions<T> {
        templates: IOptionalResizableBehaviourTemplates;
        resizableColumns: ResizableColumnsOptions; // all resizableColumns binding options may be passed (including updateTriggers)
        elementAccessors: IOptionalElementAccessors;
        tableId: string;
    }

    export class DefaultBehaviour<T> implements ITableBehaviour<T> {
        public viewModels: ViewModels<T>;
        public updateTriggers: { [id: string]: KnockoutObservable<any>[] };

        protected _templates: ITemplates;
        public get templates() {
            return this._templates;
        }

        private _isVisible: KnockoutObservable<boolean>;
        public get isVisible() {
            return this._isVisible;
        }

        constructor(options: IDefaultBehaviourOptions<T>) {
            this._templates = this.initTemplates(options.templates, options.viewModels.tableVM.type);
            let {
                stateHolders = {},
                updateTriggers = {}
            } = options;

            let {
                isVisible = ko.observable(true)
            } = stateHolders;

            this._isVisible = isVisible;
            this.viewModels = options.viewModels;
            this.updateTriggers = updateTriggers;
        }

        private initTemplates(templates: IOptionalTemplates, tableType: DWTS.TableType): ITemplates {
            let {
                wrapper = 'table-wrapper-base-template',
                scroll = DW.Utils.format('{0}-table-scroll-template', tableType),
                container = 'base-table-container-template',
                body = DW.Utils.format('{0}-table-body-template', tableType),
                tHeader,
                rowsPrefix,
                rowsPostfix,
                tRow,
                editableRow, 
                itemsView = 'table-items-view'
            } = templates;

            return {
                wrapper,
                scroll,
                container,
                body,
                tHeader,
                rowsPrefix,
                rowsPostfix,
                tRow,
                editableRow,
                itemsView
            }
        }

        public init($root: JQuery) { }
    }

    type Column = { $header: JQuery, $tableHeader: JQuery, $footer: JQuery };
    type ColumnsOptions = {
        elementAccessors: ICellAccessors,
        $headerCellsContainer: JQuery,
        $table?: JQuery,
        $footerCellsContainer?: JQuery,
        $footerContainer?: JQuery,
        updateFooterContainerOffset?: () => void
    };

    export class Columns extends Array<Column>{
        private constructor(items: Array<Column> = []) {
            super(...items);
        }

        static create(options: ColumnsOptions): Columns {
            let {
                elementAccessors,
                $headerCellsContainer,
                $table = <JQuery>{
                    width: (width: number) => { }
                },
                $footerCellsContainer = <JQuery>{
                    width: (width: number) => { }
                },
                $footerContainer = <JQuery>{
                    width: (width: number) => { }
                },
                updateFooterContainerOffset = () => { }
            } = options;

            let {
                getTableHeaderCells = () => {
                    return {
                        get: function (index: number) {
                            return {
                                width: function () { }
                            };
                        }
                    };
                },
                getFooterCells = () => {
                    return {
                        get: (index: number) => {
                            return {
                                width: (width: number) => { }
                            };
                        }
                    };
                },
            } = elementAccessors;

            let self = Object.create(Columns.prototype),
                $headerCells = (elementAccessors.getHeaderCells && elementAccessors.getHeaderCells())
                    || $($headerCellsContainer.find('thead > tr > th:visible')),
                $tableHeaderCells = getTableHeaderCells(),
                $footerCells = getFooterCells();

            self.off = $headerCells.off.bind($headerCells);
            self.on = $headerCells.on.bind($headerCells);
            self.index = $headerCells.index.bind($headerCells);
            self.findElement = $headerCells.find.bind($headerCells);

            $headerCells.each((index) =>
                self.push({
                    $header: $($headerCells.get(index)),
                    $tableHeader: $($tableHeaderCells.get(index)),
                    $footer: $($footerCells.get(index))
                }));

            self.updateFooterWidth = (availableWidth: number) => $footerContainer.width(availableWidth);

            self.setContainersWidth = (width: number, availableWidth: number) => {
                $headerCellsContainer.width(width);
                $table.width(width);
                $footerCellsContainer.width(width);

                updateFooterContainerOffset();
                self.updateFooterWidth(availableWidth);
            };

            return self;
        }

        public off;
        public on;
        public index;
        public findElement;
        public setContainersWidth: (width: number, availableWidth: number) => void;
        public updateFooterWidth: (width: number) => void;

        public setWidths(newWidths: { [id: number]: number }) {
            Object.keys(newWidths).forEach((key) => {
                let column: Column = this[key],
                    width = newWidths[key];

                column.$header.width(width);
                column.$tableHeader.width(width);
                column.$footer.width(width);
            });
        }
    }

    type ScrollbarDimensions = {
        width: number,
        height: number
    };

    export class ResizableBehaviour<T> extends DefaultBehaviour<T> implements IResizableBehaviour<T> {
        private readonly EVENTS_NAMESPACE = '.resizableBehaviour';

        public afterRender: () => void;

        private resizableColumnsOptions: ResizableColumnsOptions;
        private elementAccessors: IElementAccessors;
        private tableId: string;

        constructor(options: IResizableBehaviourOptions<T>) {
            super(options);

            this._templates.container = options.templates.container || 'resizable-table-container-template'
            if (options.elementAccessors.footer) {
                this.positionFooterContainerInitially = this.positionFooterContainerInTable;
                this.updateFooterContainerOffset = this.updateFooterContainerTopOffset;
            } else {
                this.positionFooterContainerInitially = () => { };
                this.updateFooterContainerOffset = () => { };
                this._templates.itemsView = 'table-items-view-with-after-render-notifier';
            }

            let {
                footer = {
                    getCellsContainer: () => {
                        return <JQuery>{
                            width: (width: number) => { },
                            css: (attr: string, value: any) => { }
                        };
                    },
                    getCells: () => {
                        return <JQuery>(<unknown>{
                            get: (index: number) => {
                                return {
                                    width: (width: number) => { }
                                };
                            }
                        });
                    },
                    get: () => {
                        return <JQuery>{
                            width: (width: number) => { }
                        };
                    }
                }
            } = options.elementAccessors;

            let {
                get = ($root) => $($root.find('table')[0])
            } = options.elementAccessors.table;

            this.resizableColumnsOptions = options.resizableColumns;
            this.elementAccessors = {
                header: options.elementAccessors.header,
                table: {
                    get,
                    getHeaderCells: options.elementAccessors.table.getHeaderCells,
                    getResizableContainer: options.elementAccessors.table.getResizableContainer,
                    getScrollableContainer: options.elementAccessors.table.getScrollableContainer
                },
                footer
            };
            this.tableId = options.tableId;
        }
        
        private attachResizableColumnsWidget(
            $headerCellsContainer: JQuery,
            $footerCellsContainer: JQuery,
            $footerContainer: JQuery,
            $scrollableTableContainer: JQuery,
            $table: JQuery,
        ): void {
            let scrollbarDimensions = { width: 0, height: 0 },
                rows = (<DWTS.Interfaces.Tables.IVirtualTable<T>>(this.viewModels.tableVM)).visibleRows ||
                    this.viewModels.tableVM.rows;

            $headerCellsContainer.data({ 'resizable-columns-id': this.tableId });
            $headerCellsContainer.resizableColumns($.extend(this.resizableColumnsOptions, {
                updateTriggers: {
                    observables: this.resizableColumnsOptions.updateTriggers ?
                        [rows].concat(<any>this.resizableColumnsOptions.updateTriggers) : [rows]
                },
                $resizableTableContainer: this.elementAccessors.table.getResizableContainer(),
                $table,
                columns: Columns.create({
                    elementAccessors: {
                        getHeaderCells: this.elementAccessors.header.getCells,
                        getTableHeaderCells: this.elementAccessors.table.getHeaderCells,
                        getFooterCells: this.elementAccessors.footer.getCells
                    },
                    $headerCellsContainer,
                    $table,
                    $footerCellsContainer,
                    $footerContainer,
                    updateFooterContainerOffset: () => this.updateFooterContainerOffset(
                        scrollbarDimensions, $footerContainer, $scrollableTableContainer)
                })
            }));

            ko.utils.domNodeDisposal.addDisposeCallback($headerCellsContainer.get(0), () => {
                $headerCellsContainer.data('resizableColumns').destroy();
            });
        }

        private positionFooterContainerInitially: ($footerContainer: JQuery, $scrollableContainer: JQuery) => void;
        private positionFooterContainerInTable($footerContainer: JQuery, $scrollableContainer: JQuery) {
            setTimeout(() => {
                let defaultOffset = $footerContainer.offset(),
                    superfluousFooterTopOffset = $footerContainer.height() +
                        DW.Utils.styleToValue($scrollableContainer.css('margin-bottom')) +
                        DW.Utils.styleToValue($scrollableContainer.css('border-bottom-width')),
                    inTableOffset = {
                        left: defaultOffset.left +
                            DW.Utils.styleToValue($scrollableContainer.css('border-left-width')),
                        top: defaultOffset.top - superfluousFooterTopOffset
                    };

                $footerContainer.offset(inTableOffset);
            }, 0);
        }

        private updateFooterContainerOffset: (
            scrollbarDimensions: ScrollbarDimensions,
            $footerContainer: JQuery,
            $scrollableTableContainer: JQuery
        ) => void;
        private updateFooterContainerTopOffset(
            scrollbarDimensions: ScrollbarDimensions,
            $footerContainer: JQuery,
            $scrollableTableContainer: JQuery
        ): void {
            setTimeout(() => {
                let scrollbarHeight = $scrollableTableContainer.innerHeight() - $scrollableTableContainer.get(0).clientHeight,
                    scrollbarHeightDifference = scrollbarHeight - scrollbarDimensions.height;

                //If we call a scrollbar dimension (which is browser defined) A,
                //the possible values that the difference may obtain are: A and -A.
                //We may therefore safely require the difference to be above 1, 
                //to avoid very small differences due to JS calculation inaccuracy,
                //because A >> 1.
                if (Math.abs(scrollbarHeightDifference) > 1) {
                    let currentOffset = $footerContainer.offset(),
                        newOffsetTop = currentOffset.top - scrollbarHeightDifference;

                    $footerContainer.offset({ left: currentOffset.left, top: newOffsetTop });
                    scrollbarDimensions.height = scrollbarHeight;

                    $scrollableTableContainer.trigger(SCROLLABLE_CONTAINER_HEIGHT_CHANGE_EVENT_TYPE);
                }
            }, 0);
        }

        private listenForHorizontalScrollingAndMoveColumnTitleContainers(
            $scrollableContainer: JQuery,
            $headerCellsContainer: JQuery,
            $footerCellsContainer: JQuery
        ): void {
            var lastScrollLeft = 0,
                position = ($element: JQuery, left: number) => {
                    $element.css('left', DW.Utils.format('-{0}px', left));
                };
            $scrollableContainer.on('scroll' + this.EVENTS_NAMESPACE, () => {
                var scrollLeft = $scrollableContainer.scrollLeft();
                if (lastScrollLeft !== scrollLeft) {
                    lastScrollLeft = scrollLeft;
                    position($headerCellsContainer, scrollLeft);
                    position($footerCellsContainer, scrollLeft);
                }
            });
            ko.utils.domNodeDisposal.addDisposeCallback($scrollableContainer.get(0), () => {
                $scrollableContainer.off(this.EVENTS_NAMESPACE);
            });
        };

        public init($root: JQuery) {
            this.afterRender = () => {
                let $headerCellsContainer = this.elementAccessors.header.getCellsContainer(),
                    $footerCellsContainer = this.elementAccessors.footer.getCellsContainer(),
                    $table = this.elementAccessors.table.get($root),
                    $scrollableTableContainer = this.elementAccessors.table.getScrollableContainer(),
                    $footerContainer = this.elementAccessors.footer.get();

                this.positionFooterContainerInitially($footerContainer, $scrollableTableContainer);
                this.attachResizableColumnsWidget(
                    $headerCellsContainer,
                    $footerCellsContainer,
                    $footerContainer,
                    $scrollableTableContainer,
                    $table);

                this.listenForHorizontalScrollingAndMoveColumnTitleContainers(
                    $scrollableTableContainer,
                    $headerCellsContainer,
                    $footerCellsContainer);
            };
        }
    }

    type TableOptions<T> = {
        behaviour?: ITableBehaviour<T>

        //DEPRECATED
        stateHolders?: StateHolders,
        viewModels: ViewModels<T>,
        updateTriggers?: { [id: string]: KnockoutObservable<any>[] }
        tableTemplates: IOptionalTemplates,
        resizableColumns?: ResizableColumnsOptions // all resizableColumns binding options may be passed (including updateTriggers)
    };

    interface ITableBindingContext<T> extends KnockoutBindingContext {
        $data: {
            behaviour?: ITableBehaviour<T>,
            tableTemplates: IOptionalTemplates,
            stateHolders?: StateHolders,
            viewModels: ViewModels<T>,
            updateTriggers?: { [id: string]: KnockoutObservable<any>[] }
            resizableColumns?: ResizableColumnsOptions // all resizableColumns binding options may be passed (including updateTriggers)
        }
    }

    class Table {
        public init: KnockoutBindingHandlerInitMethod = <T>(element: any, valueAccessor: () => TableOptions<T>, allBindingsAccessor: KnockoutAllBindingsAccessor, viewModel: any, bindingContext: ITableBindingContext<T>) => {
            let options = valueAccessor(),
                $element = $(element);

            let {
                behaviour = new DefaultBehaviour({
                    viewModels: options.viewModels,
                    updateTriggers: options.updateTriggers,
                    stateHolders: options.stateHolders,
                    templates: options.tableTemplates
                })
            } = options;

            behaviour.init($element);

            bindingContext.$data.behaviour = behaviour;
            bindingContext.$data.tableTemplates = behaviour.templates;

            bindingContext.$data.viewModels = behaviour.viewModels;
            bindingContext.$data.updateTriggers = behaviour.updateTriggers;
        }
    }

    ko.bindingHandlers.table = new Table();
}

namespace DWTS.BindingHandlers.LazyBinding {
    let ATTACH_DELAY = 400;
    export type AttachMethod = (target: EventTarget, eventNames: string) => void;

    export let prepareAttachDebounced = (attach: AttachMethod) => {
        return DW.Utils.debounce((target: EventTarget, eventNames: string) => {
            if ($(target).filter(':hover').length !== 0 && DW.Utils.isVisible(<HTMLElement>target)) {
                attach(target, eventNames);
            }
        }, ATTACH_DELAY);
    }

    export class LazyBindingHandler implements KnockoutBindingHandler {
        private readonly SELECTOR: string;

        constructor(
            private readonly SETTINGS_KEY: string,
            eventNames: string,
            private lazyInit: (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) => void,
            prepareAttach = (attach: AttachMethod) => attach) {

            this.SELECTOR = ':data(' + this.SETTINGS_KEY + ')';
            this.initGlobalListener(
                document,
                eventNames,
                prepareAttach(this.attachAndOpen.bind(this)));
        }

        public init: (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) => void = (...args) => {
            let element = args[0];
            $(element).data(this.SETTINGS_KEY, args);

            ko.utils.domNodeDisposal.addDisposeCallback(element, () => this.destroy(element));
        }

        private getEventName(eventNames: string, index: number): string {
            return eventNames.split(' ')[index];
        }

        private retrieveSettings(element: EventTarget): any[] {
            return $(element).data(this.SETTINGS_KEY);
        }

        private disposeSettings(element: EventTarget): void {
            $(element).removeData(this.SETTINGS_KEY);
        }

        private destroy(element: HTMLElement): void {
            this.disposeSettings(element);
        }

        /**
         * @return was attach successful
         */
        private attach(element: EventTarget, settings: any[]): boolean {
            this.disposeSettings(element);

            var shouldAttach = !!settings;
            if (shouldAttach) {
                this.lazyInit.apply(null, settings);
            }
            return shouldAttach;
        }

        public attachAndOpen(target: EventTarget | Element, eventNames: string): void {
            let settings = this.retrieveSettings(target);
            if (this.attach(target, settings)) {
                let firstEventName = this.getEventName(eventNames, 0);
                $(target).trigger(firstEventName); // We only need to trigger one event, since we listen for each one
            }
        }

        private initGlobalListener(
            element: Node,
            eventNames: string,
            attach: (target: EventTarget, eventNames: string) => void): void {

            $(element).on(eventNames, this.SELECTOR, (event) => attach.call(this, event.currentTarget, eventNames));

            ko.utils.domNodeDisposal.addDisposeCallback(<Element>element, () => {
                $(element).off(eventNames);
            });
        }
    }
}