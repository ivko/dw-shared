/// <reference path="../../Scripts/Typescript/lib/qunit/qunit.d.ts" />
/// <chutzpah_reference path="../Range.js" />

QUnit.module("Range", (hooks) => {
    let self: {
        start: number,
        end: number,
        range: DWTS.IRange
    };

    hooks.beforeEach(() => {
        let start = 1,
            end = 2;

        self = {
            start,
            end,
            range: new DWTS.Range(start, end)
        };
    });

    QUnit.module("constructor", (hooks) => {
        QUnit.test('* / values set / getStart, getEnd', (assert) => {
            let start = 1.2,
                end = 1.3,
                range = new DWTS.Range(start, end);

            assert.equal(range.getStart(), start);
            assert.equal(range.getEnd(), end);
        });
    });

    QUnit.module("equals", (hooks) => {
        QUnit.test('itself / true', (assert) => {
            assert.ok(self.range.equals(self.range));
        });

        QUnit.test('* / false', (assert) => {
            let range = new DWTS.Range(2, 3);

            assert.notOk(range.equals(self.range));
        });

        QUnit.test('* / true', (assert) => {
            let range = new DWTS.Range(self.start, self.end);

            assert.ok(range.equals(self.range));
        });

        QUnit.test('* / true', (assert) => {
            let firstRange = new DWTS.Range(1.2000004, 2.000005),
                secondRange = new DWTS.Range(1.2000004, 2.000005);

            assert.ok(firstRange.equals(secondRange));
        });

        QUnit.test('* / false', (assert) => {
            let firstRange = new DWTS.Range(1.2000004, 2.000005),
                secondRange = new DWTS.Range(1.2000004, 2.000006);

            assert.notOk(firstRange.equals(secondRange));
        });
    });

    QUnit.module("isSubrange", (hooks) => {
        QUnit.test('itself / true', (assert) => {
            assert.ok(self.range.isSubrange(self.range));
        });

        QUnit.test('* / false', (assert) => {
            let range = new DWTS.Range(2, 3);

            assert.notOk(range.isSubrange(self.range));
            assert.notOk(self.range.isSubrange(range));
        });

        QUnit.test('* / true', (assert) => {
            let range = new DWTS.Range(self.start, self.end);

            assert.ok(range.isSubrange(self.range));
        });

        QUnit.test('* / true', (assert) => {
            let firstRange = new DWTS.Range(1.2000004, 2.000005),
                secondRange = new DWTS.Range(1.2000004, 2.000005);

            assert.ok(firstRange.isSubrange(secondRange));
        });

        QUnit.test('* / false', (assert) => {
            let firstRange = new DWTS.Range(1.2000004, 2.000005),
                secondRange = new DWTS.Range(1.2000004, 2.000006);

            assert.ok(firstRange.isSubrange(secondRange));
            assert.notOk(secondRange.isSubrange(firstRange));
        });

        QUnit.test('* / false', (assert) => {
            let firstRange = new DWTS.Range(1.2000004, 2.000005),
                secondRange = new DWTS.Range(1.2000003, 2.000005);

            assert.ok(firstRange.isSubrange(secondRange));
            assert.notOk(secondRange.isSubrange(firstRange));
        });
    });

    QUnit.module("getCount", (hooks) => {
    });
});