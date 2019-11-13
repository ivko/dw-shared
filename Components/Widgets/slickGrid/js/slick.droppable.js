(function ($) {
    // register namespace
    $.extend(true, window, {
        "Slick": {
            "Droppable": Droppable
        }
    });

    function Droppable(options) {
        var _self = this,
            _grid, _$container, _$canvas,
            _dropBehaviour,
            lastMarkedCell,
            _defaults = {};
         
        function init(grid) {
            options = $.extend(true, {}, _defaults, options);

            _grid = grid;
            _$container = $(grid.getContainerNode());
            _$canvas = $(grid.getCanvasNode());

            _dropBehaviour = options.dropBehaviour;

            _$container.on('dropinit', onDropInit);
            _$container.on('dropstart', onDropStart);
            _$container.on('dropend', onDropEnd);
            _$container.on('drop', onDrop);
            _$container.on('dragover', onDragOver);
        }

        function destroy() {
            _$container.off('dropinit', onDropInit);
            _$container.off('dropstart', onDropStart);
            _$container.off('dropend', onDropEnd);
            _$container.off('drop', onDrop);
            _$container.off('dragover', onDragOver);
        }

        function onDropInit(e, dd) {
        }

        function onDropStart(e, dd) {
            if (!dd.dragObjectData)
                return false;
            dd.dragObjectData.bindingContext = options.bindingContext;

            var canDrop = dd && dd.dragObjectData && !dd.dragObjectData.cancelled &&
                !(_dropBehaviour && _dropBehaviour.canDrop && !_dropBehaviour.canDrop(dd.dragObjectData));
            if (canDrop) {
                _$container.addClass('dropStart');
            }
            return !!canDrop;
        }

        function onDropEnd(e, dd) {
            _$container.removeClass('dropStart');
            $(lastMarkedCell).removeClass('markDropCell');
            $(lastMarkedCell ? lastMarkedCell.parentNode : null).removeClass('markDropCell');
        }

        function onDrop(e, dd) {
            if (!dd) {
                activateCellFromEvent(e);
            }
            else {
                if (!(_dropBehaviour && _dropBehaviour.canDrop && !_dropBehaviour.canDrop(dd.dragObjectData))) {
                    //in case we want to prevent selection and work with marking we can use
                    //dd.dragObjectData which contains row and cell numbers, it might set the selection and work with it if needed
                    _dropBehaviour.doDrop && _dropBehaviour.doDrop(dd.dragObjectData, e);
                    _self.onCellDrop.notify(dd.dragObjectData.cell);
                }
            }
        }

        function onDragOver(e, dd) {
            if (dd)
                activateCell(dd);
            else debouncedActivateCellFromEvent(e);
        }

        function getCell(dd) {
            if (!dd) return null;

            var x = dd.startX + dd.deltaX - _$canvas.offset().left,
                y = dd.startY + dd.deltaY - _$canvas.offset().top,
                cell = _grid.getCellFromPoint(x, y),
                exist = cell && document.body.contains(_grid.getCellNode(cell.row, cell.cell));

            return exist && cell;
        }
        function markCell(dd) {
            var cell = getCell(dd),
                cellNode = cell ? _grid.getCellNode(cell.row, cell.cell) : null;            
                
            if (cellNode && cellNode !== lastMarkedCell) {
                //todo better selection in case of thumbnails and tables
                $(lastMarkedCell).removeClass('markDropCell');
                $(lastMarkedCell ? lastMarkedCell.parentNode : null).removeClass('markDropCell');
                lastMarkedCell = cellNode;
                _grid.scrollCellIntoView(cell.row, cell.cell, false);
                
            }
            $(lastMarkedCell).addClass('markDropCell');
            $(lastMarkedCell ? lastMarkedCell.parentNode : null).addClass('markDropCell');
            return cell;
        }
        function activateCellFromEvent(e) {
            //activates cell from dropzone event
            var cell = _grid.getCellFromEvent(e),
                $folderDropzone = $(e.target).closest(".dropzone.folder", $(_grid.getCanvasNode()));

            if (cell && $folderDropzone.length) {
                _grid.setActiveCell(cell.row, cell.cell);
            }
            else {
                deactivateCell();
            }
        }

        //use debounce to fix lag issue with dragging in Chrome
        var debouncedActivateCellFromEvent = DW.Utils.debounce(activateCellFromEvent, 0);

        function activateCell(dd) {
            //return markCell(dd);
            var cell = getCell(dd),
                active = _grid.getActiveCell();
            if (cell) {
                if (!(active && (cell.row === active.row && cell.cell === active.cell)) &&
                    _grid.canCellBeActive(cell.row, cell.cell)) {
                    //set the drop location in the grid e.g. cell and row number, 
                    //it might be used by the _dropBehaviour.doDrop
                    dd.dragObjectData.cell = {
                        row: cell.row,
                        cell: cell.cell
                    };
                    if (_dropBehaviour.canDrop(dd.dragObjectData))
                        _grid.setActiveCell(cell.row, cell.cell);
                }
            }
            //do nothing if the drop/dragover is within the same grid
            //a better mechanism is needed whenever we want to set a selection in the same grid
            else if (_dropBehaviour.canDrop(dd.dragObjectData) && _grid !== dd.grid) {
                deactivateCell();
            }
            return cell;
        }

        function deactivateCell() {
            _grid.resetActiveCell();

            var selectionModel = _grid.getSelectionModel();
            selectionModel.setSelectedRanges([]);
        }

        $.extend(this, {
            "onCellDrop": new Slick.Event(),

            "init": init,
            "destroy": destroy
        });
    }
})(jQuery);