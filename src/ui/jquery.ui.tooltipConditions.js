(function (factory) {
    if (typeof define === "function" && define.amd) {
        define(["jquery", "knockout"], factory);
    } else {
        factory(jQuery, ko);
    }
}(function ($, ko) {

    var getSensor = function (element) { // element -> needed jQuery element
        $.ui.tooltip.$sensor = $.ui.tooltip.$sensor || $('<div class="ui-tooltip-sensor"><div>').appendTo('body');

        var $sensor = $.ui.tooltip.$sensor,
            styleProps = [
                'font-family', 'font-kerning', 'font-size',
                'font-style', 'font-weight', 'text-transform',
                'padding-left', 'padding-right'
            ];
        for (var i = 0; i < styleProps.length; i++) {
            $sensor.css(styleProps[i], element.css(styleProps[i]));
        }

        return $sensor;
    };

    // always escape html content to prevent hacks
    var escapeHtmlContent = function (content) {
        var isFunction = typeof content == 'function';
        return DW.Utils.htmlEncode(isFunction ? content() : content);
    };

    var isTargetTruncated = function (target) {
        return $(target).is(':truncated') || $(target).find(':truncated').length > 0;
    };

    // each conditions must return { content: 'string' | ko.observable('string),
    //                               show: ko.observable(false),
    //                               init: () => { attach events },
    //                               dispose: () => { detach events }
    //                             }
    $.extend(window.ns('TooltipConditions'), {

        default: function (element, content) {
            var show = ko.observable(false),
                $element = $(element);

            return {
                content: function () {
                    return escapeHtmlContent(content);
                },
                show: show,
                init: function () {
                    $element.on({
                        "mouseover.tooltip": function () {
                            show(true);
                        }
                    });
                    $element.on({
                        "mouseout.tooltip": function () {
                            show(false);
                        }
                    });
                },
                dispose: function () {
                    $element.off(".tooltip");
                }
            };
        },

        // if context is truncated show tooltip
        // tip: 'default' condition has this behaviour to show tooltip when value is truncated
        truncated: function (element, content) {
            var show = ko.observable(false),
                $element = $(element);

            return {
                content: function () {
                    return escapeHtmlContent(content);
                },
                show: show,
                init: function () {
                    $element.on({
                        'focusin mouseover keydown': function (event) {
                            show(isTargetTruncated(event.currentTarget));
                        }
                    });

                    $element.on({
                        "focusout mouseout": function () {
                            show(false);
                        }
                    });
                },
                dispose: function () {
                    $element.off(".tooltip");
                }
            };
        },

        validateNumeric: function (element, content) {
            var show = ko.observable(false),
                $element = $(element);

            return {
                content: function () {
                    return escapeHtmlContent(content);
                },
                show: show,
                init: function () {
                    $element.on({
                        "validatenumeric.tooltip": function (event, ui) {
                            if (ui.state === false) {
                                show(true);
                            } else {
                                show(false);
                            }
                        },
                    });
                },
                dispose: function () {
                    $element.off(".tooltip")
                }
            }
        },

        selectElement: function (element) {
            var show = ko.observable(false),
                $element = $(element),
                content = function () {
                    return $element.find("option:selected").text();
                },
                $sensor = getSensor($element);

            return {
                content: function () {
                    return escapeHtmlContent(content);
                },
                show: show,
                init: function () {
                    $element.on({
                        "mouseover.tooltip": function () {
                            var elementWidth = $element.width() - 26; // Approximate width of the select-box arrow down.

                            $sensor.text($element.find(":selected").text());

                            if ($sensor.width() > elementWidth) {
                                show(true);
                            } else {
                                show(false);
                            }
                        }
                    });

                    $element.on({
                        "mouseout.tooltip": function () {
                            show(false);
                        }
                    });
                },
                dispose: function () {
                    $element.off(".tooltip");
                }
            }

        },

        // type of arg: { isOpen: ko.observable(), content: string }
        // we make subscription for the observable isOpen, when its value become true -> tooltip is shown
        subscription: function (element, args) {
            var show = ko.observable(false),
                $element = element,
                subscription = null;

            return {
                content: function () {
                    return escapeHtmlContent(args.content);
                },
                show: show,
                init: function () {
                    subscription = args.isOpen.subscribe(function (newValue) {
                        show(newValue);
                    });
                },
                dispose: function () {
                    subscription.dispose();
                }
            }
        },

        templateContent: function (element, arg) {
            var show = ko.observable(false),
                $element = $(element),
                contentHTML = '';

            if (arg.viewModel) {
                var contentTemp = DW.Utils.renderTemplate(arg.templateName, arg.viewModel);
                contentHTML = $('<div>').append(contentTemp).html();
                contentTemp.remove();
            }

            return {
                content: function () {
                    return contentHTML;
                },
                show: show,
                init: function () {
                    $element.on({
                        "mouseover.tooltip": function () {
                            show(true);
                        }
                    });
                    $element.on({
                        "mouseout.tooltip": function () {
                            show(false);
                        }
                    });
                },
                dispose: function () {
                    $element.off(".tooltip");
                }
            }

        },

        htmlContent: function (element, content) {
            var show = ko.observable(false),
                $element = $(element);

            return {
                content: content,
                show: show,
                init: function () {
                    $element.on({
                        "mouseover.tooltip": function () {
                            show(true);
                        }
                    });
                    $element.on({
                        "mouseout.tooltip": function () {
                            show(false);
                        }
                    });
                },
                dispose: function () {
                    $element.off(".tooltip");
                }
            }
        },

        // type of arg: { disabledExValue: ko.observable(), content: string }
        disabledElement: function (element, args) {
            var show = ko.observable(false),
                $element = $(element);
            subscription = args.disabledExValue.subscribe(function (newval) {
                if (!newval) {
                    $element.tooltip('close');
                }
            })

            return {
                content: function () {
                    return escapeHtmlContent(args.content);
                },
                show: show,
                init: function () {
                    $element.on({
                        "mouseover.tooltip": function () {
                            if (args.disabledExValue()) {
                                show(true);
                            } else {
                                show(false);
                            }
                        }
                    });
                    $element.on({
                        "mouseout.tooltip": function () {
                            show(false);
                        }
                    });
                },
                dispose: function () {
                    $element.off(".tooltip");
                    subscription.dispose();
                }
            }

        },

        // type of arg: { showTooltip: ko.observable(), content: string }
        autoCompleteHint: function (element, args) {
            var $element = $(element);

            var isOpen = ko.computed({
                read: function () {
                    return args.showTooltip();
                },
                write: function (value) { } // one way binding
            }).extend({ notify: 'always' });

            return {
                content: function () {
                    return escapeHtmlContent(args.content);
                },
                show: isOpen,
                init: function () {
                    // Ignore - tooltip is open/closed based on observable only
                    $element.on({
                        "mouseout mousein focusout ": function (event) {
                            event.stopImmediatePropagation();
                            return false;
                        }
                    });
                },
                dispose: function () {
                    $element.off(".tooltip");
                    isOpen.dispose();
                }
            }
        },

        //show based off of observable value, don't hide tooltip on click, show again on focusin
        fieldValidation: function (element, args) {
            var show = ko.observable(false),
                $element = $(element),
                subscription = null;

            return {
                content: function () {
                    return escapeHtmlContent(args.content);
                },
                show: show,
                init: function () {
                    subscription = args.isOpen.subscribe(function (newValue) {
                        show(newValue);
                    });
                    $element.off("click");
                    $element.on({
                        "focusin": function (event) {
                            if (args.isOpen() && !show())
                                show(true);
                        }
                    });
                },
                dispose: function () {
                    subscription.dispose();
                }
            }
        }
    });
}));