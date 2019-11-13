DataViewDragProcessor = function (dataView, dragBehaviourVM) {
    /// <summary>drag functionality used in the dataviews</summary>
    /// <param name="grid" type="Object">the grid we are attaching to</param>    
    /// <param name="dragBehaviour" type="Object">used to get the data kept in the dragged object (that is, model id and document ID(s)</param>

    var self = this;
    self._grid = dataView._grid;

    self.init = function () {
        self._grid.onDragInit.subscribe(self.onDragInit);
        self._grid.onDragStart.subscribe(self.onDragStart);
        self._grid.onDrag.subscribe(self.onDrag);
        self._grid.onDragEnd.subscribe(self.onDragEnd);
    }

    self.onDragInit = function (e, dd) {
        // prevent the grid from cancelling drag'n'drop by default
        // e.stopImmediatePropagation();
        return true;
    };

    self.onDragStart = function (e, dd) {
        e.stopImmediatePropagation();

        var cell = self._grid.getCellFromEvent(e);

        //check if the cell/row we are dragging is the actually selected one
        //if not, select it before retrieving the data (all previous selections will be cancelled)
        if (dragBehaviourVM.dataView().isEntireRowSelectable()) {
            var selectedRows = self._grid.getSelectedRows();
            if (!selectedRows.length || $.inArray(cell.row, selectedRows) == -1) {
                selectedRows = [cell.row];
                self._grid.setSelectedRows(selectedRows);
            }
        }
        else {
            var selectedCellIndex = dataView.getSelectedItemIndex(cell);
            if (selectedCellIndex != -1)
                dataView.setGridSelection([selectedCellIndex]);
        }

        var dragData = dragBehaviourVM.getDragData();

        dd.dragObjectData = {
            ctrlPressed: e.ctrlKey,
            dragData: dragData
        };

        var dragObject = $('<div class="dw-drag-icons" data-bind="template: {name: \'' + dragData.template + '\'}"></div>').appendTo("body");
        $('<div id="drag-overlay" class="ui-widget-overlay ui-front"></div>').prependTo("body");
        ko.applyBindings(dragData, dragObject[0]);

        $(dd.available).addClass("canDrop ui-front");
        $(".dw-griddle").addClass("canDrop ui-front");


        $(document).on('keydown', { dragObject: dragObject, dragContext: dd }, self.processKeyDown);
        $(document).on('keyup', { dragObject: dragObject, dragContext: dd }, self.processKeyUp);

        return dragObject; // proxy
    };

    self.onDrag = function (e, dd) {
        $(dd.proxy).css({ transform: 'translate(' + e.pageX + 'px, ' + e.pageY + 'px)' });
        $(dd.drop).trigger('dragover', dd);
    };

    self.onDragEnd = function (e, dd) {
        $(document).off('keydown', self.processKeyDown);
        $(document).off('keyup', self.processKeyUp);

        //TODO find why dd is empty when it is called from processKeyDown-> self._grid.onDragEnd.notify        
        $(dd.available).removeClass("canDrop ui-front");
        $(".dw-griddle").removeClass("canDrop ui-front");
        ko.cleanNode(dd.proxy);
        $('#drag-overlay').remove();
        $(dd.proxy).remove();
    };

    self.processKeyDown = function (e) {
        e.data.dragContext.dragObjectData.ctrlPressed = e.ctrlKey;
        if (e.data.dragContext.dragObjectData.ctrlPressed) {
            e.data.dragObject.addClass("dragCopy");
        }
        else if (e.keyCode == 27) {
            //e.data.dragObject = null;
            e.data.dragContext.dragObjectData.dragData = null;
            e.data.dragContext.dragObjectData.cancelled = true;

            self._grid.onDragEnd.notify(e.data.dragContext, e, self);
        }
    }

    self.processKeyUp = function (e) {
        e.data.dragContext.dragObjectData.ctrlPressed = e.ctrlKey;
        if (!e.data.dragContext.dragObjectData.ctrlPressed) {
            e.data.dragObject.removeClass("dragCopy");
        }
    }

    self.destroy = function () {
        self._grid.onDragInit.unsubscribe(self.onDragInit);
        self._grid.onDragStart.unsubscribe(self.onDragStart);
        self._grid.onDrag.unsubscribe(self.onDrag);
        self._grid.onDragEnd.unsubscribe(self.onDragEnd);
    }
}