(function (factory) {
    if (typeof define === "function" && define.amd) {
        define(["jquery", "jquery-ui"], factory);
    } else {
        factory(jQuery);
    }
}(function ($) {

    $.widget("ui.tooltip", $.ui.tooltip, {
        options: {
            items: '[ui-role=tooltip]',
            delay: 420,
            show: {
                delay: 0,
                duration: 350
            },
            placement: 'auto', // top, bottom, left, right, center, auto
            tooltipClass: '',
            // new options
            offset: 8
        },
        _setPlacement: function (placement) {
            var offset = String(this.options.offset),
                tooltipClass = this.options.tooltipClass || '',
                _position = this._position.bind(this),
                _autoPosition = this._autoPosition.bind(this);

            if (offset.match(/[\+|\-]/) === null) {
                // if there is no sign on passed option we want to add negative sign for top and left and positive for others
                offset = (['center', 'bottom', 'right'].contains(placement) ? "+" : "-") + offset
            }

            var positions = {
                center: {
                    collision: 'none', my: 'center top', at: 'center center' + offset, using: _position
                },
                top: {
                    collision: 'fit none', my: 'center bottom', at: 'center top' + offset, using: _position
                },
                bottom: {
                    collision: 'fit none', my: 'center top', at: 'center bottom' + offset, using: _position
                },
                left: {
                    collision: 'none fit', my: 'right center', at: 'left' + offset + ' center', using: _position
                },
                right: {
                    collision: 'none fit', my: 'left center', at: 'right' + offset + ' center', using: _position
                },
                auto: {
                    collision: 'flipfit flip', my: 'center bottom', at: 'center top' + offset, using: _autoPosition
                }
            };
            if (tooltipClass != '') {
                for (var position in positions) {
                    tooltipClass = tooltipClass.replace(position, '');
                }

                tooltipClass = tooltipClass.trim() + ' ' + placement;
            } else {
                tooltipClass = placement;
            }

            this._setOption('tooltipClass', tooltipClass);
            this._setOption('position', positions[placement]);
        },
        _autoPosition: function (props, data) {
            // find where is the arrow and add the right classname
            data.element.element
                .removeClass('auto')
                .addClass(data.vertical == 'top' ? 'bottom' : 'top');

            this._position(props, data);
        },
        _position: function (props, data) {
            var $tip = data.element.element;

            $tip.css(props);

            // set position of the arrow
            var isHorizontal =
                data.element.left + data.element.width < data.target.left
                || data.target.left + data.target.width < data.element.left;

            var offset = isHorizontal ?
                ((data.target.top + data.target.height / 2) - data.element.top) :
                ((data.target.left + data.target.width / 2) - data.element.left)

            $tip.find('.ui-tooltip-arrow')
                .css(isHorizontal ? 'top' : 'left', offset)
                .css(isHorizontal ? 'left' : 'top', '');
        },
        _setOption: function (key, value) {
            if (key === 'placement') {
                this._setPlacement(value)
            }

            this._super(key, value);
        },
        _tooltip: function (element) {
            var data = this._super(element);

            data.tooltip.prepend('<div class="ui-tooltip-arrow"></div>');

            return data;
        },
        _create: function () {
            this._setPlacement(this.options.placement);

            // mark it
            this.element.attr('ui-role', 'tooltip');

            // hide tooltip when someone clicks on the element
            this._on({ 'click': 'close' });

            // call constructor
            this._super();

            this._setSharedLiveRegion();

            this._removeHandlers();
        },
        open: function (event) {
            if (!this._isDestroyed) {
                this._timeoutId = this._super.delay(this.options.delay, this, [event]);
            }
        },
        _open: function (event, target, content) {
            if (this.options.disabled) {
                return;
            }
            this._super(event, target, content);
        },
        _clearTimeout: function () {
            clearTimeout(this._timeoutId);
        },
        close: function (event) {
            this._clearTimeout();
            this._super(event);
        },
        _setSharedLiveRegion: function () {
            if (!$.ui.tooltip.liveRegion) {
                $.ui.tooltip.liveRegion = this.liveRegion.clone()
                    .appendTo(this.document[0].body);
            }
            this._origLiveRegion = this.liveRegion.detach();
            this.liveRegion = $.ui.tooltip.liveRegion;
        },
        _destroy: function () {
            this.close();
            this._isDestroyed = true;
            this.liveRegion = this._origLiveRegion;
            this._super();
        },

        // detach events from jquery tooltip widget implementation
        _removeHandlers: function () {
            this._off(this.element, "mouseover");
            this._off(this.element, "focusin");
        }
    });
}));