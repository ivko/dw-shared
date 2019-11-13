(function ($) {
    $.widget("ui.sortable", $.ui.sortable, {
        _mouseStart: function (event, overrideHandle, noActivation) {

            var i, body,
                o = this.options;

            this.currentContainer = this;

            //We only need to call refreshPositions, because the refreshItems call has been moved to
            // mouseCapture
            this.refreshPositions();

            //Create and append the visible helper
            this.helper = this._createHelper(event);

            //Cache the helper size
            this._cacheHelperProportions();

            /*
             * - Position generation -
             * This block generates everything position related - it's the core of draggables.
             */

            //Cache the margins of the original element
            this._cacheMargins();

            //Get the next scrolling parent
            /* additional improvements by the Client team */
            if (o.scrollParent) {
                if ($.isFunction(o.scrollParent)) {
                    // the user may either pass function to find the element to scroll
                    this.scrollParent = o.scrollParent.call(null, this.helper);
                }
                else {
                    // ... or pass css selector, for which we search among the parents
                    this.scrollParent = this.helper.parents(o.scrollParent).eq(0);
                }
            }
            else {
                // if scroll parent is not defined by the user in any way, we use the jquery scrollParent function.
                // here we have additional improvement - we can specify to search for elements with overflow: hidden. 

                this.scrollParent = this.helper.scrollParent(o.scrollHidden);
            }
            /* END of additional improvements by the Client team */
            //The element's absolute position on the page minus margins
            this.offset = this.currentItem.offset();
            this.offset = {
                top: this.offset.top - this.margins.top,
                left: this.offset.left - this.margins.left
            };

            $.extend(this.offset, {
                click: { //Where the click happened, relative to the element
                    left: event.pageX - this.offset.left,
                    top: event.pageY - this.offset.top
                },
                parent: this._getParentOffset(),

                // This is a relative to absolute position minus the actual position calculation -
                // only used for relative positioned helper
                relative: this._getRelativeOffset()
            });

            // Only after we got the offset, we can change the helper's position to absolute
            // TODO: Still need to figure out a way to make relative sorting possible
            this.helper.css("position", "absolute");
            this.cssPosition = this.helper.css("position");

            //Generate the original position
            this.originalPosition = this._generatePosition(event);
            this.originalPageX = event.pageX;
            this.originalPageY = event.pageY;

            //Adjust the mouse offset relative to the helper if "cursorAt" is supplied
            (o.cursorAt && this._adjustOffsetFromHelper(o.cursorAt));

            //Cache the former DOM position
            this.domPosition = {
                prev: this.currentItem.prev()[0],
                parent: this.currentItem.parent()[0]
            };

            // If the helper is not the original, hide the original so it's not playing any role during
            // the drag, won't cause anything bad this way
            if (this.helper[0] !== this.currentItem[0]) {
                this.currentItem.hide();
            }

            //Create the placeholder
            this._createPlaceholder();

            //Set a containment if given in the options
            if (o.containment) {
                this._setContainment();
            }

            if (o.cursor && o.cursor !== "auto") { // cursor option
                body = this.document.find("body");

                // Support: IE
                this.storedCursor = body.css("cursor");
                body.css("cursor", o.cursor);

                this.storedStylesheet =
                    $("<style>*{ cursor: " + o.cursor + " !important; }</style>").appendTo(body);
            }

            if (o.opacity) { // opacity option
                if (this.helper.css("opacity")) {
                    this._storedOpacity = this.helper.css("opacity");
                }
                this.helper.css("opacity", o.opacity);
            }

            if (o.zIndex) { // zIndex option
                if (this.helper.css("zIndex")) {
                    this._storedZIndex = this.helper.css("zIndex");
                }
                this.helper.css("zIndex", o.zIndex);
            }

            //Prepare scrolling
            if (this.scrollParent[0] !== this.document[0] &&
                this.scrollParent[0].tagName !== "HTML") {
                this.overflowOffset = this.scrollParent.offset();
            }

            //Call callbacks
            this._trigger("start", event, this._uiHash());

            //Recache the helper size
            if (!this._preserveHelperProportions) {
                this._cacheHelperProportions();
            }

            //Post "activate" events to possible containers
            if (!noActivation) {
                for (i = this.containers.length - 1; i >= 0; i--) {
                    this.containers[i]._trigger("activate", event, this._uiHash(this));
                }
            }

            //Prepare possible droppables
            if ($.ui.ddmanager) {
                $.ui.ddmanager.current = this;
            }

            if ($.ui.ddmanager && !o.dropBehaviour) {
                $.ui.ddmanager.prepareOffsets(this, event);
            }

            this.dragging = true;

            this._addClass(this.helper, "ui-sortable-helper");

            // Execute the drag once - this causes the helper not to be visiblebefore getting its
            // correct position
            this._mouseDrag(event);
            return true;

        }
    });
})(jQuery);
