(function (factory) {
    if (typeof define === "function" && define.amd) {
        define([
            "jquery",
            "knockout",
            "jquery-ui",
            "../utils"
        ], factory);
    } else {
        factory(jQuery, ko);
    }
}(function ($, ko) {
    ko.virtualElements.allowedBindings.position = true;
    ko.bindingHandlers.position = {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            // Options
            var options = $.extend({
                container: "#ContextMenuHolder",
                repositionOnScroll: false,
                positionAtElement: false,
                contextMenu: false,
                showAt: null,
                triggerSelector: null,
                isVisible: ko.observable(false),
                positionAt: "left bottom",
                positionMy: "left top",
                positionCollision: "fit fit",
                stopPropagation: true,
                template: null,
                element: element,
                focusElement: '.ui-menu',
                closeOnEscape: false,
                enabled: ko.observable(true),
                data: {}
            }, ko.utils.unwrapObservable(valueAccessor())),
            subscriptions = [];

            if ($.isFunction(options.container)) {
                options.container = options.container();
            }
            
            var template = DW.Utils.renderTemplate(options.template, bindingContext.createChildContext(options.data)),
                context = {
                    template: template,
                    options: options,
                    subscriptions: subscriptions
                };
            var bindinHandler = ko.bindingHandlers.position;

            for (var method in bindinHandler) {
                if (!$.isFunction(bindinHandler[method])) continue;
                context[method] = bindinHandler[method].bind(context);
            }

            $(options.container).prepend(template.hide());

            if (ko.isObservable(options.showAt)) {
                subscriptions.push(options.showAt.subscribe(function (target) {
                    if (!target) {
                        this.hide();
                    } else {
                        if (target.preventDefault) {
                            target.preventDefault();
                            if (this.options.stopPropagation) {
                                target.stopPropagation();
                            }
                        }
                        this.show.delay(0, this, [target]);
                    }
                }.bind(context)));
            } else if (element.nodeType === 8) {
                // In this case this is virtual binding! The only way to solve the problem is to use isVisible...
                // ?
            } else {
                var trigger = options.triggerSelector ? $(options.triggerSelector, element) : $(element);

                if (options.contextMenu) {
                    trigger.on('contextmenu', context.show);
                } else {
                    trigger.on('click', context.toggle);
                }
            }

            // add dispose callback so that we can dispose/close all necessary things
            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                // hide the element and dispose subscriptions
                this.hide();
                this.template.remove();
                DW.Utils.dispose(this.subscriptions);
                // clear context
                for (var key in this) {
                    delete this[key];
                }
            }.bind(context));
        },
        toggle: function (event) {
            if (this.template.is(':visible')) {
                this.hide();
            } else if (this.options.enabled.peek()) {
                this.show(event);
            }
        },
        templateKeydown: function (event) {
            if (event.keyCode == $.ui.keyCode.ESCAPE) {
                this.hide();
            }
        },
        show: function (target) {

            this._setPosition(target);

            if (this.options.closeOnEscape) {
                this.previousActiveElement = $(':focus');
                this.template.on('keydown.koposition', this.templateKeydown);
            }

            this.options.isVisible(true);

            if (this.options.focusElement) {
                (this.template.is(this.options.focusElement) ? this.template : this.template.find(this.options.focusElement))
                    .eq(0)
                    .focus();
            }

            // We want to attach it at the end of the current threat to prevent close from bubling
            $(document).on.delay(0, $(document), ['click.koposition', this.close]);
            $(window).on.delay(0, $(window), ['resize.koposition', this.close]);
            
            if (this.options.repositionOnScroll) {
                //using event capturing instead of bubbling to handle propagations stops
                window.addEventListener('scroll', this._handleScroll, true);
            }
        },
        hide: function () {
            if (this.previousActiveElement && this.previousActiveElement.is(':visible') && this.template.is(this.previousActiveElement) == false) {
                this.previousActiveElement.focus();
            }
            this.previousActiveElement = null;
            this.template.hide();

            $(document).off('click.koposition', this.close);
            $(window).off('resize.koposition', this.close);
            
            if (this.options.repositionOnScroll) {
                window.removeEventListener('scroll', this._handleScroll, true);
            }

            if (this.options.closeOnEscape) {
                this.template.off('keydown.koposition', this.templateKeydown);
            }

            this.options.isVisible(false);

            if (ko.isObservable(this.options.showAt) && this.options.showAt.peek()) {
                this.options.showAt(false);
            }
        },
        close: function () {
            if (ko.isObservable(this.options.showAt)) {
                this.options.showAt(false);
            } else {
                this.hide();
            }
        },

        _setPosition: function (target) {
            var position = {
                my: this.options.positionMy,
                at: this.options.positionAt,
                collision: this.options.positionCollision,
                of: target
            };

            if (this.options.positionAtElement) {
                position.of = this.options.triggerSelector ? $(this.options.triggerSelector, this.options.element) : $(this.options.element);
            }

            this.template
                .show()
                .position(position);
        },

        _handleScroll: function (event) {
            this._setPosition.delay(0, this, event);  
        }
    };

}));