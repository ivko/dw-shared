(function ($, ko) {

    ko.bindingHandlers.tooltip2 = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var $element = $(element);
            var tooltipOptions = ko.utils.unwrapObservable(allBindingsAccessor()).tooltip2;
            var isHideableType = (tooltipOptions.tooltipType && tooltipOptions.tooltipType === 'hideable') ? true : false;
            var isHideableCoinatner = (tooltipOptions.tooltipType && tooltipOptions.tooltipType === 'hideable-container') ? true : false;
            var behaviour = $element.data("dynamicTooltipBehavior");
            if (!behaviour) {

                if (isHideableType && $element.is('select')) {
                    behaviour = new SelectTooltip($element, tooltipOptions, ko.utils.unwrapObservable(allBindingsAccessor()).options);
                }
                else if (isHideableType) {
                    behaviour = new HideableTooltip($element, tooltipOptions);
                }
                else if (isHideableCoinatner) {
                    behaviour = new ContainerTooltip($element, tooltipOptions);
                }
                else {
                    behaviour = new BaseTooltip($element, tooltipOptions);
                }
                behaviour.init();
            }

            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                var $element = $(element);
                var behaviour = $element.data("dynamicTooltipBehavior");
                if (behaviour) {
                    behaviour.dispose();
                    $element.removeData("dynamicTooltipBehavior");
                }
            });
        }
    };

    var BaseTooltip = new Class({
        Extends: DW.Disposable,
        $element: null, isToolTipVisible: null,
        options: {
            container: 'body',
            placement: 'bottom',
            animation: true,
            reserveValue: undefined,
            destroyHandler: false,
            addWidth: null,
            forseUpdate: false,
            disableHandler: false
        }, // optional for select tooltip: optionsTitle: undefined, optionsValue: undefined, optionsValueParam: undefined 
        initialize: function ($element, options) {
            this.parent();

            this.$element = $element;
            $.extend(this.options, options);
        },

        init: function() {
            var _self = this;

            this.isToolTipVisible = false;
            // Called on tooltip show event /mouseenter/
            this.$element.on('show.bs.tooltip', function () {
                _self.isToolTipVisible = true;
            });
            // Called on tooltip hide event /mouseleave/
            this.$element.on('hide.bs.tooltip', function () {
                _self.isToolTipVisible = false;
            });

            var title = this.options.title;
            if (!$.isFunction(title)) {
                title = function () { return title; };
            }
            title = this.addDisposable(ko.computed(title));

            this.addDisposable(title.subscribe(function () {
                //_self.isToolTipVisible = true;
                _self.handleTooltipVisualization();
            }));
            // hide tooltip when the element container is showing new dialogs
            if (this.options.disableHandler) {
                this.$element.on("mousedown", function () {
                    _self.isToolTipVisible = false;
                    _self.$element.tooltip2('hide');
                });
            }

            this.initOptionDetails();
        },

        initOptionDetails: function () {

            var self = this;
            this.$element.tooltip2(this.options);

            this.$element.on('click.bs.tooltip', function (e) {
                var tooltip2 = self.$element.data('bs.tooltip');
                if (!tooltip2 || !tooltip2.$tip) return;
                if (tooltip2.$tip.is(':visible')) {
                    self.$element.tooltip2('hide');
                }
            });
        },

        handleTooltipVisualization: function () {

            // "true" is the bootstrap default.
            var origAnimation = this.options.animation || true;
            if (this.isToolTipVisible) {
                this.$element.data('bs.tooltip').options.animation = false; // temporarily disable animation to avoid flickering of the tooltip
                this.$element.tooltip2('fixTitle') // call this method to update the title
                    .tooltip2('show');
                this.$element.data('bs.tooltip').options.animation = origAnimation;
            }
            else {
                this.$element.tooltip2('hide');
            }
        },

        dispose: function () {
            this.$element.tooltip2('destroy');
            this.parent();
        }
    });

    var HideableTooltip = new Class({
        Extends: BaseTooltip,
        $defaultTextContainer: null, $textWidth: null, elementWidth: null, maxTextWidth: null,
        initialize: function ($element, options) {
            this.handleTooltipTitle(options);
            this.parent($element, options);
        },

        init: function () {
            var _self = this;

            // Called on tooltip show event /mouseenter/
            this.$element.on('show.bs.tooltip', function (evt) {

                if (!_self.checkTooltipElement()) {
                    _self.isToolTipVisible = false;
                    evt.preventDefault();
                }
                else {
                    _self.isToolTipVisible = true;
                }
            });

            // Called on tooltip hide event /mouseleave/
            this.$element.on('hide.bs.tooltip', function () {
                _self.isToolTipVisible = false;
            });

            // ei bug prevent handlers - hide on focus (focus on appear), focus on click (input)
            if (DW.Utils.isIE) {
                this.$element.on('focus', function (e) {
                    _self.isToolTipVisible = false;
                    _self.$element.tooltip2('hide');
                });
                this.$element.on("click", function () {
                    _self.$element.focus();
                })
            }

            // if the container element is destroing dynamicly - add remove listen event handler
            if (this.options.destroyHandler) {
                this.$element.on("remove", function () {
                    _self.isToolTipVisible = false;
                    $(".tooltip").hide();
                })
            }

            // If the title is an observable, make it auto-updating.
            if (ko.isObservable(this.options.title)) {
                this.isToolTipVisible = false;
                this.addChangeHandler();
            }

            this.initOptionDetails();
        },

        handleTooltipTitle: function (options) {

            if (ko.isObservable(options.title) && options.title() === undefined && options.reserveValue !== undefined) {
                options.title = ko.observable(options.reserveValue);
            }
        },

        checkTooltipElement: function () {

            if (this.$element.is('input') && DW.Utils.isIE) {
                return this._compareInputInIE();
            }
            else {
                return this.$element.is(':truncated');
            }
        },

        addChangeHandler: function () {
            this.addDisposable(this.options.title.subscribe(function () {
                if (this.checkTooltipElement()) {
                    this.isToolTipVisible = true;
                    this.handleTooltipVisualization();
                }
            }, this));
        },

        _compareInputInIE: function () {

            this._updateTextContainer();
            this.$defaultTextContainer.text(this.$element.val());
            // TODO fix console.log(this.$element.filter('::-ms-clear')); ie clear input
            return this.$defaultTextContainer.width() > this.$element.width();
        },

        _updateTextContainer: function () {

            if (!this.$defaultTextContainer) {
                this.$defaultTextContainer = $('<div style="position: absolute; top: 0; left: 0; visibility: hidden"><div>');
                this.$textWidth = this.$defaultTextContainer.css('font-weight', this.$element.css("font-weight")).css('font-size', this.$element.css("font-size")).appendTo('body');
            }
            else {
                this.$defaultTextContainer.empty();
            }
        }
    });

    var ContainerTooltip = new Class({
        Extends: HideableTooltip,
        initialize: function ($element, options) {
            this.parent($element, options);
        },

        checkTooltipElement: function () {
            if (this.$element.find(':truncated').length == 0) {
                return false;
            }
            else {
                return true;
            }
        },

        handleTooltipTitle: function (options) {

            if (!options.title) {
                var title = '';
                options.titles.each(function (currentText) {
                    title += (currentText + ' ');
                });
                options.title = title.slice(0, -1);
            }
        }
    });

    var SelectTooltip = new Class({
        Extends: HideableTooltip,
        initialize: function ($element, options, selectArray) {
            this.selectArray = selectArray;
            this.parent($element, options);
            this._updateElements();
        },

        checkTooltipElement: function () {

            this._updateElements();
            if (this.maxTextWidth <= this.elementWidth) {
                this.isToolTipVisible = false;
            }
            else {
                this.isToolTipVisible = true;
            }
            return this.isToolTipVisible;
        },

        handleTooltipTitle: function (options) {

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
                    this.selectArray().forEach(function (element) {
                        if (element[options.optionsValueParam] === options.selectValue) {
                            options.title = ko.observable(element.displayName);
                        }
                    }.bind(this));
                }
            }
            else if (!options.title) {
                options.title = ko.observable(options.reserveValue);
            }
        },

        addChangeHandler: function () {
            var _self = this;
            this.$element.on('change', function (e) {
                _self.options.title(_self.$element.find(":selected").text());
                _self._updateElements();
                _self.isToolTipVisible = (_self.maxTextWidth <= _self.elementWidth) ? false : true;
                _self.handleTooltipVisualization();
            });
        },

        _updateElements: function () {
            this._updateTextContainer();
            this._updateElementsWidth();
        },

        _updateElementsWidth: function () {

            var selectPadding = (DW.Utils.isIE ? 24 : 26);

            this.$textWidth.text(this.$element.find(":selected").text());
            this.elementWidth = this.$element.width() - selectPadding;

            this.maxTextWidth = this.$textWidth.width();
        }
    });

})(jQuery, ko);