(function (factory) {
    if (typeof define === "function" && define.amd) {
        define(["jquery", "spin", "jquery-ui"], factory);
    } else {
        factory(jQuery, Spinner);
    }
}(function ($, Spinner) {
    $.widget('ui.dwActivity', {
        position: 'static', // static, absolute, fixed ??
        overlay: null,
        container: null,
        spinner: null,
        spinnerOptions: {
            lines: true,
            length: true,
            width: true,
            radius: true,
            corners: true,
            rotate: true,
            direction: true,
            color: true,
            speed: true,
            trail: true,
            shadow: true,
            hwaccel: true,
            className: true,
            zIndex: true,
            top: true,
            left: true,
            /*
            segments: true,
            space: true,
            length: true,
            width: true,
            speed: true,
            align: true,
            valign: true,
            padding: true,
            outside: false,
            color: true,
            opacity: true*/
        },

        options: {
            active: false,
            message: null,
            messagePosition: 'bottom', //'bottom','top','left','right'
            messageWrap: 'nowrap', //normal, pre, pre-line, pre-wrap
            messageTop: undefined,
            messageLeft: '0px',
            modal: true,
            appendTo: 'body',

            spinning: true,//Whether spinner has to be shown
            lines: 10, // The number of lines to draw
            length: 5, // The length of each line
            width: 5, // The line thickness
            radius: 10, // The radius of the inner circle
            corners: 1, // Corner roundness (0..1)
            rotate: 0, // The rotation offset
            direction: 1, // 1: clockwise, -1: counterclockwise
            color: '#0089cf', // #rgb or #rrggbb or array of colors
            speed: 1, // Rounds per second
            trail: 30, // Afterglow percentage
            shadow: false, // Whether to render a shadow
            hwaccel: false, // Whether to use hardware acceleration
            className: 'spinner', // The CSS class to assign to the spinner
            zIndex: 2e9, // The z-index (defaults to 2000000000)
            top: '50%', // Top position relative to parent
            left: '50%' // Left position relative to parent



            /*
            segments: 12, //Math.max(10, 10 + (length - 5)),
            space: 3,
            length: 7,
            width: 4,
            speed: 1.2,
            align: 'center',
            valign: 'center',
            padding: 4,
            outside: false,
            color: '#176fac',
            opacity: 0.3*/
        },
        _create: function () {
            //console.log('_create');
            //if is ['button, input, a']
            //if overlay
            //if is body
        },

        _setOptions: function (options) {
            var self = this,
                updateSpinner = false,
                spinnerOptions = {};

            $.each(options, function (key, value) {
                if (key in self.spinnerOptions && self.spinnerOptions[key] !== value) {
                    updateSpinner = true;
                }
            });

            this._super(options);

            // if updateSpinner ..
        },
        _setOption: function (key, value) {

            var option = this.options[key];

            this._super(key, value);
            //console.log('setOption', key, value, option);
            // return if there is no changes
            if (value === option) return;

            // if ...
            if (key === "message") {
                // update text
                this._initMessage(value);
            }
            //console.log('setOption', key, value);
            if (key === "active") {
                //console.log('active', value);
                // activate
                value ? this.start() : this.stop();
            }
        },

        _init: function () {
            if (this.options.active) {
                this.start();
            }
        },

        _appendTo: function () {
            var element = this.options.appendTo;

            if (element && (element.jquery || element.nodeType)) {
                return $(element);
            }
            return this.element;
        },

        _getSpinnerOptions: function () {
            var options = {};
            for (var key in this.spinnerOptions) {
                if (key in this.options) {
                    options[key] = this.options[key];
                }
            }

            return options;
        },
        _getSpinnerSize: function () {
            return this.options.width + this.options.radius;
        },
        _getMessageStyles: function () {
            var styles = {},
                messagePositions = {
                    left: 'left',
                    top: 'bottom',
                    bottom: 'top',
                    right: 'right'
                };
            if (this.options.messageTop) {
                styles.top = this.options.messageTop;
            }
            if (this.options.messageLeft) {
                styles.left = this.options.messageLeft;
            }
            if (this.options.messagePosition in messagePositions) {
                var property = messagePositions[this.options.messagePosition],
                    style = styles[property] || 0;
                styles[property] = style + this._getSpinnerSize();
            }
            return styles;
        },
        _initMessage: function () {
            if (this.message == null) {
                this.message = $("<div>")
                    .appendTo(this.container);
            }
            this.message.removeAttr('class')
                .addClass("ui-activity-message")
                .addClass(this.options.messagePosition)
                .css("white-space", this.options.messageWrap)
                .css(this._getMessageStyles());
        },
        _destroyOverlay: function () {
            if (this.overlay) {
                this.overlay.remove();
                this.overlay = null;
            }
        },
        _destroyMessage: function () {
            if (this.message) {
                this.message.remove();
                this.message = null;
            }
        },


        _destroy: function () {
            this._destroyOverlay();
            this._destroyMessage();
            this._destroyOverlay();
        },

        start: function () {
            this.stop();
            // init container
            if (this.container == null) {
                this.container = $("<div>")
                    .addClass('ui-activity-container')
                    .appendTo(this._appendTo());
            }

            // init overlay
            if (this.options.modal && this.overlay == null) {
                this.overlay = $("<div>")
                    .addClass("ui-activity-overlay")
                    .appendTo(this._appendTo());
                //disable keyboard default action when we have ui-activity-overlay
                $(document).on('keydown', this._keydownHandler);
            }

            // init message
            if (this.options.message) {
                this._initMessage();
            } else if (this.message) {
                this._destroyMessage();
            }

            this._setMessage(this.options.message);

            if (this.spinner) {
                this.spinner.stop();
                this.spinner = null;
            }

            if (this.options.spinning) {
                this.spinner = new Spinner(this._getSpinnerOptions());
                this.spinner.spin(this.container.get(0));
            }

        },

        _keydownHandler: function (e) {
            //9 - Tab key
            if (e.keyCode == 9) {
                e.preventDefault();
            }
        },

        _setMessage: function (message) {
            if (this.message) {
                this.message.html(message);
            }
        },
        stop: function () {
            if (this.spinner) {
                this.spinner.stop();
                this.spinner = undefined;
            }

            this._destroyOverlay();
            this._destroyMessage();
            //enable keyboard default action
            $(document).off('keydown', this._keydownHandler);
        },

        update: function () {
            if (this.spinner == null) {
                return;
            }
            this._setMessage(this.options.message);
            //console.log('update');
            // reposition if is running
        }
    });

}));