$.widget("ui.dwDaggable", $.ui.draggable, {
    options: {
        zoom: false,
        viewport: false
    },
    _moveTimeoutId: null,
    _storage: null,
    _create: function () {

        if (this.options.viewport !== false) {
            this.addEvents({
                start: this._handleStart.bind(this),
                drag: this._handleDrag.bind(this),
                stop: this._handleStop.bind(this)
            });
        }

        this._super();
    },
    _getZoom: function () {
        return this.options.zoom === false ? 1 : this.options.zoom;
    },
    _mouseStart: function (event) {

        this._trigger("beforeStart", event, { instance: this });

        return this._super(event);
    },
    _handleStart: function (event, ui) {

        this._storage = {
            movement: {
                x: 0,
                y: 0
            },
            viewport: this.options.viewport(),
            event: event,
            ui: ui
        };
    },
    _handleDrag: function (event, ui) {
        clearTimeout(this._moveTimeoutId);

        var helper = {
            top: ui.position.top,
            right: ui.position.left + ui.helper.width(),
            bottom: ui.position.top + ui.helper.height(),
            left: ui.position.left
        };

        var movement = {
            x: event.clientX - this._storage.event.clientX,
            y: event.clientY - this._storage.event.clientY
        };

        var movementDirections = {
            top: movement.y < 0,
            right: movement.x > 0,
            bottom: movement.y > 0,
            left: movement.x < 0
        };

        for (var key in helper) {
            if (!movementDirections[key]) {
                delete movementDirections[key];
            };

            var boundaryIsReached = (key === 'top' || key === 'left') ? (helper[key] <= this._storage.viewport[key]) : (helper[key] >= this._storage.viewport[key]);
            if (boundaryIsReached) {
                this._moveTimeoutId = setTimeout(this._moveViewport.bind(this, key), 20);
                break;
            }
        }

        $.extend(this._storage, {
            movement: movement,
            event: event,
            ui: ui
        });
    },
    _handleStop: function (event, ui) {
        clearTimeout(this._moveTimeoutId);
    },
    _setContainment: function () {
        this._super();
        if (this.containment) {
            var zoom = this._getZoom();
            this.containment[2] *= zoom;
            this.containment[3] *= zoom;
        }
    },
    _moveViewport: function (direction) {

        clearTimeout(this._moveTimeoutId);
        var step = this.options.grid[0],
            zoom = this._getZoom(),
            offset;

        // if is negative 
        if (direction === 'left' || direction === 'top') {
            step *= -1;
        }

        // if is it is vertical movement
        if (direction === 'top' || direction === 'bottom') {
            offset = Math.max(0, Math.min(this._storage.viewport.scrollHeight - this._storage.viewport.height, this._storage.viewport.top + step));
            if (offset === this._storage.viewport.top) {
                return;
            }
            this._storage.viewport.top = offset;
            this._storage.viewport.bottom = offset + this._storage.viewport.height;
            this._storage.ui.position.top = Math.min(Math.max(this.containment[1], this._storage.ui.position.top + step), this.containment[3] / zoom);
        } else { // else it is horizontal
            offset = Math.max(0, Math.min(this._storage.viewport.scrollWidth - this._storage.viewport.width, this._storage.viewport.left + step));
            if (offset === this._storage.viewport.left) {
                return;
            }
            this._storage.viewport.left = offset;
            this._storage.viewport.right = offset + this._storage.viewport.width;
            this._storage.ui.position.left = Math.min(Math.max(this.containment[0], this._storage.ui.position.left + step), this.containment[2] / zoom);
        }

        // update draggable widget
        this.offset.parent = this._getParentOffset();

        this._trigger('moveViewport', null, { position: this._storage.ui.position, viewport: this._storage.viewport });

        // move element
        this._storage.ui.helper.css({
            top: this._storage.ui.position.top,
            left: this._storage.ui.position.left
        });

        // call again
        this._moveTimeoutId = setTimeout(this._moveViewport.bind(this, direction), 20);
    },

    destroy: function () {
        for (var key in this.options) {
            delete this.options[key];
        }

        this._super();
    },

    addEvents: function (eventHandlers) {
        var eventPrefix = this.widgetName.toLowerCase(),
            element = this.element,
            namespace = this.eventNamespace;

        for (var key in eventHandlers) {
            var eventName = eventPrefix + key + '.' + namespace;
            element.bind(eventName, eventHandlers[key]);
        }
    },

    removeEvents: function (eventNames) {
        var eventPrefix = this.widgetName.toLowerCase(),
            element = this.element,
            namespace = this.eventNamespace;

        eventNames.forEach(function (key) {
            var eventName = eventPrefix + key + '.' + namespace;
            element.unbind(eventName);
        });
    }
});

$.ui.plugin.add("dwDaggable", "zoom", {
    start: function (event, ui, instance) {
        ui.position.left = 0;
        ui.position.top = 0;
    },
    drag: function (event, ui, instance) {
        var zoom = instance._getZoom();
        // adjust new left and top by our zoom
        ui.position.left = Math.round(ui.position.left / zoom);
        ui.position.top = Math.round(ui.position.top / zoom);
    }
});
