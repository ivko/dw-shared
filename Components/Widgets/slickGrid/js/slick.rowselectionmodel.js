(function ($) {
    // register namespace
    $.extend(true, window, {
        "Slick": {
            "RowSelectionModel": RowSelectionModel
        }
    });

    function RowSelectionModel(options) {
        var _grid;
        var _ranges = [];
        var _self = this;
        var _handler = new Slick.EventHandler();
        var _inHandler;
        var _options;
        var _defaults = {
            selectActiveRow: true
        };

        var isTouchEnabled = DW.Utils.isTouchEnabled();

        function init(grid) {
            _options = $.extend(true, {}, _defaults, options);
            _grid = grid;
            _handler.subscribe(_grid.onActiveCellChanged,
                wrapHandler(handleActiveCellChange));
            _handler.subscribe(_grid.onKeyDown,
                wrapHandler(handleKeyDown));
            _handler.subscribe(_grid[isTouchEnabled ? 'onTap' : 'onClick'],
                wrapHandler(handleClick));
            _handler.subscribe(_grid.onContextMenu,
                wrapHandler(handleContextMenu));
        }

        function destroy() {
            _handler.unsubscribeAll();
            _grid = null;
        }

        function wrapHandler(handler) {
            return function () {
                if (!_inHandler) {
                    _inHandler = true;
                    handler.apply(this, arguments);
                    _inHandler = false;
                }
            };
        }

        function rangesToRows(ranges) {
            var rows = [];
            for (var i = 0; i < ranges.length; i++) {
                for (var j = ranges[i].fromRow; j <= ranges[i].toRow; j++) {
                    rows.push(j);
                }
            }
            return rows;
        }

        function rowsToRanges(rows) {
            var ranges = [];
            var lastCell = _grid.getColumns().length - 1;
            for (var i = 0; i < rows.length; i++) {
                ranges.push(new Slick.Range(rows[i], 0, rows[i], lastCell));
            }
            return ranges;
        }

        function getRowsRange(from, to) {
            var i, rows = [];
            for (i = from; i <= to; i++) {
                rows.push(i);
            }
            for (i = to; i < from; i++) {
                rows.push(i);
            }
            return rows;
        }

        function getSelectedRows() {
            return rangesToRows(_ranges);
        }

        function setSelectedRows(rows) {
            setSelectedRanges(rowsToRanges(rows));
        }

        function setSelectedRanges(ranges) {
            _ranges = ranges;
            _self.onSelectedRangesChanged.notify(_ranges);
        }

        function getSelectedRanges() {
            return _ranges;
        }

        function handleActiveCellChange(e, data) {
            if (_options.selectActiveRow && data.row != null) {
                setSelectedRanges([new Slick.Range(data.row, 0, data.row, _grid.getColumns().length - 1)]);
            }
        }

        function handleKeyDown(e) {
            var activeRow = _grid.getActiveCell();
            if (activeRow && e.shiftKey && _grid.getOptions().multiSelect && !e.ctrlKey && !e.altKey && !e.metaKey && (e.which == 38 || e.which == 40)) {
                var selectedRows = getSelectedRows();
                selectedRows.sort(function (x, y) {
                    return x - y
                });

                if (!selectedRows.length) {
                    selectedRows = [activeRow.row];
                }

                var top = selectedRows[0];
                var bottom = selectedRows[selectedRows.length - 1];
                var active;

                if (e.which == 40) {
                    active = activeRow.row < bottom || top == bottom ? ++bottom : ++top;
                } else {
                    active = activeRow.row < bottom ? --bottom : --top;
                }

                if (active >= 0 && active < _grid.getDataLength()) {
                    _grid.scrollRowIntoView(active);
                    _ranges = rowsToRanges(getRowsRange(top, bottom));
                    setSelectedRanges(_ranges);
                }

                e.preventDefault();
                e.stopPropagation();
            }
            else if (e.ctrlKey && !e.altKey && !e.shiftKey && e.which == 65 && _grid.getOptions().multiSelect) {//ctrl+'a' pressed
                _ranges = rowsToRanges(getRowsRange(0, _grid.getDataLength() - 1));
                setSelectedRanges(_ranges);

                e.preventDefault();
                e.stopPropagation();
            }
            else if (!e.ctrlKey && !e.altKey && !e.shiftKey && (e.which == 35 || e.which == 36)) {//End
                var rowIndex = 0; //Home

                if (e.which == 35) { //End
                    rowIndex = _grid.getDataLength() - 1;
                }

                _grid.scrollRowIntoView(rowIndex);
              
                _grid.setActiveCell(rowIndex, 0);
                setSelectedRanges(rowsToRanges([rowIndex]));

                e.preventDefault();
                e.stopPropagation();
            }
        }

        function handleContextMenu(e) {
            var cell = _grid.getCellFromEvent(e);
            if (!cell || !_grid.canCellBeActive(cell.row, cell.cell)) {
                return false;
            }

            var selection = rangesToRows(_ranges);
            var idx = $.inArray(cell.row, selection);
            if (idx === -1) {
                var rows = [];
                rows.push(cell.row);
                setSelectedRows(rows);
            }
        }

        function handleClick(e) {
            var cell = _grid.getCellFromEvent(e);
            if (!cell || !_grid.canCellBeActive(cell.row, cell.cell)) {
                e.stopImmediatePropagation && e.stopImmediatePropagation();
                return false;
            }

            var selection = rangesToRows(_ranges);
            var idx = $.inArray(cell.row, selection);
            var cellIsSelected = (idx !== -1);
            var isTouchArea = $(e.target).closest('.mobile-menu').length > 0;
            var isTouchCheckbox = isTouchArea && $(e.target.control || e.target).is('.dw-checkBox');
            var isTouchMenu = isTouchArea && $(e.target).is('.dw-icon-mobile-menu');

            if (isTouchCheckbox) {
                e.stopImmediatePropagation && e.stopImmediatePropagation();
                return true;
            }

            if (!_grid.getOptions().multiSelect) { // singleselect
                selection = [cell.row];
                _grid.setActiveCell(cell.row, cell.cell);
            } else { // multiselect
                if (!e.ctrlKey && !e.shiftKey && !e.metaKey && !isTouchArea) { // no special
                    selection = [cell.row];
                    _grid.setActiveCell(cell.row, cell.cell);
                } else {
                    if (selection.length) { // already have selected items
                        if (e.shiftKey) {
                            //DW VO - change the way the selection is made, so it is always from the first selected document to the last
                            var from = selection[0];
                            var to = cell.row;
                            selection = [];
                            if (from < to) {
                                for (var i = from; i <= to; i++) {
                                    selection.push(i);
                                }
                            }
                            else {
                                for (var i = from; i >= to; i--) {
                                    selection.push(i);
                                }
                            }
                            //DW VO original code: (you get an array like this: [1,2,3,0] (row0=>row3) or [0,1,2,3] (row3=>row0))
                            //var last = selection.pop();
                            //var from = Math.min(cell.row, last);
                            //var to = Math.max(cell.row, last);
                            //selection = [];
                            //for (var i = from; i <= to; i++) {
                            //  if (i !== last) {
                            //    selection.push(i);
                            //  }
                            //}
                            //selection.push(last);
                            //DW VO - change the way the selection is made, so it is always from the first selected document to the last
                            _grid.setActiveCell(cell.row, cell.cell);
                        } else if (!cellIsSelected) {
                            if (isTouchMenu) {
                                selection = [cell.row];
                                _grid.setActiveCell(cell.row, cell.cell);
                            } else if (e.ctrlKey || e.metaKey || isTouchCheckbox) {
                                selection.push(cell.row);
                                _grid.setActiveCell(cell.row, cell.cell);
                            }
                        } else if (cellIsSelected) {
                            if (isTouchMenu) {
                                _grid.setActiveCell(cell.row, cell.cell);
                            } else if (e.ctrlKey || e.metaKey || isTouchCheckbox) {
                                selection = $.grep(selection, function (o, i) {
                                    return (o !== cell.row);
                                });
                                _grid.setActiveCell(cell.row, cell.cell);
                            }
                        }
                    } else {
                        selection = [cell.row];
                        _grid.setActiveCell(cell.row, cell.cell);
                    }

                    if (!isTouchMenu) {
                        e.stopImmediatePropagation && e.stopImmediatePropagation();
                    }
                }
            }

            _ranges = rowsToRanges(selection);
            setSelectedRanges(_ranges);

            return true;
        }

        $.extend(this, {
            "getSelectedRows": getSelectedRows,
            "setSelectedRows": setSelectedRows,

            "getSelectedRanges": getSelectedRanges,
            "setSelectedRanges": setSelectedRanges,

            "init": init,
            "destroy": destroy,

            "onSelectedRangesChanged": new Slick.Event()
        });
    }
})(jQuery);