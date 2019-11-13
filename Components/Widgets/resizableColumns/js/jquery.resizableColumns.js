/* jQuery Resizable Columns v0.1.0 | http://dobtco.github.io/jquery-resizable-columns/ | Licensed MIT | Built Fri Dec 05 2014 22:21:04 */
var __bind = function (fn, me) { return function () { return fn.apply(me, arguments); }; },
    __slice = [].slice;

(function ($, window) {
    var ResizableColumns, parseWidth, pointerX, setWidth;
    parseWidth = function (node) {
        return DW.Utils.styleToValue(node.style.width);
    };
    setWidth = function (node, width) {
        return node.style.width = width > 0 ? width + 'px' : 0;
    };
    pointerX = function (e) {
        if (e.type.indexOf('touch') === 0) {
            return (e.originalEvent.touches[0] || e.originalEvent.changedTouches[0]).pageX;
        }
        return e.pageX;
    };
    ResizableColumns = (function () {
        ResizableColumns.prototype.defaults = {
            store: window.store,
            resizeFromBody: false,
            maxWidth: null,
            minWidth: null,
            resizeMode: 'fit',//fit or overflow
            initialWidth: undefined,
            $resizableTableContainer: undefined,
            $table: undefined,
            columns: undefined,

            //DEPRECATED
            selector: 'thead > tr > th:visible'
        };

        ResizableColumns.prototype.RESIZABLE_CURSOR_CLASS = 'resizing';

        function ResizableColumns($columnsContainer, options) {
            this.pointerdown = __bind(this.pointerdown, this);
            this.constrainWidth = __bind(this.constrainWidth, this);
            this.options = $.extend({}, this.defaults, options);
            this.$columnsContainer = $columnsContainer;
            this.timeoutIds = [];

            //fallback
            this.columns = this.options.columns || DWTS.BindingHandlers.Table.Columns.create({
                elementAccessors: {
                    getHeaderCells: function () {
                        return this.$columnsContainer.find(this.options.selector);
                    }.bind(this)
                }
            });

            if (this.options.resizeMode === "overflow") {
                this.$iframe = null;
                this.availableWidth = 0;
                this.resizeColumns = this.overflowRezize;
                this.restoreColumnWidths();
                this.initOverflowResizeMode();
            } else {
                this.resizeColumns = this.fitRezize;
                this.restoreColumnWidths();
            }

            $(window).on('resize.rc', this.syncHandlePositions.bind(this));

            //TODO: delete, provision of an event is enough
            if (this.options.start) {
                this.$columnsContainer.bind('column:resize:start.rc', this.options.start);
            }
            if (this.options.resize) {
                this.$columnsContainer.bind('column:resize.rc', this.options.resize);
            }
            if (this.options.stop) {
                this.$columnsContainer.bind('column:resize:stop.rc', this.options.stop);
            }
        }

        ResizableColumns.prototype.layoutReady = function () {
            var deferred = $.Deferred(),
                timeoutIndex = this.timeoutIds.length,
                timeoutId = setTimeout(function () {
                    this.timeoutIds = this.timeoutIds.splice(timeoutIndex, 1);
                    deferred.resolve();
                }.bind(this));
            this.timeoutIds[timeoutIndex] = timeoutId;

            return DW.When(deferred.promise());
        };

        ResizableColumns.prototype.initOverflowResizeMode = function () {
            var lastHeaderInfo = this.getLastHeaderInfo();

            this.createIframe()
                .done(function ($iframe) {
                    this.setAvailableWidth();
                    this.columns.setContainersWidth(this.totalColumnWidths(), this.availableWidth);
                    this.refresh();

                    if ($iframe.width() > this.$columnsContainer.width()) {
                        this.updateOverflowView(lastHeaderInfo);
                    }

                    $($iframe[0].contentWindow).on('resize.rc', function () {
                        this.setAvailableWidth();
                        this.updateOverflowView(lastHeaderInfo);
                    }.bind(this));
                }.bind(this));
        };

        ResizableColumns.prototype.setAvailableWidth = function () {
            // This is the possible entry point for non-integer numbers.
            // We require that no such numbers are used throughout calculations,
            // because loss of accuracy is very likely to occur. If we desire 
            // to work with such numbers, we should use the BigNumber library 
            // during almost all calculations, which is a laborous task which, 
            // after it is completed, will leave us with code, not only diminished 
            // in performance but also hard to read, maintain and scale.

            this.availableWidth = this.getIntegerWidth(this.$iframe);
        };

        ResizableColumns.prototype.getIntegerWidth = function ($element) {
            return Math.floor($element.width());
        };

        ResizableColumns.prototype.updateOverflowView = function (lastHeaderInfo) {
            var lastHeaderCurrentWidth = lastHeaderInfo.$header.width(),
                currentTableWidth = this.$columnsContainer.width(),
                minimumTableWidth = currentTableWidth - lastHeaderCurrentWidth + lastHeaderInfo.minWidth,
                isTableShownPartially = this.availableWidth < minimumTableWidth,
                newLastHeaderWidth =
                    isTableShownPartially ?
                        lastHeaderInfo.minWidth :
                        lastHeaderCurrentWidth + (this.availableWidth - currentTableWidth);

            if (newLastHeaderWidth !== lastHeaderCurrentWidth) {
                var newHeaderWidths = {};
                newHeaderWidths[lastHeaderInfo.index] = newLastHeaderWidth;
                this.columns.setWidths(newHeaderWidths);
                //this.$columnsContainer.trigger($.Event('column:set'), [newHeaderWidths]);

                var newTableWidth = isTableShownPartially ? minimumTableWidth : this.availableWidth;
                this.columns.setContainersWidth(newTableWidth, this.availableWidth);
            } else {
                this.columns.updateFooterWidth(this.availableWidth);
            }
        };

        ResizableColumns.prototype.createIframe = function () {
            this.$iframe = $(document.createElement('iframe'));
            this.$iframe.attr('tabindex', -1);
            this.$iframe.css({
                'height': '0px',
                'background-color': 'transparent',
                'margin': 0,
                'padding': 0,
                'overflow': 'hidden',
                'border-width': 0,
                'position': 'absolute',
                'width': '100%'
            });
            this.$iframe.insertBefore(this.options.$resizableTableContainer);

            return this.layoutReady().then(function () {
                return this.$iframe;
            }.bind(this));
        };

        ResizableColumns.prototype.getLastHeaderInfo = function () {
            //in future a column can be hidden so lastHeader have to be found in different way
            var lastHeaderIndex = this.columns.length - 1,
                $lastHeader = this.columns[lastHeaderIndex].$header;
            return {
                $header: $lastHeader,
                minWidth: DW.Utils.styleToValue($lastHeader.css('min-width')) || 5,
                index: lastHeaderIndex
            };
        };

        ResizableColumns.prototype.triggerEvent = function (type, args, original) {
            var event;
            event = $.Event(type);
            event.originalEvent = $.extend({}, original);
            return this.$columnsContainer.trigger(event, args || []);
        };

        ResizableColumns.prototype.getColumnId = function ($el) {
            return this.$columnsContainer.data('resizable-columns-id') + '-' + $el.data('resizable-column-id');
        };

        ResizableColumns.prototype.destroy = function () {
            this.timeoutIds.forEach(function (timeoutId) {
                clearTimeout(timeoutId);
            });
            if (this.$iframe) {
                $(this.$iframe[0].contentWindow).off('.rc');
                this.$iframe.remove();
                this.$iframe = null;
            }
            this.columns.off('.rc', '.rc-handle');
            this.$columnsContainer.removeData('resizableColumns');
            return this.$columnsContainer.add(window).off('.rc');
        };

        ResizableColumns.prototype.createHandles = function () {
            this.columns.forEach((function (_this) {
                return function (column, i) {
                    if (!_this.columns[i + 1] || _this.columns[i + 1].$header.length === 0 ||
                        column.$header.attr('data-noresize') !== undefined ||
                        _this.columns[i + 1].$header.attr('data-noresize') !== undefined) {

                        return;
                    }
                    var $handle = $("<div class='rc-handle' />");
                    $handle.data('th', column.$header);

                    ko.utils.domNodeDisposal.addDisposeCallback(column.$header.get(0), $handle.remove);

                    return $handle.appendTo(column.$header);
                };
            })(this));
            this.layoutReady()
                .done(function () {
                    this.syncHandlePositions();
                }.bind(this));
            return this.columns.on('mousedown.rc touchstart.rc', '.rc-handle', this.pointerdown);
        };

        ResizableColumns.prototype.syncHandlePositions = function () {
            return this.columns.findElement('.rc-handle').each((function (_this) {
                return function (_, el) {
                    var $el = $(el),
                        thBoundingClientRect = $el.data('th').get(0).getBoundingClientRect();

                    return $el.offset({ top: thBoundingClientRect.top, left: thBoundingClientRect.right - _this.rcHandleHalfWidth });
                };
            })(this));
        };

        ResizableColumns.prototype.refresh = function () {
            return this.syncHandlePositions();
        };

        ResizableColumns.prototype.saveColumnWidths = function () {
            return this.columns.forEach((function (_this) {
                return function (column) {
                    if (column.$header.attr('data-noresize') === undefined) {
                        if (_this.options.store !== undefined) {
                            //return _this.options.store.set(_this.getColumnId($el), parseWidth($el[0]));
                            return _this.options.store.set(_this.getColumnId(column.$header), column.$header.width());
                        }
                    }
                };
            })(this));
        };

        ResizableColumns.prototype.restoreColumnWidths = function () {
            var newWidths = {};
            this.columns.forEach(function (column, index) {
                var width = (this.options.store !== undefined && this.options.store.get(this.getColumnId(column.$header))) ||
                        this.options.initialWidth ||
                        column.$header.outerWidth();
                newWidths[index] = width;
            }.bind(this));

            this.columns.setWidths(newWidths);
            this.createHandles();
            this.rcHandleHalfWidth = $(this.columns.findElement('.rc-handle')[0]).outerWidth() / 2;
            //this.$columnsContainer.trigger($.Event('column:set'), [newWidths]);
        };

        ResizableColumns.prototype.totalColumnWidths = function () {
            var total;
            total = 0;
            this.columns.forEach((function (_this) {
                return function (column) {
                    //return total += parseFloat($(el)[0].style.width.replace('%', ''));
                    return total += column.$header.width();
                };
            })(this));

            return total;
        };

        ResizableColumns.prototype.constrainWidth = function (width) {
            if (this.options.minWidth !== null) {
                width = Math.max(this.options.minWidth, width);
            }
            if (this.options.maxWidth !== null) {
                width = Math.min(this.options.maxWidth, width);
            }
            return width;
        };

        ResizableColumns.prototype.fitRezize = function (options) {
            var newWidths = {};
            if (options.difference === 0) return;
            if (options.widths.right - options.difference < options.columnMinWidth) {
                if (options.$rightColumn.width() > options.columnMinWidth) {
                    options.difference = options.widths.right - options.columnMinWidth;
                } else {
                    return;
                }
            }

            setWidth(options.$leftColumn[0], newWidths[options.leftColumnIndex] = this.constrainWidth(options.widths.left + options.difference));
            setWidth(options.$rightColumn[0], newWidths[options.leftColumnIndex + 1] = this.constrainWidth(options.widths.right - options.difference));

            return newWidths;
        };

        ResizableColumns.prototype.overflowRezize = function (options) {
            if (options.deltaDifference === 0) return;

            var newWidths = {},
                lastHeaderInfo = options.lastHeaderInfo,
                tableWidth = this.$columnsContainer.width(),
                wannabeTableWidth = tableWidth + options.deltaDifference,
                lastColumnWidth = lastHeaderInfo.$header.width();

            if (this.availableWidth > wannabeTableWidth) {
                if (tableWidth > this.availableWidth) {
                    this.columns.setContainersWidth(this.availableWidth, this.availableWidth);
                }
                var emptySpace = this.availableWidth - wannabeTableWidth;
                newWidths[lastHeaderInfo.index] = lastColumnWidth + emptySpace;
            } else if (this.availableWidth === wannabeTableWidth) {
                this.columns.setContainersWidth(wannabeTableWidth, this.availableWidth);
                newWidths[lastHeaderInfo.index] = lastHeaderInfo.minWidth;
            } else {
                if (lastColumnWidth > lastHeaderInfo.minWidth) {
                    var overflowSpace = wannabeTableWidth - this.availableWidth,
                        newLastColumnWidth = lastColumnWidth - overflowSpace;

                    if (newLastColumnWidth < lastHeaderInfo.minWidth) {
                        wannabeTableWidth -= overflowSpace - (lastHeaderInfo.minWidth - newLastColumnWidth);
                        this.columns.setContainersWidth(wannabeTableWidth, this.availableWidth);
                        newLastColumnWidth = lastHeaderInfo.minWidth;
                    }
                    newWidths[lastHeaderInfo.index] = newLastColumnWidth;
                } else {
                    this.columns.setContainersWidth(wannabeTableWidth, this.availableWidth);
                }
            }
            newWidths[options.leftColumnIndex] = options.widths.left + options.difference;

            this.columns.setWidths(newWidths);

            return newWidths;
        };

        ResizableColumns.prototype.pointerdown = function (e) {
            var $currentGrip,
                $leftColumn,
                $ownerDocument,
                $rightColumn,
                startPosition,
                widths,
                columnMinWidth,
                leftColumnIndex,
                lastHeaderInfo = this.getLastHeaderInfo(),
                oldDifference = 0;
            //var newWidths;
            e.preventDefault();
            $ownerDocument = $(e.currentTarget.ownerDocument);
            startPosition = pointerX(e);
            $currentGrip = $(e.currentTarget);
            $leftColumn = $currentGrip.data('th');
            leftColumnIndex = this.columns.index($leftColumn);
            $rightColumn = this.columns[leftColumnIndex + 1].$header;
            columnMinWidth = DW.Utils.styleToValue($leftColumn.css('min-width'));
            widths = {
                left: $leftColumn.width(),
                right: $rightColumn.width()
            };
            $('html').addClass(this.RESIZABLE_CURSOR_CLASS);
            
            //this.triggerEvent('column:resize:start', [newWidths], e);
            $ownerDocument.on('mousemove.rc touchmove.rc', (function (_this) {
                return function (e) {
                    var difference = pointerX(e) - startPosition;
                    if (widths.left + difference < columnMinWidth) {
                        if ($leftColumn.width() > columnMinWidth) {
                            difference = columnMinWidth - widths.left;
                        } else {
                            return;
                        }
                    }

                    _this.resizeColumns({
                        difference: difference,
                        deltaDifference: difference - oldDifference,
                        widths: widths,
                        $leftColumn: $leftColumn,
                        $rightColumn: $rightColumn,
                        columnMinWidth: columnMinWidth,
                        leftColumnIndex: leftColumnIndex,
                        lastHeaderInfo: lastHeaderInfo
                    });
                    oldDifference = difference;

                    /*if (newWidths && !Object.keys(newWidths).isEmpty()) {
                        return _this.triggerEvent('column:resize', [newWidths], e);
                    }*/
                };
            })(this));
            return $ownerDocument.one('mouseup touchend', (function (_this) {
                return function () {
                    $('html').removeClass(_this.RESIZABLE_CURSOR_CLASS);
                    $ownerDocument.off('mousemove.rc touchmove.rc');
                    _this.syncHandlePositions();
                    _this.saveColumnWidths();
                    //return _this.triggerEvent('column:resize:stop', [newWidths], e);
                };
            })(this));
        };

        return ResizableColumns;
    })();

    return $.fn.extend({
        resizableColumns: function () {
            var args, option;
            option = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
            return this.each(function () {
                var $columnsContainer, data;
                $columnsContainer = $(this);
                data = $columnsContainer.data('resizableColumns');
                if (!data) {
                    $columnsContainer.data('resizableColumns', (data = new ResizableColumns($columnsContainer, option)));
                }
                if (typeof option === 'string') {
                    return data[option].apply(data, args);
                }
            });
        }
    });
})(window.jQuery, window);
