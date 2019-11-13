declare module DW {

    export class CommandBindingAdapter extends DWTS.Disposable {

        constructor(command, bindingContext);

        public initialize(command, bindingContext): void;

        public available(): boolean;

        public visible(): JQueryPromise<boolean>;

        public execute(): JQueryPromise<any>; 

        public canExecute(): boolean;
    }

    export class CommandBindingHandler extends DWTS.Disposable {

        constructor(options);

        public initialize(options): void;

        protected init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
        protected update(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
    }
}
 