namespace DWTS {

    export interface ISortDirection {
        getValue(): number;
        setCss(css: string): void;
        getCss(): string;
        equals(direction: ISortDirection);
        isNone(): boolean;
        isAsc(): boolean;
        isDesc(): boolean;
    }

    export class SortDirection implements ISortDirection {
        public static readonly SORT_DIRECTIONS = {
            asc: new SortDirection(1, 'asc ui-icon-triangle-1-n'),
            desc: new SortDirection(-1, 'desc ui-icon-triangle-1-s'),
            none: new SortDirection(0, 'dw-icon-sort')
        };

        constructor(private value: number, private css: string) { }

        public getValue(): number {
            return this.value;
        }

        public setCss(css: string): void {
            this.css = css;
        }

        public getCss(): string {
            return this.css;
        }

        public equals(direction: ISortDirection) {
            return DW.Utils.isEqual(this.value, direction.getValue());
        }

        public isNone(): boolean {
            return this.equals(SortDirection.SORT_DIRECTIONS.none);
        }

        public isAsc(): boolean {
            return this.equals(SortDirection.SORT_DIRECTIONS.asc);
        }

        public isDesc(): boolean {
            return this.equals(SortDirection.SORT_DIRECTIONS.desc);
        }
    }

    export interface IColumn {
        sortDirection: KnockoutObservable<ISortDirection>;

        getName: () => string;
        getSortBy: () => string | undefined;
        getSortDirection: () => ISortDirection;
        setSortBy: (sortBy: string) => void;
        setSortDirection: (sortDirection: ISortDirection) => IColumn;
        changeSortDirection: () => void;
        getCss: () => string;
    }

    export class Column extends DWTS.ViewModel implements IColumn {
        private sortBy: string | undefined;
        public sortDirection: KnockoutObservable<ISortDirection> = ko.observable(getDummySortDirection());

        constructor(
            private name: string | KnockoutObservable<string> | (() => string),
            sortBy?: string,
            sortDirection: ISortDirection = SortDirection.SORT_DIRECTIONS.none) {
            super();

            this.setSortBy(sortBy);
            this.setSortDirection(sortDirection);
        }

        public getName(): string {
            return this.isFunction(this.name) ? this.name() : this.name;
        }

        private isFunction(x: string | KnockoutObservable<string> | (() => string)): x is KnockoutObservable<string> | (() => string) {
            return $.isFunction((x));
        }

        public changeSortDirection(): void {
            if (this.sortDirection().equals(SortDirection.SORT_DIRECTIONS.none)) {
                this.setSortDirection(SortDirection.SORT_DIRECTIONS.asc);
            } else {
                this.invertSortDirection();
            }
        }

        public getSortBy(): string | undefined {
            return this.sortBy;
        }

        public setSortBy(sortBy: string | undefined): void {
            this.sortBy = sortBy;
        }

        public getSortDirection(): ISortDirection {
            return this.sortDirection();
        }

        public setSortDirection(sortDirection: ISortDirection = SortDirection.SORT_DIRECTIONS.asc): IColumn {
            this.sortDirection(sortDirection);

            return this;
        }

        public getCss(): string {
            return this.sortDirection().getCss();
        }

        private invertSortDirection(): void {
            this.setSortDirection(
                this.getInvertedSortDirection(this.sortDirection()));
        }

        private getInvertedSortDirection(sortDirection: ISortDirection) {
            let invertedSortDirection;
            if (sortDirection.equals(SortDirection.SORT_DIRECTIONS.asc)) {
                invertedSortDirection = SortDirection.SORT_DIRECTIONS.desc;
            } else if (sortDirection.equals(SortDirection.SORT_DIRECTIONS.desc)) {
                invertedSortDirection = SortDirection.SORT_DIRECTIONS.asc
            }
            return invertedSortDirection;
        }
    }

    export class FakeColumn extends Column {
        public constructor() { super(''); }
        public getName(): string { return ''; }
        public changeSortDirection(): void { }
        public getSortBy(): string { return ''; }
        public setSortBy(sortBy: string): void { }
        public setSortDirection(sortDirection: ISortDirection = SortDirection.SORT_DIRECTIONS.asc): IColumn { return this; }
        public getCss(): string { return ''; }
    }

    export function getDummySortDirection(): ISortDirection {
        return SortDirection.SORT_DIRECTIONS.none;
    }
}
