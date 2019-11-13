namespace DWTS.Interfaces.Tables {

    export interface ProcesssedItemsOptions {
        scrollToRow?: boolean,
        keepSelection?: boolean,
        setActive?: boolean
    }

    export interface ProcesssedItemsData<T> {
        items: T[],
        options?: DWTS.Interfaces.Tables.ProcesssedItemsOptions
    }

    export interface ITableData<T> {
        isVirtual?: boolean;
        getColumns: () => { [id: string]: IColumn };
        setProcessedItems: (items: T[], processedItemsOptions?: ProcesssedItemsOptions) => void;
        getProcessedItems: (items?: T[]) => JQueryPromise<ProcesssedItemsData<T>>;
        getItems: (items?: T[]) => T[];
        getItemsSilent: () => T[];
        setItems: (items: T[], append?: boolean) => JQueryPromise<void>;
        loadItems?: (query: DWTS.Interfaces.Tables.ITableDataProviderQuery) => JQueryPromise<T[]>;
    }

    export interface ITableDataProvider<T> extends DWTS.Interfaces.Tables.ITableData<T> {     
        items: KnockoutObservableArray<T>;
        processedItemsData: KnockoutObservable<DWTS.Interfaces.Tables.ProcesssedItemsData<T>>;
        getCount(): number;
        finalCountFound: boolean;
        reset(): void;
        columns: { [id: string]: IColumn };
        isEmpty(): boolean;
    }

    //export interface ITableBehaviours<T> {
    //    sortable: DWTS.Interfaces.Tables.IDefaultTableSortBehaviourVM<T>;
    //    filterable: DWTS.Interfaces.Tables.IDefaultTableFilterBehaviourVM<T>;
    //}

    export interface ITableParams<T> {
        items?: KnockoutObservableArray<T>;
        options?: DWTS.Interfaces.Tables.IBaseTableOptions<T>;
    }
    export interface IVirtualTableParams<T> {
        items?: KnockoutObservableArray<T>;
        options?: DWTS.Interfaces.Tables.IVirtualTableOptions<T>;
    }

    export interface IBaseTableOptions<T> {
        manageSelection?: boolean;
        multiSelection?: boolean;
        columns?: { [id: string]: IColumn };
        behaviours?: {
            sortable?: boolean,
            filterable?: boolean
        };
        behaviourOptions?: {
            sortable?: ISortTableBehaviourOptions<T>,
            filterable?: IFilterTableBehaviourOptions<T>
        }
        //------------TODO: try to use array with modes
    }

    export interface ITableBehaviourVM<T> extends IBusyTrigger, ITableData<T> {
        update(): JQueryPromise<any>;
    }

    export interface ISortableBehaviour<T> {
        update: () => JQueryPromise<any>;
        getSortedItems: (items?: T[]) => JQueryPromise<T[]>;
        sortBy: (columnName: string, sortDirection?: ISortDirection) => void;
        getSortableColumns: () => { [id: string]: IColumn };
        setSelectedSortableColumns: (columns: IColumn[]) => void;
        setSelectedSortableColumnsWithoutUpdate(columns: IColumn[]): void;
        getSelectedSortableColumns: () => IColumn[];
        hasSelectedSortableColumn: () => boolean;
        getSortTrigger: (columnName: string) => () => void;
        getSortCss: (property: any, provideDefaultIcon?: boolean) => string;
    }

    export interface IFilterBehaviour<T> {
        filterText: KnockoutObservable<any>; //TODO: remove somehow
        filterKey: KnockoutObservable<string>; //TODO: remove somehow
        getFilteredItems: (items?: T[]) => T[];
        getCategoryFilters: () => Array<{ key: string, displayName: string }>,
        clearFilter: () => void;
    }

    export interface IDefaultTableSortBehaviourVM<T> extends ITableData<T>, ITableBehaviourVM<T>, ISortableBehaviour<T> {
        // init: () => void;
    }

    export interface IDefaultTableFilterBehaviourVM<T> extends ITableData<T>, ITableBehaviourVM<T>, IFilterBehaviour<T> {
        filterExternalFn: KnockoutObservable<(value: T, index: number, array: T[]) => boolean>;
    }

    export interface IBaseTableAdapterOptions<T> { }

    export interface ISortTableBehaviourOptions<T> extends IBaseTableAdapterOptions<T> {
        sort?: (items: any[], sortBy: string, sortDir: number) => JQueryPromise<any[]>;
    }

    export interface IFilterTableBehaviourOptions<T> extends IBaseTableAdapterOptions<T> {
        filterProperty?: any,
        filterText?: string,
        filterKey?: string,
        categoryFilters?: Array<{ key: string, displayName: string, filter?: (item: T) => boolean }>
    }

    export interface IVirtualTableOptions<T> extends IBaseTableOptions<T> {
        preloadCount?: number,
        delay?: number,
        scrollView?: any,
        loadItems?: (query: DWTS.Interfaces.Tables.ITableDataProviderQuery) => JQueryPromise<DWTS.Interfaces.Tables.ITableDataProviderResult<T>>;
    }




    export interface ITableDataProviderQuery {
        range?: IRange;
        filter?: ITableFilterQuery;
        sortByColumn?: IColumn;
    }

    export interface ITableFilterQuery {
        filterBy?: string,
        filterText?: string
    }

    export interface ITableDataProviderResult<T> {
        items: T[],
        count: number
    }

    export interface ITable<T> extends ITableData<T>, ISortableBehaviour<T>, IFilterBehaviour<T> {
        items: KnockoutObservableArray<T>;
        rows: KnockoutObservableArray<T>;
        type: TableType;
        //init: (setRows: (rows: T[], keepSelection: boolean) => void) => void;
        activeRow: KnockoutObservable<T>;
        manageSelection(shouldManage: boolean): void;
        setItems(items: T[], append?: boolean): JQueryPromise<void>;
        getItems(): T[];
        getItemsSilent(): T[];
        empty(): T[];
        addItem(item: T): void;
        removeItem(item: T): void;
        clearSelection(): void;
        setSelection(row: T, isSelected: boolean): void;
        changeSelection(row: T, evt: MouseEvent): boolean;
        isRowSelected(row: T): boolean;
        setActiveRow(row: T, scrollToRow?: boolean): void;
        setActiveRowByID(findItem: (items: T[]) => T): void;
        isEmpty(): boolean;
        selectNextAvailableRow(lastActiveRowIndex: number, scrollToRow: boolean): void;
        getColumnsCount(): number;
        update(): JQueryPromise<any>;
        dispose(): void;
    }

    export interface IVirtualTable<T> extends ITable<T> {
        topOffset: KnockoutObservable<number>;
        bottomOffset: KnockoutObservable<number>;
        reloadItems(rowIndex?: number, scrollToRow?: boolean): JQueryPromise<void>;
        visibleRows: KnockoutObservableArray<T>;
        onVisibleRowsChange(callback): void;
        reset(): void;
        resetScroll(): void;
        setRowHeight(height: number): void;
        computeVisiblePages(): JQueryPromise<void>;
        scroll(offset: number): void;
        setScroll(offset: number): void;
        resize(size: any): void;
        precalculateScroll(page: number);   
    }

}  