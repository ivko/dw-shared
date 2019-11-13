namespace DWTS {

    export interface ISet<T> {
        values(): T[];
        add(value: T): void;
        has(value: T): boolean;
        forEach(callbackfn: (value: T, index: number, array: T[]) => void, thisArg?: any): void;
        some(callbackfn: (value: T, index: number, array: T[]) => boolean, thisArg?: any): boolean;
    }

    export class Set<T> implements ISet<T> {
        constructor(private entries: T[] = []) {}

        public values(): T[] {
            return this.entries;
        }

        public add(value: T) {
            if (!this.has(value)) {
                this.entries.push(value);
            }
        }

        public has(value: T): boolean {
            return this.entries.indexOf(value) != -1;
        }

        public forEach(callbackfn: (value: T, index: number, array: T[]) => void, thisArg?: any): void {
            this.entries.forEach(callbackfn, thisArg);
        }

        public some(callbackfn: (value: T, index: number, array: T[]) => boolean, thisArg?: any): boolean {
            return this.entries.some(callbackfn, thisArg);
        }

        public reduce<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U, initialValue: U): U {
            return this.entries.reduce<U>(callbackfn, initialValue);
        }
    }
}
