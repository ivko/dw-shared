(function ($) {
    // register namespace
    $.extend(true, window, {
        "Slick": {
            "CellSelectionModel": CellSelectionModel
        }
    });


    function CellSelectionModel(options) {
        var _grid;
        var _canvas;
        var _ranges = [];
        var _self = this;
        //var _selector = new Slick.CellRangeSelector({
        //    "selectionCss": {
        //        "border": "2px solid black"
        //    }            
        //});
        var _options;
        var _defaults = {
            selectActiveCell: true
        };

        var isTouchEnabled = DW.Utils.isTouchEnabled();

        function init(grid) {
            _options = $.extend(true, {}, _defaults, options);
            _grid = grid;
            _canvas = _grid.getCanvasNode();
            _grid.onActiveCellChanged.subscribe(handleActiveCellChange);
            _grid.onKeyDown.subscribe(handleKeyDown);

            _grid[isTouchEnabled ? 'onTap' : 'onClick'].subscribe(handleClick);

            _grid.onContextMenu.subscribe(handleContextMenu)
            //grid.registerPlugin(_selector);
            //_selector.onCellRangeSelected.subscribe(handleCellRangeSelected);
            //_selector.onBeforeCellRangeSelected.subscribe(handleBeforeCellRangeSelected);
        }

        function destroy() {
            _grid.onActiveCellChanged.unsubscribe(handleActiveCellChange);
            _grid.onKeyDown.unsubscribe(handleKeyDown);

            _grid[isTouchEnabled ? 'onTap' : 'onClick'].unsubscribe(handleClick);

            _grid.onContextMenu.unsubscribe(handleContextMenu)
            //_selector.onCellRangeSelected.unsubscribe(handleCellRangeSelected);
            //_selector.onBeforeCellRangeSelected.unsubscribe(handleBeforeCellRangeSelected);
            //_grid.unregisterPlugin(_selector);
        }

        function removeInvalidRanges(ranges) {
            var result = [];

            for (var i = 0; i < ranges.length; i++) {
                var r = ranges[i];
                if (_grid.canCellBeSelected(r.fromRow, r.fromCell) && _grid.canCellBeSelected(r.toRow, r.toCell)) {
                    result.push(r);
                }
            }

            return result;
        }

        function setSelectedRanges(ranges) {
            _ranges = removeInvalidRanges(ranges);
            _self.onSelectedRangesChanged.notify(_ranges);
        }

        function getSelectedRanges() {
            return _ranges;
        }

        function handleBeforeCellRangeSelected(e, args) {
            if (_grid.getEditorLock().isActive()) {
                e.stopPropagation();
                return false;
            }
        }

        function handleCellRangeSelected(e, args) {
            if ($.isArray(args.range))
                setSelectedRanges(args.range);
            else
                setSelectedRanges([args.range]);
        }

        function handleActiveCellChange(e, args) {
            if (_options.selectActiveCell && args.row != null && args.cell != null) {
                setSelectedRanges([new Slick.Range(args.row, args.cell)]);
            }
        }

        function getCellByIndex(index, rowLength) {
            var result = null;
            if (index >= 0) {
                var cell = { row: Math.floor(index / rowLength), cell: index - Math.floor(index / rowLength) * rowLength };
                if (_grid.canCellBeSelected(cell.row, cell.cell))
                    result = cell;
            }
            return result;
        }

        function handleKeyDown(e) {
            /***
             * Кey codes
             *  9 tab
             * 37 left
             * 38 up
             * 39 right
             * 40 down                     
             */
            var ranges, last;
            var active = _grid.getActiveCell();
            var rowLength = _grid.getColumns().length;

            // DW IV - Adapt grid to release the focus out #99204
            if (e.which == 9) return;

            if (active && !e.ctrlKey && !e.altKey &&
                (e.which == 37 || e.which == 39 || e.which == 38 || e.which == 40 || e.which == 9)) {

                ranges = getSelectedRanges();
                if (!ranges.length)
                    ranges.push(new Slick.Range(active.row, active.cell));

                // keyboard can work with last range only
                if (ranges[0].invertedData) {
                    last = ranges[ranges.length - 1].invertedData;
                }
                else {
                    last = ranges[ranges.length - 1];
                }
                var lastIndex = last.toRow * rowLength + last.toCell;

                if (e.which == 37) {
                    lastIndex -= 1;
                } else if (e.which == 39 || e.which == 9) {
                    lastIndex += 1;
                } else if (e.which == 38) {
                    lastIndex -= rowLength;
                } else if (e.which == 40) {
                    lastIndex += rowLength;
                }

                var last_Cell = getCellByIndex(lastIndex, rowLength);
                if (last_Cell) {
                    if (e.shiftKey) {
                        var new_Range = getResultRange(active, last_Cell);
                        setSelectedRanges(new_Range);

                        e.preventDefault();
                        e.stopPropagation();
                    }
                    else {
                        if (_grid.getData()[last_Cell.row][last_Cell.cell]) {
                            _grid.setActiveCell(last_Cell.row, last_Cell.cell);
                        }
                        e.stopImmediatePropagation();
                    }
                    _grid.scrollRowIntoView(last_Cell.row, false);
                }
            }
            else if (active && e.ctrlKey && !e.altKey && !e.shiftKey && e.which == 65) {//ctrl+'a' pressed                
                var data = _grid.getData(),
                    lastRow = data.length - 1,
                    lastColumn = Object.keys(data[lastRow]).length - 1;

                setSelectedRanges(getResultRange({ row: 0, cell: 0 }, { row: lastRow, cell: lastColumn }));

                e.preventDefault();
                e.stopPropagation();
            }
            else if (!e.ctrlKey && !e.altKey && !e.shiftKey && (e.which == 35 || e.which == 36)) {//End
                var item = { row: 0, cell: 0 }; //Home

                if (e.which == 35) { //End
                    var data = _grid.getData(),
                        lastRow = data.length - 1,
                        lastColumn = Object.keys(data[lastRow]).length - 1;
                    item = { row: lastRow, cell: lastColumn };
                }

                _grid.scrollRowIntoView(item.row, false);
                setSelectedRanges(getResultRange(item, item));

                e.preventDefault();
                e.stopPropagation();
            }
        }

        function isCellInRange(cell, ranges) {
            result = -1;
            for (var i = 0; i < ranges.length; i++) {
                for (var j = ranges[i].fromRow; j <= ranges[i].toRow; j++) {
                    if ((cell.row >= ranges[i].fromRow && cell.row <= ranges[i].toRow) && (cell.cell >= ranges[i].fromCell && cell.cell <= ranges[i].toCell)) {
                        result = i;
                        break;
                    }
                }
            }
            return result;
        }

        function getResultRange(fromCell, toCell) {
            result = [];
            var rowLength = _grid.getColumns().length;
            var lastCell = rowLength - 1;
            var fromPos = fromCell.cell + fromCell.row * rowLength;//get the index of the first selected document
            var toPos = toCell.cell + toCell.row * rowLength;//get the index of the last selected document

            if (fromPos < toPos) {//from < to
                for (i = fromCell.row; i <= toCell.row; i++) {
                    fromPos = (i == fromCell.row) ? fromCell.cell : 0;
                    toPos = (i == toCell.row) ? toCell.cell : lastCell;
                    result.push(new Slick.Range(i, fromPos, i, toPos));
                }
            }
            else {//from > to
                for (i = fromCell.row; i >= toCell.row; i--) {
                    fromPos = (i == fromCell.row) ? fromCell.cell : lastCell;
                    toPos = (i == toCell.row) ? toCell.cell : 0;
                    var range = new Slick.Range(i, toPos, i, fromPos);
                    range.invertedData = { fromRow: i, fromCell: fromPos, toRow: i, toCell: toPos }
                    result.push(range);
                }
            }
            return result;
        }

        function handleContextMenu(e) {
            var cell = _grid.getCellFromEvent(e);
            if (!cell || !_grid.canCellBeActive(cell.row, cell.cell)) {
                return false;
            }

            var selection = $.extend([], _ranges);
            var idx = isCellInRange(cell, selection);
            if (idx === -1) {
                selection = [];
                selection.push(new Slick.Range(cell.row, cell.cell));

                setSelectedRanges(selection);
            }
        }

        function removeCellFromSelection(selection, index, cell) {
            /// <summary>
            /// remove the cell from the selection - either adjust the range in which the cell is, or remove/split the range
            /// </summary>
            /// <param name="selection">array of  all the ranges in the current selection</param>
            /// <param name="index">index of the row on which the cell is located</param>
            /// <param name="cell">cell object</param>                        
            var currentRange = selection[index];
            if (currentRange.fromCell - currentRange.toCell == 0) {//single cell in the range - remove the range
                selection.splice(index, 1);
            }
            else {
                if (cell.cell == currentRange.fromCell)//remove first element of the range
                    currentRange.fromCell += 1;
                else if (cell.cell == currentRange.toCell)//remove last element of the range
                    currentRange.toCell -= 1;
                else {//split range - first add a new element, then adjust the original one
                    selection.push(new Slick.Range(cell.row, cell.cell + 1, cell.row, currentRange.toCell));
                    currentRange.toCell = cell.cell - 1;
                }
            }
        }

        function handleClick(e) {
            var cell = _grid.getCellFromEvent(e);
            if (!cell || !_grid.canCellBeActive(cell.row, cell.cell)) {
                e.stopImmediatePropagation && e.stopImmediatePropagation();
                return false;
            }

            var selection = $.extend(true, [], _ranges);
            var idx = isCellInRange(cell, selection);
            var cellIsSelected = (idx !== -1);
            var isTouchArea = $(e.target).closest('.mobile-menu').length > 0;
            var isTouchCheckbox = isTouchArea && $(e.target.control || e.target).is('.dw-checkBox');
            var isTouchMenu = isTouchArea && $(e.target).is('.dw-icon-mobile-menu');

            if (isTouchCheckbox) {
                e.stopImmediatePropagation && e.stopImmediatePropagation();
                return true;
            }

            if (!_grid.getOptions().multiSelect) { // singleselect
                selection = [new Slick.Range(cell.row, cell.cell)];
                _grid.setActiveCell(cell.row, cell.cell);
            } else { // multiselect
                if (!e.ctrlKey && !e.shiftKey && !e.metaKey && !isTouchArea) { // no special
                    selection = [new Slick.Range(cell.row, cell.cell)];
                    _grid.setActiveCell(cell.row, cell.cell);
                } else {
                    if (selection.length) { // already have selected items
                        if (e.shiftKey) {
                            var fromRange = selection[0].invertedData || selection[0];
                            var fromCell = { row: fromRange.fromRow, cell: fromRange.fromCell }
                            selection = getResultRange(fromCell, cell);
                            //_grid.setActiveCell(cell.row, cell.cell);                    
                        } else if (!cellIsSelected) {
                            if (isTouchMenu) {
                                selection = [new Slick.Range(cell.row, cell.cell)];
                            } else if (e.ctrlKey || e.metaKey || isTouchCheckbox) {
                                selection.push(new Slick.Range(cell.row, cell.cell));
                                //_grid.setActiveCell(cell.row, cell.cell);
                            }
                        } else if (cellIsSelected) {
                            if (isTouchMenu) {
                                _grid.setActiveCell(cell.row, cell.cell);
                            } else if (e.ctrlKey || e.metaKey || isTouchCheckbox) {
                                removeCellFromSelection(selection, idx, cell);
                                // _grid.setActiveCell(cell.row, cell.cell);
                            }
                        }
                    } else {
                        selection = [new Slick.Range(cell.row, cell.cell)];
                        _grid.setActiveCell(cell.row, cell.cell);
                    }

                    if (!isTouchMenu) {
                        e.stopImmediatePropagation && e.stopImmediatePropagation();
                    }
                }
            }

            _ranges = selection;
            setSelectedRanges(_ranges);

            return true;
        }

        $.extend(this, {
            "getSelectedRanges": getSelectedRanges,
            "setSelectedRanges": setSelectedRanges,
            "isCellInRange": isCellInRange,

            "init": init,
            "destroy": destroy,

            "onSelectedRangesChanged": new Slick.Event()
        });
    }
})(jQuery);