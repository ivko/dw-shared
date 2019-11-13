(function (factory) {
    if (typeof define === "function" && define.amd) {
        define(["jquery", "jquery-ui"], factory);
    } else {
        factory(jQuery);
    }
}(function ($) {
    $.widget('ui.popover', {
        options: {
            offset: 15,
            pluginClass: 'dw-popover',
            placement: 'top',
            position: {},
            container: false,
            trigger: 'hover',// click, hover, focus, manual
            cssClass: false,
            multi: false,
            arrow: true,
            title: '',
            content: '',
            closeable: false,
            show: 300,
            hide: 300,
            delay: 300,
            template: '<div>' +
                        '<div class="arrow"></div>' +
                        '<a href="#" class="close">x</a>' +
                        '<h3 class="title"></h3>' +
                        '<div class="content"></div>' +
                    '</div>'
        },
        _create: function () {
            //init the event handlers
            
            switch (this.options.trigger) {
                case 'click':
                    this._on({ 'click': 'toggle' });
                    break;

                case 'hover':
                    this._on({
                        'mouseenter': '_mouseenterHandler',
                        'mouseleave': '_mouseleaveHandler'
                    });
                    break;

                case 'focus':
                    this._on({
                        'focus': 'open',
                        'blur': 'close'
                    });
                    break;

                case 'manual':
                    break;
            }
            this._isOpen = false;
        },
        /* api methods and actions */
        destroy: function () {
            this.close();
            if (this.$popover) {
                this.$popover.remove();
            }
            this._super();
        },
        close: function (event) {

            this._isOpen = false;

            if (event) {
                event.preventDefault();
            }

            this._trigger('close');

            if (this.$popover) {
                this._hide(this.$popover, this.options.hide, function () {
                    this.$popover.detach();
                }.bind(this));
            }

            this._off(this.window, 'resize');
        },
        toggle: function (e) {
            if (e) { e.preventDefault(); }
            this[this.getPopover().is(':visible') ? 'close' : 'open']();
        },
        closeAll: function () {
            $('.' + this.options.pluginClass + ':visible').each(function (i, element) {
                var instance = $(element).data('popover-api');
                if (instance && instance !== this && instance.options.multi === false) {
                    instance.close();
                }
            }.bind(this));
        },
        /*core method ,show popover */
        open: function () {
            
            if (this._isOpen) {
                return;
            }
            this._isOpen = true;

            if (this.options.multi === false) {
                this.closeAll();
            }

            var $popover = this.getPopover()
                .removeClass()
                .addClass(this.options.pluginClass);

            this.setContent(this.getContent());
            this.setTitle(this.getTitle());

            if (this.options.closeable === false) {
                $popover.find('.close').off('click').remove();
            }
            //init the popover and insert into the document body
            if (this.options.arrow === false) {
                $popover.find('.arrow').remove();
            }

            // preapare the element to be able to measure the size of it
            $popover.css({ top: -1000, left: -1000, display: 'block' });
            
            // insert element into the page
            if (this.options.container) {
                $popover.appendTo(this.options.container);
            } else {
                $popover.insertAfter(this.element);
            }
            
            this._initTargetEvents();

            if (this.options.cssClass) {
                $popover.addClass(this.options.cssClass);
            }

            this.setPosition();

            $popover.hide();

            this._show($popover, this.options.show);
            
            this._trigger('open', null, { popover: $popover });

            this._on(this.window, { 'resize': this.close.bind(this) });
        },
        refresh: function () {
            this.setPosition.delay(0, this);
        },
        /*getter setters */
        getPopover: function () {
            if (!this.$popover) {
                this.$popover = $(this.options.template)
                    .data('popover-api', this);
            }
            return this.$popover;
        },
        getTitleElement: function () {
            return this.getPopover().find('>.title');
        },
        getContentElement: function () {
            return this.getPopover().find('>.content');
        },
        getTitle: function () {
            return this.options.title === false ? false : (this.options.title || this.element.attr('data-title') || this.element.attr('title'));
        },
        setTitle: function (title) {
            var $titleEl = this.getTitleElement();
            if (title) {
                $titleEl.html(title);
            } else {
                $titleEl.remove();
            }
        },
        getContent: function () {
            if ($.isFunction(this.options.content)) {
                return this.options.content.apply(this.element[0], arguments);
            } else {
                return this.options.content;
            }
        },
        setContent: function (content) {
            this.getContentElement().empty().append(content);
        },

        /* event handlers */
        _mouseenterHandler: function () {
            clearTimeout(this._timeout);
            if (!this.getPopover().is(':visible')) {
                this.open();
            }
        },
        _mouseleaveHandler: function () {
            //key point, set the _timeout  then use clearTimeout when mouse leave
            this._timeout = setTimeout(function () {
                this.close();
            }.bind(this), this.options.delay);
        },
        //reset and init the target events;
        _initTargetEvents: function () {

            this._off(this.$popover, 'mouseleave mouseenter');


            switch (this.options.trigger) {

                case 'hover':
                    this._on(this.$popover, {
                        'mouseenter': '_mouseenterHandler',
                        'mouseleave': '_mouseleaveHandler'
                    });
                    break;

                case 'click':
                case 'focus':
                case 'manual':
                    break;
            }

            this.$popover.find('.close').off('click').on('click', $.proxy(this.close, this));
        },
        /* utils methods */
        
        setPosition: function () {
            if (!this._isOpen) {
                return;
            }
            var $popover = this.getPopover(),
                placement;
            //if placement equals auto，caculate the placement by element information;
            if (typeof (this.options.placement) === 'function') {
                placement = this.options.placement.call(this, $popover.get(0), this.element.get(0));
            } else {
                placement = this.options.placement;
            }

            var offset = String(this.options.offset),
                _position = this._position.bind(this),
                _autoPosition = this._autoPosition.bind(this);

            var positions = {
                top: {
                    collision: 'fit none', my: 'center bottom', at: 'center top-' + offset, using: _position
                },
                bottom: {
                    collision: 'fit none', my: 'center top', at: 'center bottom+' + offset, using: _position
                },
                left: {
                    collision: 'none fit', my: 'right center', at: 'left-' + offset + ' center', using: _position
                },
                right: {
                    collision: 'none fit', my: 'left center', at: 'right+' + offset + ' center', using: _position
                },
                auto: {
                    collision: 'flipfit flip', my: 'center bottom', at: 'center top-' + offset, using: _autoPosition
                }
            };

            // position it
            $popover
                .addClass(placement)
                .position($.extend({ of: this.element }, positions[placement], this.options.position));
        },
        _autoPosition: function (props, data) {
            // find where is the arrow and add the right classname
            data.element.element
              .addClass(data.vertical == 'top' ? 'bottom' : 'top');

            this._position(props, data);
        },
        _position: function (props, data) {
            var $element = data.element.element;

            $element.css(props);

            // set position of the arrow
            var isVertical = data.element.top + data.element.height < data.target.top || data.element.top > data.target.top + data.target.height;

            var offset = isVertical ?
                    ((data.target.left + data.target.width / 2) - data.element.left) :
                    ((data.target.top + data.target.height / 2) - data.element.top);

            $element.find('.arrow')
                .css(isVertical ? 'left' : 'top', offset)
                .css(isVertical ? 'top' : 'left', '')
        },
    });

}));