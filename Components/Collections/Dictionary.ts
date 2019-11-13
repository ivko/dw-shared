namespace DWTS {
    export interface IDictionary<T> {
        add(key: string, value: T): void;
        remove(key: string): void;
        containsKey(key: string): boolean;
        keys(): Array<string>;
        values(): Array<T>;
    }

    export class Dictionary<T> implements IDictionary<T> {
        constructor(init: { key: string; value: T; }[]) {
            for (var x = 0; x < init.length; x++) {
                this[init[x].key] = init[x].value;
            }
        }

        add(key: string, value: T): void {
            this[key] = value;
        }

        remove(key: string): void {
            delete this[key];
        }

        keys(): Array<string> {
            return Object.keys(this);
        }

        values(): Array<T> {
            let values = new Array<T>();
            _.forEach(Object.keys(this), (key) => {
                values.push(this[key]);
            });

            return values;
        }

        containsKey(key: string): boolean {
            return this.hasOwnProperty(key);
        }

        toLookup(): IDictionary<T> {
            return this;
        }
    }
}