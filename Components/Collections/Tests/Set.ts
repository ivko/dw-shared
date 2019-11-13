/// <reference path="../../../Scripts/Typescript/lib/qunit/qunit.d.ts" />
/// <chutzpah_reference path="../Set.js" />

QUnit.module("Set", (hooks) => {
    let self: {
        set: DWTS.ISet<number>
    };
    hooks.beforeEach(() => {
        self = {
            set: new DWTS.Set<number>([1, 2])
        }
    });

    QUnit.module("constructor", (hooks) => {
        QUnit.test('["a", "b"] / ["a", "b"] / values', (assert) => {
            let values = ["a", "b"],
                set = new DWTS.Set<string>(["a", "b"]);
            assert.deepEqual(set.values(), values);
        });
    });

    QUnit.module("add", (hooks) => {
        QUnit.test('already contained value / values are unchanged / values', (assert) => {
            let initialValues = self.set.values().slice(0),
                existingValue = self.set.values()[0];
            self.set.add(existingValue);
            assert.deepEqual(self.set.values(), initialValues);
        });

        QUnit.test('not contained value / the new value is added / values', (assert) => {
            let newValue = 3;
            self.set.add(newValue);
            assert.ok(self.set.values().indexOf(newValue) > -1);
        });

        QUnit.test('not contained value added twice / the new value is added once / values', (assert) => {
            let newValue = 3,
                valuesAfterTheFirstAdding;

            self.set.add(newValue);
            assert.ok(self.set.values().indexOf(newValue) > -1);
            valuesAfterTheFirstAdding = self.set.values().slice(0);

            self.set.add(newValue);
            assert.deepEqual(self.set.values(), valuesAfterTheFirstAdding);
        });
    });

    QUnit.module("has", (hooks) => {
        QUnit.test('contained value / true', (assert) => {
            assert.ok(self.set.has(1));
        });

        QUnit.test('not contained value / false / values', (assert) => {
            assert.notOk(self.set.has(10));
        });
    });
});