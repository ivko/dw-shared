/// <reference path="Disposable.d.ts" />

declare module DW {
    interface ScrollViewObserver {
        resize: (size: number) => void;
        scroll: (offset: number) => void;
        dispose: () => void;
    }
    export class ScrollView extends DW.Disposable {
        constructor(wrapper: JQuery, resizableWrapper: Node, resizeEventName: string);
        createInstance(options: any): ScrollViewInstance;
    }

    export class ScrollViewInstance extends DW.Disposable {
        constructor(options?: any);
        addObservers(observers: ScrollViewObserver[]);
        removeObservers(observers: ScrollViewObserver[]);
        addObserver(observer: ScrollViewObserver);
        removeObserver(observer: ScrollViewObserver);
        setScroll(offset: number);
    }
}