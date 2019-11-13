(function ($) {
    // register namespace
    $.extend(true, window, {
        "Slick": {
            "CellRangeSelector": CellRangeSelector
        }
    });


    function CellRangeSelector(options) {
        var _grid;
        var _canvas;
        var _dragging;
        var _decorator;
        var _self = this;
        var _handler = new Slick.EventHandler();
        var _defaults = {
            selectionCss: {
                "border": "2px dashed blue"
            }
        };


        function init(grid) {
            options = $.extend(true, {}, _defaults, options);
            _decorator = new Slick.CellRangeDecorator(grid, options);
            _grid = grid;
            _canvas = _grid.getCanvasNode();
            _handler
              .subscribe(_grid.onDragInit, handleDragInit)
              .subscribe(_grid.onDragStart, handleDragStart)
              .subscribe(_grid.onDrag, handleDrag)
              .subscribe(_grid.onDragEnd, handleDragEnd);
        }

        function destroy() {
            _handler.unsubscribeAll();
        }

        function handleDragInit(e, dd) {
            // prevent the grid from cancelling drag'n'drop by default
            e.stopImmediatePropagation();
        }

        function handleDragStart(e, dd) {
            var cell = _grid.getCellFromEvent(e);

            //if we try to begin dragging in an already selected zone - don't show the selector, switch to dragging the selected documents
            if (_grid.getSelectionModel().isCellInRange(cell, _grid.getSelectionModel().getSelectedRanges()) != -1)
                return;

            if (_self.onBeforeCellRangeSelected.notify(cell) !== false) {
                if (_grid.canCellBeSelected(cell.row, cell.cell)) {
                    _dragging = true;
                    e.stopImmediatePropagation();
                }
            }
            if (!_dragging) {
                return;
            }

            var start = _grid.getCellFromPoint(
                dd.startX - $(_canvas).offset().left,
                dd.startY - $(_canvas).offset().top);

            dd.range = { start: start, end: {} };

            return _decorator.show(new Slick.Range(start.row, start.cell));
        }

        function handleDrag(e, dd) {
            if (!_dragging) {
                return;
            }
            e.stopImmediatePropagation();

            var end = _grid.getCellFromPoint(
                e.pageX - $(_canvas).offset().left,
                e.pageY - $(_canvas).offset().top);

            if (!_grid.canCellBeSelected(end.row, end.cell)) {
                return;
            }

            dd.range.end = end;
            _decorator.show(new Slick.Range(dd.range.start.row, dd.range.start.cell, end.row, end.cell));
        }

        //create a new selection range array, based on the old one and the new selection
        //direction of selection is taken into account      
        function createResultRanges(newRange, oldRanges) {
            var result = oldRanges
            var rowLength = _grid.getColumns().length;
            var lastCell = rowLength - 1;
            var fromPos = newRange.start.cell + newRange.start.row * rowLength;//get the index of the first selected document
            var toPos = newRange.end.cell + newRange.end.row * rowLength;//get the index of the last selected document

            if (fromPos < toPos) {//from < to            
                oldRanges.push(new Slick.Range(newRange.start.row, newRange.start.cell, newRange.end.row, newRange.end.cell));
            }
            else {//from > to
                for (i = newRange.start.row; i >= newRange.end.row; i--) {
                    fromPos = newRange.start.cell;
                    toPos = newRange.end.cell;
                    var range = new Slick.Range(i, toPos, i, fromPos);
                    range.invertedData = { fromRow: i, fromCell: fromPos, toRow: i, toCell: toPos }
                    oldRanges.push(range);
                }
            }
            return result;
        }

        function handleDragEnd(e, dd) {
            if (!_dragging) {
                return;
            }            

            _dragging = false;
            e.stopImmediatePropagation();

            _decorator.hide();
            if (e.ctrlKey || e.shiftKey) {
                var ranges = _grid.getSelectionModel().getSelectedRanges();
                if (ranges && ranges.length > 0) {
                    rages = createResultRanges(dd.range, ranges);
                    _self.onCellRangeSelected.notify({ range: ranges });
                }
            }
            else {
                var ranges = createResultRanges(dd.range, []);
                _self.onCellRangeSelected.notify({ range: ranges });
            }
        }

        $.extend(this, {
            "init": init,
            "destroy": destroy,

            "onBeforeCellRangeSelected": new Slick.Event(),
            "onCellRangeSelected": new Slick.Event()
        });
    }
})(jQuery);