/// <reference path="./bindingHandlers.d.ts" />
import * as Utils from "../utils";
import * as ko from "knockout";
import * as $ from "jquery";

let ATTACH_DELAY = 400;
export type AttachMethod = (target: EventTarget, eventNames: string) => void;

export let prepareAttachDebounced = (attach: AttachMethod) => {
    return Utils.debounce((target: EventTarget, eventNames: string) => {
        if ($(target).filter(':hover').length !== 0 && Utils.isVisible(<HTMLElement>target)) {
            attach(target, eventNames);
        }
    }, ATTACH_DELAY);
}

export class LazyBindingHandler implements KnockoutBindingHandler {
    private readonly SELECTOR: string;

    constructor(
        private readonly SETTINGS_KEY: string,
        eventNames: string,
        private lazyInit: (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) => void,
        prepareAttach = (attach: AttachMethod) => attach) {

        this.SELECTOR = ':data(' + this.SETTINGS_KEY + ')';
        this.initGlobalListener(
            document,
            eventNames,
            prepareAttach(this.attachAndOpen.bind(this)));
    }

    public init: (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) => void = (...args) => {
        let element = args[0];
        $(element).data(this.SETTINGS_KEY, args);

        ko.utils.domNodeDisposal.addDisposeCallback(element, () => this.destroy(element));
    }

    private getEventName(eventNames: string, index: number): string {
        return eventNames.split(' ')[index];
    }

    private retrieveSettings(element: EventTarget): any[] {
        return $(element).data(this.SETTINGS_KEY);
    }

    private disposeSettings(element: EventTarget): void {
        $(element).removeData(this.SETTINGS_KEY);
    }

    private destroy(element: HTMLElement): void {
        this.disposeSettings(element);
    }

    /**
     * @return was attach successful
     */
    private attach(element: EventTarget, settings: any[]): boolean {
        this.disposeSettings(element);

        var shouldAttach = !!settings;
        if (shouldAttach) {
            this.lazyInit.apply(null, settings);
        }
        return shouldAttach;
    }

    public attachAndOpen(target: EventTarget | Element, eventNames: string): void {
        let settings = this.retrieveSettings(target);
        if (this.attach(target, settings)) {
            let firstEventName = this.getEventName(eventNames, 0);
            $(target).trigger(firstEventName); // We only need to trigger one event, since we listen for each one
        }
    }

    private initGlobalListener(
        element: Node,
        eventNames: string,
        attach: (target: EventTarget, eventNames: string) => void): void {

        $(element).on(eventNames, this.SELECTOR, (event) => attach.call(this, event.currentTarget, eventNames));

        ko.utils.domNodeDisposal.addDisposeCallback(<Element>element, () => {
            $(element).off(eventNames);
        });
    }
}

