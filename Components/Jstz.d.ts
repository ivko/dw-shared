declare module Jstz {
    export function determine(): IDetermine;

    interface IDetermine {
        name(): string;
    }
}
