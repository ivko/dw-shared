(function (factory) {
    if (typeof define === "function" && define.amd) {
        define(["jquery", "jquery-ui", "../../dwScrollbar/js/jquery.ui.dwScrollbar"], factory);
    } else {
        factory(jQuery);
    }
}(function ($) {

    $.widget("ui.dialog", $.ui.dialog, {

        // ----- auto size width & height
        //   based on https://github.com/jasonday/jQuery-UI-Dialog-extended
        //   
        //   DESCRIPTION:
        //   
        //   - Resizes dialogs based on window size. To turn this on use: options.autoResizable = true;
        //     The dialog will be resized if the window goes below the dialog's default width and height.
        //     Resizing of the width is done based on the scaleW factor( options.scaleW)
        //     Resizing of the height is done based on options.positionTopOffset
        //
        //   - options.slippery applies slippery transition effect. This is available only for dialogs
        //     with options.autoResizable set to 'true'
        //   
        //   - options.minWidht and options.minHeight are taken into account when calculating the new dialog's size.
        //     If these options are present the dialog size would not go below these values.
        //     Please note that the default dialog widget has already set values for minHeight=480 and minWidth=600.
        //   
        //   - scrollable adds dwScrollbar to the dialog widget
        //
        //   - clickOut turns on/off the feature to close the dialog on clicking outside the dialog's area.

        options: {
            showTitleBar: true,
            showCloseButton: true,
            autoResizable: false,            //turns on/off responsive behavior
            autoResizablePullChanges: false, //if this option is set to 'true' IE* will crash if there is an iframe inside
            slippery: true,                  //add transition animation
            scaleW: 0.9,                     //width scale factor (scale factors are used for calculation of the dialog dimensions based on window dimensions)
            positionTopOffset: 25,           //position the dialog "positionTopOffset" amount of pixels from the top of window
            scrollable: false,               //add scrollbar to the dialog widget
            clickOut: false                  //close the dialog on clickout
        },

        originalHeight: false,               //collect original height from options.
        originalMaxHeight: false,            //collect original maxHeight from options.

        // Allow select2 on UI Dialog wich need interactions
        _allowInteraction: function (event) {
            return !!($(event.target).is(".ui-menu, .select2-input, .select2-drop") || $(event.target).closest(".toast-container").length) || this._super(event);
        },
        // The dialog automatically closes when I press enter under IE9 or IE10.
        _createTitlebar: function () {
            this._super();
            this.uiDialogTitlebarClose.attr('type', 'button');
        },

        autoSize: function () {
            if (!$(this.element).is(":visible")) {
                return;
            }

            // get dialog original size on open
            var isTouch = $("html").hasClass("touch");

            // check if autoResizable
            // dependent on modernizr for device detection / html.touch
            if (this.options.autoResizable === true || (this.options.autoResizable === "touch" && isTouch)) {
                var elem = this.element,
                    wHeight = $(window).height(),
                    wWidth = $(window).width(),
                    dHeight = elem.parent().outerHeight(),
                    dWidth = elem.parent().outerWidth(),
                    dialogOptions = {},

                    setHeight = (dHeight > wHeight)
                                   ? Math.floor(wHeight - this.options.positionTopOffset)
                                   : this.originalHeight,

                    setMaxHeight = ((this.originalMaxHeight + this.options.positionTopOffset > wHeight) || (dHeight > wHeight))
                                   ? Math.floor(wHeight - this.options.positionTopOffset)
                                   : this.originalMaxHeight,

                    setWidth = (dWidth > wWidth) ? Math.floor(wWidth * this.options.scaleW) : this.originalWidth;

                //take min values into account
                if (setMaxHeight < this.options.minHeight) setMaxHeight = this.options.minHeight;
                if (setWidth < this.options.minWidth) setWidth = this.options.minWidth;

                this._setOptions({
                    'maxHeight': setMaxHeight,
                    'height': setHeight,
                    'width': setWidth
                });

                //get new dialog height
                dHeight = elem.parent().outerHeight();

                //get new dialog width
                dWidth = elem.parent().outerWidth();

                //update options
                if (dHeight > wHeight) dialogOptions['height'] = Math.floor(wHeight - this.options.positionTopOffset);
                if (dWidth > wWidth) dialogOptions['width'] = Math.floor(wWidth * this.options.scaleW);
                if (this.options.positionTopOffset >= 0) {
                    dialogOptions['position'] = { my: "top", at: "top+" + this.options.positionTopOffset, of: window };
                }
                this._setOptions(dialogOptions);

                //update dialog's scrollbar
                if (this.options.scrollable) {
                    elem.dwScrollbar("update");
                }

                // add webkit scrolling to all dialogs for touch devices
                if (isTouch) {
                    elem.css("-webkit-overflow-scrolling", "touch");
                }

                this._trigger('autoSize', null, {
                    'maxHeight': setMaxHeight,
                    'height': setHeight,
                    'width': setWidth,
                    'element': elem
                });
                
                if (!this.options.modal && this.originalHeight === 'auto') {
                    // workaround: additional refresh for non-modal dialogs:
                    // in case of dialog downsizing the height is erroneosly set on first resize-event
                    // leaving a grey area at the bottom of the dialog
                    var self = this;
                    setTimeout(function () {
                        self._setOptions({
                            'maxHeight': setMaxHeight,
                            'height': 'auto',
                            'width': setWidth
                        });
                    }, 0);
                }
            }
        },
        _onDragStart: function (event, ui) {
            this.element.closest(".ui-dialog").toggleClass('slippery');
        },
        _onDragStop: function () {
            this.element.closest(".ui-dialog").toggleClass('slippery');
            $(this.element).dialog('option', 'height', this.originalHeight); // dialog has variable height => after drag, height is reset
        },
        open: function () {

            // apply original arguments
            this._superApply(arguments);

            //add scrollbar
            if (this.options.scrollable) {
                this.element.dwScrollbar({
                    theme: 'scroll-theme-light',
                    horizontalScrolling: true
                });
            }

            if (this.options.autoResizable === true) {

                this.originalHeight = this.originalHeight || this.options.height;
                this.originalMaxHeight = this.originalMaxHeight || this.options.maxHeight;
                this.originalWidth = this.options.width;
                
                if (this.options.positionTopOffset >= 0) {
                    this._setOption('position', { my: "top", at: "top+" + this.options.positionTopOffset, of: window });
                }

                //apply transition slippery styling
                if (this.options.slippery) {
                    this._setOption('dialogClass', this.options.dialogClass + ' slippery');

                    this._on({ "dialogdragstart": "_onDragStart" });
                    this._on({ "dialogdragstop": "_onDragStop" });
                }

                //initial resize on open
                this.autoSize();

                if (this.options.autoResizablePullChanges) {
                    this._listenDomChangeStart();
                }
            }

            // resize on window resize and orientation change (used for Debug purposes, uncomment to get immediate resize)
            //this._on(window, {
            //    "orientationchange": 'autoSize',
            //    "resize": 'autoSize'
            //});

            // hide titlebar
            if (!this.options.showTitleBar) {
                this.uiDialogTitlebar.css({
                    "height": 0,
                    "padding": 0,
                    "background": "none",
                    "border": 0
                });
                this.uiDialogTitlebar.find(".ui-dialog-title").css("display", "none");
            }

            if (!this.options.showCloseButton) {
                //hide close button
                this.uiDialogTitlebar.find(".ui-dialog-titlebar-close").css("display", "none");
            } else {
                // remove auto-focus from the close-button
                this.uiDialogTitlebar.find(".ui-dialog-titlebar-close").blur();
            }
            
            // close on clickOut
            if (this.options.modal && this.options.clickOut) {
                this.overlay.click(function (e) {
                    this.close();
                }.bind(this));
            }
        },
        updatePosition: function () {
            this.autoSize();
            this._setOption('position', this.options.position);

            var SECONDS_FORMATTER = 1000;
            var WAITER = 0.1; // IE and Chrome orks correctly without it. But FF neads this more time.
            var delay = parseFloat(this.uiDialog.css('transition-duration')) ?
                parseFloat(this.uiDialog.css('transition-duration')) + WAITER : 0;
            delay *= SECONDS_FORMATTER;

            setTimeout(function () {
                this._trigger('updatePosition', null, { dialog: this.element });
            }.bind(this), delay);
        },
        _listenDomChangeStart: function () {
            DW.Utils.registerObserveDomElement(this.element);
            this.element.on('dw.domchange', (function (e, result) {
                clearTimeout(this.timeOutId);
                this.timeOutId = setTimeout(function () {
                    if (this.element.is(':ui-dialog')) {
                        this._position();
                    }
                }.bind(this), 500)
            }).bind(this));
        },
        _listenDomChangeStop: function () {
            DW.Utils.disconnectObserveDomElement(this.element);
        },
        close: function () {
            if (this.options.scrollable && this.element.is('.dwScrollbar')) {
                this.element.dwScrollbar('destroy');
            }
            if (this.options.slippery && this.options.autoSize) {
                this._off(this.element, "dialogdragstart");
                this._off(this.element, "dialogdragstop");
            }
            if (this.options.autoResizablePullChanges) {
                //disconnect
                this._listenDomChangeStop();
            }

            // apply original arguments
            this._superApply(arguments);
        }
    });
}));