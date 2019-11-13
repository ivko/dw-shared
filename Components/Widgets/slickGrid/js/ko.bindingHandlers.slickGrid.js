(function ($, ko) {
    BaseDataViewBehaviour = function (element, model, options) {
        var self = new DW.Disposable();
        self._options = {
            measureScrollbar: DW.Utils.getScrollbarSize,
            contextMenus: options.contextMenus || {},
            externalCleanNode: function ($node) {
                ko.unapplyBindings($node, false);
            }
        };
        self._model = model;
        self._grid = null;
        self._dataAdapter = null;
        self._selectionSubscription = null;
        self._loadingSubscription = null;
        self._handler = new Slick.EventHandler();
        self.destroyInitiated = ko.observable(false);
        self.gridRenderComplete = ko.observable(false);
        var lastSize = { height: $(element).height(), width: $(element).width() };
        var resizeWhenActive = false;

        var emptyMsgEl = $("<div class='dw-no-content'><div class='text-container'><div class='icon-container'><span class='ui-icon'></span></div></div></div>");
        $("<span/>").text(options.emptyDataViewMessage).appendTo(emptyMsgEl.find('div.icon-container').parent());

        self.toggleEmptyMessage = function () {
            var isEmpty = ((self._grid.getData() || []).length > 0 || !options.emptyDataViewMessage) ? false : true;
            if (isEmpty) {
                emptyMsgEl.show();
                $(self._grid.getViewportNode()).find(".grid-canvas").css("min-width", "100%");
            }
            else {
                emptyMsgEl.hide();
                $(self._grid.getViewportNode()).find(".grid-canvas").css("min-width", "0px");
            }
        };

        var gridElementHasHeightPromise = function () {
            var $element = $(element),
                d = DW.Deferred();
            var hasValidSize = function () { return $element.height() > 0 && $element.width() > 0; };
            if (!hasValidSize()) {
                var checkHeight = function () {
                    if (!hasValidSize()) {
                        setTimeout(checkHeight, 1);
                    }
                    else {
                        d.resolve();
                    }
                }
                checkHeight();
            }
            else
                d.resolve();
            return d.promise();
        };

        self.init = function () {
            //PerformanceCounter = new DW.Diagnostics.PerformanceCounterPrototype();
            //PerformanceCounter.getLogger("MakeASearch").tick("Start wait for data", DW.Diagnostics.TickTypes.Client);
            model.firstDataLoaded.then(function () {
                PerformanceCounter.getLogger("MakeASearch").tick("Start Initialize Grid data", DW.Diagnostics.TickTypes.Client);
                if (!self.destroyInitiated()) {//if we press X now, do not init the view                
                    self._init();
                    PerformanceCounter.getLogger("MakeASearch").tick("Initialize Grid data", DW.Diagnostics.TickTypes.Client);
                }
            }).done(function () {
                if (!self.destroyInitiated()) {//If we press X now, do not continue with creating the grid
                    //we finished with the data adaptions so init the grid                
                    //PerformanceCounter.getLogger("MakeASearch").tick("Start rendering grid data", DW.Diagnostics.TickTypes.Client);
                    gridElementHasHeightPromise().done(function () {
                        self._grid.init();
                        //set selection after the grid is initialized
                        self.setGridSelectionInternal(self._model.selectedIndexes());
                        self.focus();//VO - moved here from setGridSelectionInternal - see comment there
                        PerformanceCounter.getLogger("MakeASearch").tick("Grid rendered", DW.Diagnostics.TickTypes.Client);
                        PerformanceCounter.stopLogger("MakeASearch");
                        self.toggleEmptyMessage();
                    });
                }
            });

            if (model.canPostAddItems()) {
                self.addDisposable(model.newElement.subscribe(function (item) {
                    self.addNewElement(item);
                }));
            }
        };

        self.destroyGrid = ko.computed(function () {
            if (self.destroyInitiated() && self.gridRenderComplete()) {
                self._destroyInternal();
            }
        });

        self._init = function () {

            self.isTouchEnabled = DW.Utils.isTouchEnabled();

            self._dataAdapter = options.dataAdapter();

            self.createGridControl();

            lastSize = { height: $(element).height(), width: $(element).width() };

            self.attachDWScrollbar();

            self._selectionSubscription = self._model.selectedIndexes.subscribe(self.setGridSelectionInternal);

            self.addDisposable(self._model.active.subscribe(function (active) {
                if (active && resizeWhenActive) {
                    setTimeout(function () {
                        resizeWhenActive = false;
                        self.resize();
                    }, 0);
                }
            }));

            //we subscribe to model's forceResize in order to resize the grid. 
            self.addDisposable(self._model.forceResize.subscribe(function (resize) {
                if (resize) {
                    self._onResize();

                    // we want to set back the observable to false. Note: this will trigger the subscription again
                    self._model.forceResize(false);
                }
            }));

            //set the focus when a command is done
            self.addDisposable(self._model.isLocked.subscribe(function (isLocked) {
                if (!isLocked) {
                    self.focus();
                }
            }));
            //set the focus when the grid become active
            self.disposables[self.disposables.length] = self._model.active.subscribe(self.focus);

            self._loadingSubscription = self._model.loaddata.subscribe(self._onLoadChange);

            if (options.dragBehaviour.canDrag()) {
                self.dataViewDragProcessor = new DataViewDragProcessor(self, options.dragBehaviour);
                self.dataViewDragProcessor.init();
            };

            self._grid.registerPlugin(new Slick.Droppable({
                dropBehaviour: options.dragBehaviour,
                bindingContext: options.bindingContext
            }));

            for (var menu in self._options.contextMenus) {
                if (self._options.contextMenus.hasOwnProperty(menu) && !self._options.contextMenus[menu].showAt)
                    self._options.contextMenus[menu].showAt = function () { };
            }

            self._handler.subscribe(self._grid.onContextMenu, self.onContextMenu);

            $(self._grid.getViewportNode()).on('contextmenu', self.onViewportContextMenu);

            self._handler.subscribe(self._grid.onClick, function (e, args) {
                //on canvas click
                for (var menu in self._options.contextMenus) {
                    if (self._options.contextMenus.hasOwnProperty(menu))
                        self._options.contextMenus[menu].showAt(null);
                }
            });

            $(self._grid.getViewportNode()).on('click', function (e) {
                //on viewport click
                if ($(e.target).hasClass("slick-viewport")) {
                    self._model.selectedIndexes([]);
                }
            });

            self._handler.subscribe(self._grid.onTap, function (e, args) {
                var isTouchArea = $(e.target).closest('.mobile-menu').length > 0;
                var isInput = $(e.target).closest('input').length > 0;

                if (!isTouchArea && !isInput) {
                    setTimeout(function () {
                        self._options.doubleClick(self._model.getAbsoluteIndex(args.row));
                    });
                }
            });

            $(element).on('dwResize', self._onResize);

            //if we have no async columns, we have to set this observable to true manually
            if (!self.hasAsyncColumns()) {
                self.gridRenderComplete(true);
            }
            else {//if we do have async columns, wait for slick grid to call when rendering is complete
                self._handler.subscribe(self._grid.onAsyncCellRenderComplete, function () {
                    self.gridRenderComplete(true);
                });
            }
        };

        self.onContextMenu = function (e) {
            for (var menu in self._options.contextMenus) {
                if (self._options.contextMenus.hasOwnProperty(menu) && self._options.contextMenus[menu].onContextMenu)
                    self._options.contextMenus[menu].showAt(self._options.contextMenus[menu].onContextMenu(e));
            }
        };

        self.onViewportContextMenu = function (e) {
            self._model.selectedIndexes([]);
            for (var menu in self._options.contextMenus) {
                if (self._options.contextMenus.hasOwnProperty(menu) && self._options.contextMenus[menu].onViewportContextMenu)
                    self._options.contextMenus[menu].showAt(self._options.contextMenus[menu].onViewportContextMenu(e));
            }
        };

        self.hasAsyncColumns = function () {
            var columns = self._grid.getColumns();
            for (var i = 0; i < columns.length; i++) {
                if (columns[i].hasOwnProperty('asyncPostRender'))
                    return true;
            }
            return false;
        };

        self.initGridControl = function (gridElem, rows, columns, options) {
            return new Slick.Grid(gridElem, rows, columns, options);
        };

        self.createGridControl = function () {
            self.prepareData(function (rows, columns) {
                var gridElem = $(element).find('.dw-grid,.dw-griddle');
                if (self.isTouchEnabled) {
                    gridElem.addClass('touch');
                }
                self._grid = self.initGridControl(gridElem, rows, columns, self._options);

                self._grid.setSelectionModel(options.selectionModel);

                if (!self.isTouchEnabled) {
                    self._grid.registerPlugin(new Slick.AutoTooltips({
                        enableForHeaderCells: true
                    }));
                }

                emptyMsgEl.appendTo(self._grid.getContainerNode());
            });
        };

        self.focus = function () {
            //we set the focus only if the grid is active
            if (self._grid && self._model.active()/* && self._model.autofocus*/)
                self._grid.focus.delay(0, self);
        };

        self.attachDWScrollbar = function () {

            self._grid.getViewportNode()
                .attr('tabindex', '-1')
                .dwScrollbar({
                    scrollContent: self._grid.getCanvasNode(),
                    handleTouchEvents: !options.dragBehaviour.canDrag(),
                    fixScrollOffset: function (event, ui) {
                        this.updateScrollLeft();
                    }.bind(self._grid)
                });

            self._handler.subscribe(self._grid.onScroll, function (e) {
                this.getViewportNode().dwScrollbar('update');
            });

            self._handler.subscribe(self._grid.onColumnsResized, function (e) {
                this.getViewportNode().dwScrollbar('update');
            });

        };

        self.subscribeGridSelectionChange = function () {
            //Implement in children
        };

        self.unSubscribeGridSelectionChange = function () {
            //Implement in children
        };

        self.setModelSelectionInternal = function (e, args) {
            //detach
            if (self._selectionSubscription) self._selectionSubscription.dispose();

            //change
            self._model.selectedIndexes(self._getGridSelectionFromEvent(e, args));

            if (self._options.contextMenus.drop)
                self._options.contextMenus.drop.showAt(null);

            //attach
            self._selectionSubscription = self._model.selectedIndexes.subscribe(self.setGridSelectionInternal);
        };

        self._getGridSelectionFromEvent = function (e, args) {
            //Implement in children
        };

        self.setGridSelectionInternal = function (selectedIndexes) {
            //do not set selection while the data is loading, it will be set when the data is loaded
            if (self._model.loaddata()) return;
            if (!selectedIndexes) return;

            self.unSubscribeGridSelectionChange();

            //self.focus();//VO - removed in order for when we press pgup/pgdn in the viewer fast, to not have the grid act on them if it gets the focus

            self.setGridSelection(selectedIndexes);

            self.subscribeGridSelectionChange();
        };

        self.setGridSelection = function (selectedIndexes) {
            //Implement in children
        };

        self.getSelectedItemIndex = function (cell) {
            /// <summary>check if the currently selected item is in the selectedDocuments array</summary>
            /// if yes, return -1. if no, return the index of the item, so we could set it when needed
            /// <param name="cell" type="Object">the cell we clicked on, has row and cell attributes</param>

            //Implement in children
        };

        var unsubscribeSelection = function () {
            if (self._selectionSubscription) self._selectionSubscription.dispose();
            self.unSubscribeGridSelectionChange();
        };

        self._onLoadChange = function (loading) {
            if (loading) {
                //while data is loading there is no need to listen for selection change (vm <-> ui)
                unsubscribeSelection();
            }
            else {
                unsubscribeSelection();
                //attach again for selection change (vm <-> ui)
                self._selectionSubscription = self._model.selectedIndexes.subscribe(self.setGridSelectionInternal);
                self.subscribeGridSelectionChange();
                //...

                self._dataAdapter.updateItems();
                self.arrangeGridData();
                self.setGridSelectionInternal(self._model.selectedIndexes());
                //self.focus();
                if (!self._model.active()) resizeWhenActive = true;
            }
        };

        self.prepareData = function (callback) {
            //Implement in children
        };

        self.arrangeGridData = function () {
            //Implement in children
        };

        self.updateGridData = function (rows, columns) {
            self._grid.setData(rows, false);
            if (columns) {
                self._grid.setColumns(columns);
            }
            else {
                self._grid.render();
            }
            self.toggleEmptyMessage(rows);
            self._grid.getViewportNode().dwScrollbar('update');
        };

        //The rendering will re-render only the new element and not the whole grid as it is in case of updateGridData
        //The base implementation assumes "grid-like" layout
        self.addNewElement = function (element) {
        };

        self.resize = function () {
            self._grid.resizeCanvas();
        };

        self._onResize = function () {
            var $element = $(element),
                currSize = { height: $(element).height(), width: $(element).width() };
            //check if there is need to update the grid
            if (currSize.height > 0 && currSize.width > 0 && (lastSize.height !== currSize.height || lastSize.width !== currSize.width)) {
                lastSize = currSize;
                self._grid.getViewportNode().dwScrollbar('update');
                //var pagerH = $element.find('.dw-pager').outerHeight();
                //$element.find('.dw-grid').outerHeight(h - pagerH);
                //$element.find('.dw-griddle').outerHeight(h - pagerH);
                self.resize();
            }
        };

        self.destroy = function () {
            self.destroyInitiated(true);
        };

        self._destroyInternal = function () {
            if (self._selectionSubscription) self._selectionSubscription.dispose();

            if (self._loadingSubscription) self._loadingSubscription.dispose();

            if (self.dataViewDragProcessor) self.dataViewDragProcessor.destroy();

            self.unSubscribeGridSelectionChange();

            $(self._grid.getViewportNode()).off('contextmenu', self.onViewportContextMenu);

            self._grid.setSelectionModel();

            self._handler.unsubscribeAll();

            self.destroyGrid.dispose();
            self._grid.destroy();
            self._grid = null;

            self._dataAdapter.dispose();

            self.dispose();
            emptyMsgEl.remove();
            emptyMsgEl = null;
            $(element).off('dwResize', self._onResize);
        };

        return self;
    };

    $.extend(true, window, {
        "Slick": {
            "Formatters": {
                "fcCheckboxCell": checkboxCellFormatter,
                "fcIconsCell": iconsCellFormatter
            },
            ColumnDataTypes: {
                Text: "Text",
                Numeric: "Numeric",
                Date: "Date",
                DateTime: "DateTime"
            },
            "RowMetadataID": "RowMetadataID" + (new Date()).getTime().toString()
        }
    });
    function basicCellFormatter(cellNode, cell, row, dataContext, colDef, template) {
        if (!dataContext[Slick.RowMetadataID]) {
            cellNode.outerHTML = '';
            return;
        }
        cellNode.innerHTML = template;
        ko.applyBindings(dataContext[Slick.RowMetadataID], cellNode);
    };

    function iconsCellFormatter(cellNode, cell, row, dataContext, colDef) {
        basicCellFormatter(cellNode, cell, row, dataContext, colDef, '<!-- ko template:\'iconsGridCell\' --><!--/ko -->');
    };

    function checkboxCellFormatter(cellNode, cell, row, dataContext, colDef) {
        basicCellFormatter(cellNode, cell, row, dataContext, colDef, '<!-- ko template:\'checkboxGridCell\' --><!--/ko -->');
    };

    //PerformanceCounter = new DW.Diagnostics.PerformanceCounterPrototype();

    GridDataViewBehaviour = function (element, model, options) {
        var self = new BaseDataViewBehaviour(element, model, options);

        $.extend(self._options, {
            explicitInitialization: true,
            rowHeight: 32,
            headerRowHeight: 25,
            fullWidthRows: true,//thought it could resize the columns if there is more space
            multiColumnSort: true,
            syncColumnCellResize: true,//not documented option which resizes the whole column
            //forceFitColumns: true,
            enableAsyncPostRender: true,
            asyncPostRenderDelay: 0,
            enableCellNavigation: true,
            onClick: null,
            doubleClick: null,
            defaultColumnWidth: 80
        }, options, {
                doubleClick: function (index) {
                    options.doubleClick({
                        index: index
                    });
                }
            });

        var baseInit = self._init;
        self._init = function () {
            baseInit();

            self.resize();

            self.isTouchEnabled = DW.Utils.isTouchEnabled();

            //if (!self.isTouchEnabled) {
            //    self._grid.registerPlugin(new Slick.AutoTooltips({
            //        enableForHeaderCells: true
            //    }));
            //}

            self._handler.subscribe(self._grid.onClick, function (e, args) {
                if (self._options.onClick) {
                    self._options.onClick(self._model.getAbsoluteIndex(args.row), e, args);
                }
                if ($(e.target).hasClass('dw-icon-filetype')) {
                    setTimeout(function () {
                        self._options.doubleClick(self._model.getAbsoluteIndex(args.row));
                    });
                }
                else if ($(e.target).hasClass('dw-icon-mobile-menu') && self._options.contextMenus.document) {
                    self._options.contextMenus.document.showAt(e);
                }
            });

            self._handler.subscribe(self._grid.onDblClick, function (e, args) {
                self._options.doubleClick(self._model.getAbsoluteIndex(args.row));
            });

            self._handler.subscribe(self._grid.onHeaderResizeAreaDoubleClick, function (e, args) {
                self._setMaxColumnWidth(args.column.id);
            });

            self._setGridSortOrder(self._model.sortOrder());
            self._sortOrderSubscription = self._model.sortOrder.subscribe(self._setGridSortOrder);

        };

        self.addNewElement = function (item) {
            self._grid.updateRowCount();
            self._grid.render();

            var row = self._grid.getDataLength() - 1;

            self._grid.setSelectedRows([row]);
            self._grid.getViewportNode().dwScrollbar('update');
            self._grid.scrollRowIntoView(row || 0);

            item.onItemReady();
        };

        self.getColumns = function (columns, options) {
            var cols = columns.slice(0, -1)
                .each(function (column) {
                    column.width = column.width || options.defaultColumnWidth;
                });
            cols.push(columns[columns.length - 1]);
            return cols;
        };

        var baseinitGridControl = self.initGridControl;
        self.initGridControl = function (gridElem, rows, columns, options) {
            self._setInitialColumnWidths(columns);
            return baseinitGridControl(gridElem, rows, self.getColumns(columns, options), options);
        };

        self._setInitialColumnWidths = function (columns) {
            columns.forEach(function (column) {
                var headerWidth = self._getColumnWidthFromText(column.name, "slick-header-column-helper");
                var dataWidth = column.width || 0;
                if (!column.hasOwnProperty("resizable")) {
                    switch (column.dataType) {
                        case (Slick.ColumnDataTypes.Date):
                        case (Slick.ColumnDataTypes.DateTime):
                        case (Slick.ColumnDataTypes.Numeric): {
                            dataWidth = self._calculateMaxColumnWidth(column.id);
                            break;
                        }
                        case (Slick.ColumnDataTypes.Text): dataWidth = 150; break;
                    }
                }
                column.width = Math.max(headerWidth, dataWidth);
            });
        };

        self.subscribeGridSelectionChange = function () {
            self._grid.onSelectedRowsChanged.subscribe(self.setModelSelectionInternal);
        };

        self.unSubscribeGridSelectionChange = function () {
            self._grid.onSelectedRowsChanged.unsubscribe(self.setModelSelectionInternal);
        };

        self._getGridSelectionFromEvent = function (e, args) {
            return args.rows;
        };

        self.setGridSelection = function (selectedIndexes) {
            //self._grid.setActiveCell(selectedIndexes[0] || 0, 0);
            self._grid.setSelectedRows(selectedIndexes);
        };

        self.getSelectedItemIndex = function (cell) {
            var result = -1;//do not change the selection if we are not sure what we have in the cell
            if (cell) {
                if ($.inArray(cell.row, self._grid.getSelectedRows()) == -1) //current row is not selected (not found in selected indexes)
                    result = cell.row;
            }
            return result;
        };

        self.prepareData = function (callback) {
            callback(self._dataAdapter.items, self._dataAdapter.columns);
        };

        self._setMaxColumnWidth = function (columnId) {
            //do not calculate while the data is loading, it will be set when the data is loaded
            if (self._model.loaddata()) return;

            var columns = self._grid.getColumns();
            for (var i = 0; i < columns.length - 1; i++) {
                if (columns[i].id == columnId) {
                    if (columns[i].resizable == false) return;
                    var headerWidth = self._getColumnWidthFromText(columns[i].name, "slick-header-column-helper");
                    var maxWidth = Math.max(self._calculateMaxColumnWidth(columnId), headerWidth);
                    columns[i].width = maxWidth;
                    break;
                }
            }
            var finalColumns = self._calculateColumnsWidth(columns) || columns;
            self._grid.setColumns(finalColumns);
        };

        self._calculateMaxColumnWidth = function (columnId) {
            if ($(element).parents().is(":hidden")) return 0;

            var maxColumnWidth = 0;
            var rowsVM = self._dataAdapter.items;
            for (var i = 0; i < rowsVM.length; i++) {
                var currentCellText = rowsVM[i][columnId] ? rowsVM[i][columnId].toString() : "";
                var currentWidth = 0;
                if (currentCellText.length > 0) {
                    var cssClass = "slick-cell";
                    if (rowsVM[i].hasOwnProperty("isRead") && !rowsVM[i].isRead()) {
                        cssClass += " ui-bold";
                    }
                    currentWidth = self._getColumnWidthFromText(currentCellText, cssClass);
                    if (currentWidth > maxColumnWidth) {
                        maxColumnWidth = currentWidth;
                    }
                }
            }
            return maxColumnWidth;
        };

        self._getColumnWidthFromText = function (text, cssClass) {
            var $textwidth = $('<div class="' + cssClass + '" style="position: absolute; top: 0; left: 0; visibility: hidden"><div>').appendTo('body');
            $textwidth.text(text);
            var maxWidth = $textwidth.outerWidth() + 10;
            $textwidth.remove();

            return maxWidth;
        };

        var baseresize = self.resize;
        self.resize = function () {
            self._grid.setViewportDimensions();
            var cols = self._calculateColumnsWidth(self._grid.getColumns());
            if (cols)
                self._grid.setColumns(cols);
            else
                baseresize();
        };

        self._calculateColumnsWidth = function (columns) {
            //Don't set columns width while data is loading
            if (self._model.loaddata() || columns.length == 0) return;

            var viewport = self._grid.getViewport(),
                gridViewportNode = self._grid.getViewportNode(),
                gridWidth = gridViewportNode.width(),
                visibleRows = (viewport.bottomPx - viewport.topPx) / viewport.rowHeight,
                totalRows = self._dataAdapter.items.length,
                lastColumn = columns.getLast(),
                lastColumnWidth = 0,
                totalWidth = 0;

            for (var i = 0, cl = columns.length - 1; i < cl; i++) {
                totalWidth += columns[i].width;
            }

            if (totalRows > visibleRows) {
                gridWidth -= DW.Utils.getScrollbarSize().width;
            }

            if (totalWidth < gridWidth) {
                lastColumnWidth = gridWidth - totalWidth;
            }

            if (lastColumnWidth != lastColumn.width) {
                lastColumn.width = lastColumnWidth;
                return columns;
            }

            return;
        };

        self._setGridSortOrder = function (newSortSettings) {
            /// <summary>make the grid designate the columns by which we are sorting at the start.
            /// That is, if those columns are visible. If they are not, we just show nothing</summary>
            /// <param name="newSortSettings" type="Object">the sort columns we want to be displayed</param>

            //detach
            self._grid.onSort.unsubscribe(self._setModelSortOrder);

            //change
            var res = [],
                currentGridColumns = self._grid.getColumns();

            $.each(newSortSettings || [], function (index, sortSetting) {
                var currentSetting = sortSetting,
                    sortingByVisibleColumn = currentGridColumns.some(function (column) {
                        return column.field == currentSetting.Field;
                    });

                if (!sortingByVisibleColumn) return false; //<=> break

                res.push({ columnId: sortSetting.Field, sortAsc: sortSetting.Direction === "Asc" ? true : false });

            });
            self._grid.setSortColumns(res);

            //attach
            self._grid.onSort.subscribe(self._setModelSortOrder);
        };

        self._setModelSortOrder = function (e, args) {
            //do not sort while the data is loading, it will be set when the data is loaded
            if (self._model.loaddata()) {//set back the original sort
                self._setGridSortOrder(self._model.sortOrder());
                return;
            }
            //detach
            if (self._sortOrderSubscription) self._sortOrderSubscription.dispose();

            //change
            var res = [];
            $.each(args.sortCols || [], function (index, sortColumn) {
                res.push({ Field: sortColumn.sortCol.id, Direction: sortColumn.sortAsc === true ? "Asc" : "Desc" });
            });
            self._model.sortOrder(res);

            //attach
            self._sortOrderSubscription = self._model.sortOrder.subscribe(self._setGridSortOrder);
        };

        self.arrangeGridData = function () {
            self.prepareData(function (rows, columns) {
                self.updateGridData(rows, self._calculateColumnsWidth(self._grid.getColumns()));
                //call this always as there might be scrollbar which can disapear so we need to recalc the columns            
            });
        };

        var destroyBase = self.destroy;
        self.destroy = function () {
            if (self._sortOrderSubscription) self._sortOrderSubscription.dispose();
            if (self._grid && self._grid.onSort) self._grid.onSort.unsubscribe(self._setModelSortOrder);
            destroyBase.call(self);
        };

        return self;
    };

    ko.bindingHandlers.simpleSlickGrid = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var $element = $(element);
            var model = ko.utils.unwrapObservable(valueAccessor());
            var options = ko.utils.unwrapObservable(allBindingsAccessor().gridOptions) || {};
            options = $.extend(options, { selectionModel: new Slick.RowSelectionModel(), bindingContext: bindingContext })

            var gridBehaviour = $element.data("GridDataViewBehaviour");
            if (!gridBehaviour) {
                $element.data("GridDataViewBehaviour", (gridBehaviour = new GridDataViewBehaviour(element, model, options)));
                gridBehaviour.init();
            }

            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                var $element = $(element);
                var gridBehaviour = $element.data("GridDataViewBehaviour");
                if (gridBehaviour) {
                    gridBehaviour.destroy();
                    $element.removeData("GridDataViewBehaviour");
                }
            });
        }
    };

})(jQuery, ko);