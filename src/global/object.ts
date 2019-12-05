export {}

declare global {
    interface Object {
        merge(Item: Object, ...args:[any]): Object;
        append(Item: Object, ...args): Object;
    }
}