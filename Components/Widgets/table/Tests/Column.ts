/// <reference path="../../../../Scripts/Typescript/lib/qunit/qunit.d.ts" />
/// <chutzpah_reference path="../../../ViewModels/TS/Disposable.js" />
/// <chutzpah_reference path="../../../ViewModels/TS/ViewModel.js" />
/// <chutzpah_reference path="../Scripts/Column.js" />
/// <reference path="../Scripts/Column.ts" />

QUnit.module("SortDirection", (hooks) => {
    interface ISortDirectionModule {
        value: number;
        css: string;
        sortDirection: DWTS.SortDirection;
    }

    let self: ISortDirectionModule;

    hooks.beforeEach(() => {
        let value = 0,
            css = 'dw-icon-sort';
        self = {
            value,
            css,
            sortDirection: new DWTS.SortDirection(value, css),
        }
    });

    QUnit.module('getValue', () => {
        QUnit.test('* / initial value', (assert) => {
            assert.equal(self.sortDirection.getValue(), self.value);
        });
    });

    QUnit.module('getCss', () => {
        QUnit.test('* / initial value', (assert) => {
            assert.equal(self.sortDirection.getCss(), self.css);
        });
    });

    QUnit.module('setCss', () => {
        //TODO: strict null check should be used
        //TODO: setCss should accept only a defined list of entries
        QUnit.test('desc ui-icon-triangle-1-s / desc ui-icon-triangle-1-s / getCss', (assert) => {
            let css = 'desc ui-icon-triangle-1-s';
            self.sortDirection.setCss(css)
            assert.equal(self.sortDirection.getCss(), css);
        });
    });

    QUnit.module('equals', () => {
        QUnit.test('itself / true', (assert) => {
            assert.ok(self.sortDirection.equals(self.sortDirection));
        });

        QUnit.test('new SortDirection with custom value / true', (assert) => {
            assert.ok(
                self.sortDirection.equals(
                    new DWTS.SortDirection(self.value, self.css)));
        });

        QUnit.test('new SortDirection with value 1 / false', (assert) => {
            assert.notOk(
                self.sortDirection.equals(new DWTS.SortDirection(1, self.css)));
        });
    });

    QUnit.module('isNone', () => {
        QUnit.test('predefined none / true', (assert) => {
            assert.ok(DWTS.SortDirection.SORT_DIRECTIONS.none.isNone());
        });

        QUnit.test('predefined asc / false', (assert) => {
            assert.notOk(DWTS.SortDirection.SORT_DIRECTIONS.asc.isNone());
        });

        QUnit.test('predefined desc / false', (assert) => {
            assert.notOk(DWTS.SortDirection.SORT_DIRECTIONS.desc.isNone());
        });

        QUnit.test('custom / true', (assert) => {
            assert.ok(self.sortDirection.isNone());
        });

        QUnit.test('new SortDirection with value 1 / false', (assert) => {
            assert.notOk(new DWTS.SortDirection(1, self.css).isNone());
        });
    });

    QUnit.module('isAsc', () => {
        QUnit.test('predefined none / false', (assert) => {
            assert.notOk(DWTS.SortDirection.SORT_DIRECTIONS.none.isAsc());
        });

        QUnit.test('predefined asc / true', (assert) => {
            assert.ok(DWTS.SortDirection.SORT_DIRECTIONS.asc.isAsc());
        });

        QUnit.test('predefined desc / false', (assert) => {
            assert.notOk(DWTS.SortDirection.SORT_DIRECTIONS.desc.isAsc());
        });

        QUnit.test('custom / false', (assert) => {
            assert.notOk(self.sortDirection.isAsc());
        });

        QUnit.test('new SortDirection with value 1 / true', (assert) => {
            assert.ok(new DWTS.SortDirection(1, self.css).isAsc());
        });
    })

    QUnit.module('isDesc', () => {
        QUnit.test('predefined none / false', (assert) => {
            assert.notOk(DWTS.SortDirection.SORT_DIRECTIONS.none.isDesc());
        });

        QUnit.test('predefined asc / false', (assert) => {
            assert.notOk(DWTS.SortDirection.SORT_DIRECTIONS.asc.isDesc());
        });

        QUnit.test('predefined desc / true', (assert) => {
            assert.ok(DWTS.SortDirection.SORT_DIRECTIONS.desc.isDesc());
        });

        QUnit.test('custom / false', (assert) => {
            assert.notOk(self.sortDirection.isDesc());
        });

        QUnit.test('new SortDirection with value 1 / false', (assert) => {
            assert.notOk(new DWTS.SortDirection(1, self.css).isDesc());
        });
    })
});

QUnit.module("Column", (hooks) => {
    interface IColumnModule {
        name: string;
        sortBy: string;
        sortDirection: DWTS.ISortDirection;
        sortDirection2: DWTS.ISortDirection;
        column: DWTS.IColumn;
        columnWithSortBy: DWTS.IColumn;
        columnWithSortDirection: DWTS.IColumn;
    }

    let self: IColumnModule;
 
    hooks.beforeEach(() => {
        let name = 'column',
            sortDirection = {
                getValue: () => 0,
                setCss: (css: string) => { },
                getCss: () => 'css',
                equals: (direction: DWTS.ISortDirection) => false,
                isNone: () => true,
                isAsc: () => false,
                isDesc: () => false
            },
            sortBy = 'property',
            sortDirection2 = sortDirection;

        sortDirection2.getValue = () => 1;
         
        self = {
            name,
            sortBy,
            sortDirection,
            sortDirection2,
            column: new DWTS.Column(name),
            columnWithSortBy: new DWTS.Column(name, sortBy),
            //TODO: make only the SORT_DIRECTIONS allowed
            columnWithSortDirection: new DWTS.Column(name, sortBy, sortDirection)
        }
    });

    QUnit.module('getName', () => {
        QUnit.test('* / initial value', (assert) => {
            assert.equal(self.column.getName(), self.name);
        });
    });

    QUnit.module('changeSortDirection', () => {
        QUnit.test('when default / sort direction changed / getSortDirection', (assert) => {
            let sortDirection = self.column.getSortDirection();
            self.column.changeSortDirection();
            assert.notDeepEqual(sortDirection, self.column.getSortDirection());
        });

        QUnit.test('twice, initially ascending / changed twice / getSortDirection', (assert) => {
            //TODO: change the structure to make it possible not to use the predefined sort directions here
            let column = new DWTS.Column(self.name, self.sortBy, DWTS.SortDirection.SORT_DIRECTIONS.asc);
            column.changeSortDirection();
            assert.deepEqual(column.getSortDirection(), DWTS.SortDirection.SORT_DIRECTIONS.desc);
            column.changeSortDirection();
            assert.deepEqual(column.getSortDirection(), DWTS.SortDirection.SORT_DIRECTIONS.asc);
        });
    });

    QUnit.module('getSortBy', () => {
        QUnit.test('when default / undefined', (assert) => {
            assert.equal(self.column.getSortBy(), undefined);
        });

        QUnit.test('when initial / undefined', (assert) => {
            assert.equal(self.columnWithSortBy.getSortBy(), self.sortBy);
        });
    });

    QUnit.module('setSortBy', () => {
        QUnit.test('when default / value updated / getSortBy', (assert) => {
            self.column.setSortBy(self.sortBy);
            assert.equal(self.column.getSortBy(), self.sortBy);
        });

        QUnit.test('when initial / value updated / getSortBy', (assert) => {
            let newSortBy = 'asdf';
            self.columnWithSortBy.setSortBy(newSortBy);
            assert.equal(self.columnWithSortBy.getSortBy(), newSortBy);
        });
    });

    QUnit.module('getSortDirection', () => {
        QUnit.test('* / initial value', (assert) => {
            assert.deepEqual(self.columnWithSortDirection.getSortDirection(), self.sortDirection);
        });
    });

    QUnit.module('setSortDirection', () => {
        QUnit.test('when default / value changed / getSortDirection', (assert) => {
            self.column.setSortDirection(self.sortDirection);
            assert.deepEqual(self.column.getSortDirection(), self.sortDirection);
        });

        QUnit.test('when initial / value changed / getSortDirection', (assert) => {
            self.columnWithSortDirection.setSortDirection(self.sortDirection2);
            assert.deepEqual(self.columnWithSortDirection.getSortDirection(), self.sortDirection2);
        });

        QUnit.test('twice when initial / value changed twice / getSortDirection', (assert) => {
            let column = new DWTS.Column(self.name, self.sortBy, self.sortDirection2);
            self.column.setSortDirection(self.sortDirection);
            assert.deepEqual(self.column.getSortDirection(), self.sortDirection);
            self.column.setSortDirection(self.sortDirection2);
            assert.deepEqual(self.column.getSortDirection(), self.sortDirection2);
        });
    });

    QUnit.module('getCss', () => {
        QUnit.test('* / initial value', (assert) => {
            assert.equal(self.columnWithSortDirection.getCss(), self.sortDirection.getCss());
        });
    });
});