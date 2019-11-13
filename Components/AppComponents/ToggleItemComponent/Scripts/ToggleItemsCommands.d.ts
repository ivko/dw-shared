/// <reference path="../../../Commands/Scripts/Command.d.ts" />

declare module DW {

    export class ToggleItemCommand extends DW.Command {
        // implemented in parent
        constructor(propertyName: string);

        prop: string;
    }

    export class SelectAllCommand extends DW.Command {
        VM: any;
    }
}   