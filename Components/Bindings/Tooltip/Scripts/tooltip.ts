(function (factory) {
    if (typeof define === "function" && define.amd) { // AMD.
        define([
            "jquery",
            "knockout",
            "../../../ViewModels/TS/Disposable",
            "../../../jquery.extensions"
        ], factory);
    } else { // Global
        factory(jQuery, ko);
    }
}(function ($, ko) {
    
    // tooltip binding
    ko.bindingHandlers.tooltip2 = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var $element = $(element);
            var tooltipOptions = ko.utils.unwrapObservable(allBindingsAccessor()).tooltip2;
            var behaviour;
            switch (tooltipOptions.tooltipType) {
                case "hideable":
                    /// Hideable Select Tooltip
                    /// Works on html 'select' element
                    /// Shows if the select width is less then the calculated text width of the current option
                    /// Recalculates in each 'change' event
                    if ($element.is('select')) behaviour = new DWTS.Tooltip.SelectTooltip($element, tooltipOptions, ko.utils.unwrapObservable(allBindingsAccessor()).options);

                    /// Hideable Tooltip
                    /// Works on html element except 'select'
                    /// Shows if the element have attribute truncated = true, 
                    /// The check is located in file: jquery.extensions.js
                    /// Recalculates in each options.title observable change (if the title is observable)
                    else behaviour = new DWTS.Tooltip.HideableTooltip($element, tooltipOptions);
                    break;

                    /// Hideable Container Tooltip
                    /// Works on html element except 'select'
                    /// Shows if any of the childs of an html element have attribute truncated = true
                case "hideable-container":
                    behaviour = new DWTS.Tooltip.ContainerTooltip($element, tooltipOptions);
                    break;

                    /// Html Renderer Tooltip
                    /// Extends Base Tooltip with the standard behaviour
                    /// In order to work properly - the option (html: true) should be passed
                    /// Renders html title according to passed options.templateName(knockout html id) and options.viewModel(view model)
                case "html-renderer":
                    behaviour = new DWTS.Tooltip.HtmlRendererTooltip($element, tooltipOptions);
                    break;

                    /// Base Tooltip (standard)
                    /// Shows on given event action on the HTML element (ex.: focus, hover, acc. to the options)
                default:
                    behaviour = new DWTS.Tooltip.BaseTooltip($element, tooltipOptions);
                    break;
            }
            behaviour.init();         
            ko.utils.domNodeDisposal.addDisposeCallback(element, behaviour.dispose.bind(behaviour));
        }
    };
}));

namespace DWTS.Tooltip {

    export class BaseTooltip extends DWTS.Disposable {
        protected $element: JQuery;
        protected isToolTipVisible: boolean;
        protected options: DWTS.Interfaces.Tooltip.IBaseTooltipOptions;
        static delayInterval: number = 420;

        constructor($element, options) {
            super();
            this.options = {
                title: null,
                container: 'body',
                placement: function(context, source) {
                    if ($element.offset().top > ($(document).height() / 2)) return "top";
                    else return "bottom";
                },
                animation: true,
                html: false, 
                reserveValue: undefined,        // reserve value will be initiated as a title option if the title is an observable and is undefined by default
                addWidth: null,
                forseUpdate: false,             // not used - could be removed
                optionsTitle: undefined,        // not used - could be removed ?
                optionsValue: undefined,        // used for SelectTolltip
                optionsValueParam: undefined,   // used for SelectTolltip
                titles: [],                     // used to form title acc to passed string[]
                selectTitle: "",                // used for SelectTolltip
                selectValue: "",                // used for SelectTolltip
                trackObservable: true,          // used to disable observable trigger of the Hideable Tooltips
                delay: DWTS.Tooltip.BaseTooltip.delayInterval
            };
            this.$element = $element;
            $.extend(this.options, options);
        }

        public init() : void {
            this.isToolTipVisible = false;
            // Called on tooltip show event /mouseenter/
            this.$element.on('show.bs.tooltip', function () {
                this.isToolTipVisible = true;
            }.bind(this));
            // Called on tooltip hide event /mouseleave/
            this.$element.on('hide.bs.tooltip', function () {
                this.isToolTipVisible = false;
            }.bind(this));

            this.initOptionDetails();
        }

        protected initOptionDetails() : void {

            let self = this;
            this.$element.tooltip2(this.options);

            this.$element.on('click.bs.tooltip', function (e) {
                let tooltip2 = self.$element.data('bs.tooltip');
                if (!tooltip2 || !tooltip2.$tip) return;
                if (tooltip2.$tip.is(':visible')) {
                    self.$element.tooltip2('hide');
                }
            });
        }

        protected handleTooltipVisualization(): void {
            // "true" is the bootstrap default.
            let origAnimation = this.options.animation || true;
            let title = ko.isObservable(this.options.title) ? this.options.title() : this.options.title;
            if (this.isToolTipVisible) {
                this.$element.data('bs.tooltip').options.animation = false; // temporarily disable animation to avoid flickering of the tooltip
                this.$element.tooltip2('fixTitle') // call this method to update the title
                    .tooltip2('show');
                this.$element.data('bs.tooltip').options.animation = origAnimation;
            }
            else {
                this.$element.tooltip2('hide');
            }
        }

        public dispose(): void {
            this.$element.tooltip2('destroy');
            super.dispose();
        }
    }

    export class HideableTooltip extends BaseTooltip {
        protected $defaultTextContainer: JQuery;
        protected $textWidth: JQuery;
        protected elementWidth: number;
        protected maxTextWidth: number;

        constructor($element, options, selectArray?) {
            super($element, options);
            this.handleTooltipTitle(this.options, selectArray);
            let placement = options.placement;
            $.extend(this.options, {
                trigger: 'hover',
                placement: function (tip, element) {
                    $(tip)[this.isToolTipVisible ? 'removeClass' : 'addClass']('ui-hidden');
                    return placement;
                }.bind(this)
            });
        }

        public init() : void {
            // Called on tooltip show event /mouseenter/
            this.$element.on('show.bs.tooltip', function (evt) {
                this.isToolTipVisible = this.checkTooltipElement();
            }.bind(this));

            // Called on tooltip hide event /mouseleave/
            this.$element.on('hide.bs.tooltip', function () {
                this.isToolTipVisible = false;
            }.bind(this));

            // If the title is an observable, make it auto-updating.
            if (ko.isObservable(this.options.title) && this.options.trackObservable) {
                this.isToolTipVisible = false;
                this.addChangeHandler();
            }

            this.initOptionDetails();
        }

        protected handleTooltipTitle(options: DWTS.Interfaces.Tooltip.IBaseTooltipOptions, selectArray?: KnockoutObservableArray<any>) : void {

            if (ko.isObservable(options.title) && options.title() === undefined && options.reserveValue !== undefined) {
                options.title = ko.observable(options.reserveValue);
            }
        }

        protected checkTooltipElement() : boolean {
            return this.$element.is(':truncated');
        }

        protected updateTextContainer() : void {

            if (!this.$defaultTextContainer) {
                this.$defaultTextContainer = $('<div style="position: absolute; top: 0; left: 0; visibility: hidden"><div>');
                this.$textWidth = this.$defaultTextContainer.css('font-weight', this.$element.css("font-weight")).css('font-size', this.$element.css("font-size")).appendTo('body');
            }
            else {
                this.$defaultTextContainer.empty();
            }
        }

        protected addChangeHandler() : void {
            this.addDisposable(this.options.title.subscribe(function () {
                if (this.checkTooltipElement()) {
                    this.isToolTipVisible = true;
                    this.handleTooltipVisualization();
                }
            }, this));
        }
    }

    export class ContainerTooltip extends HideableTooltip {

        constructor($element, options) {
            super($element, options);
        }

        protected checkTooltipElement() : boolean {
            return this.$element.find(':truncated').length > 0;
        }

        protected handleTooltipTitle(options: DWTS.Interfaces.Tooltip.IBaseTooltipOptions) : void {

            if (!options.title) {
                let title = '';
                options.titles.forEach(function (currentText) {
                    title += (currentText + ' ');
                });
                options.title = title.slice(0, -1);
            }
        }
    }

    export class SelectTooltip extends HideableTooltip {

        constructor($element, options, selectArray) {
            super($element, options, selectArray);
            this._updateElements();
        }

        protected checkTooltipElement() : boolean {

            this._updateElements();
            if (this.maxTextWidth <= this.elementWidth) {
                this.isToolTipVisible = false;
            }
            else {
                this.isToolTipVisible = true;
            }
            return this.isToolTipVisible;
        }

        protected handleTooltipTitle(options: DWTS.Interfaces.Tooltip.IBaseTooltipOptions, selectArray: KnockoutObservableArray<any>) : void {
            // get the text value direct from value 
            if (options.hasOwnProperty('selectTitle')) {

                if (options.selectTitle === undefined) {
                    options.selectTitle = options.reserveValue;
                }

                options.title = ko.observable(options.selectTitle);
            }
            // get the text value acc to the passed number value 
            else if (options.hasOwnProperty('selectValue')) {
                if (options.selectValue === undefined) {
                    options.title = ko.observable(options.reserveValue);
                }
                else {
                    selectArray().forEach(function (element) {
                        if (element[options.optionsValueParam] === options.selectValue) {
                            options.title = ko.observable(element.displayName);
                        }
                    }.bind(this));
                }
            }
            else if (!options.title) {
                options.title = ko.observable(options.reserveValue);
            }
        }

        protected addChangeHandler(): void {
            this.$element.on('change', function (e) {
                this.options.title(this.$element.find(":selected").text());
                this._updateElements();
                this.isToolTipVisible = (this.maxTextWidth <= this.elementWidth) ? false : true;
                this.handleTooltipVisualization();
            }.bind(this));
        }

        private _updateElements() : void {
            this.updateTextContainer();
            this._updateElementsWidth();
        }

        private _updateElementsWidth() : void {
            let selectPadding = (DW.Utils.isIE ? 24 : 26);
            this.$textWidth.text(this.$element.find(":selected").text());
            this.elementWidth = this.$element.width() - selectPadding;
            this.maxTextWidth = this.$textWidth.width();
        }    
    }

    export class HtmlRendererTooltip extends BaseTooltip {

        protected options: DWTS.Interfaces.Tooltip.IHtmlRendererTooltipOptions;
        protected $htmlTitle: JQuery;

        constructor($element, options) {
            super($element, options);
            $.extend(this.options, options);
        }

        public init(): void {
            this.renderTitle();
            super.init();
        }

        protected renderTitle() {
            this.$htmlTitle = DW.Utils.renderTemplate(this.options.templateName, this.options.viewModel);
            $.extend(this.options, { title: ko.observable(this.$htmlTitle.children().length ? this.$htmlTitle.prop('outerHTML') : '' ) });
        }

        public dispose(): void {
            this.$htmlTitle.remove();
            super.dispose();
        }
    }
} 


