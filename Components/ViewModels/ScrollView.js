(function (factory) {
    if (typeof define === "function" && define.amd) { // AMD.
        define(['jquery', 'knockout', 'dw/utils', 'dw/ViewModels/Disposable'], factory);
    } else { // Global
        factory(jQuery, ko);
    }
}(function ($, ko) {
    var ScrollView = new Class({
        Extends: DW.Disposable,
        initialize: function (wrapper, resizableWrapper, resizeEventType) {
            this.resizableWrapper = resizableWrapper || window;
            this.resizeEventType = DW.Utils.format("{0}.pluginscrollview", resizeEventType || 'resize');
            this.rootElement = typeof wrapper === 'string' ? $(wrapper) : wrapper;
            this.layoutSize = this.addDisposable(ko.observable({ width: 0, height: 0 }));
            this.layoutScrollOffset = this.addDisposable(ko.observable(0));
            this.initEvents();
        },
        initEvents: function () {
            $(this.resizableWrapper).on(this.resizeEventType, DW.Utils.debounce(function () {
                //This is the cross-browser way to get the height of the element,
                // without including horizontal scrollbar height.
                this.layoutSize({
                    height: this.rootElement.get(0).clientHeight,
                    width: this.rootElement.width()
                });
            }.bind(this), 50)).trigger(this.resizeEventType);

            this.rootElement.on('scroll.pluginscrollview', DW.Utils.debounce(function (event) {
                this.layoutScrollOffset(this.rootElement.scrollTop());
            }.bind(this), 50));
        },
        createInstance: function (options) {
            return new ScrollViewInstance({
                isActive: options.isActive || function () { return true; },
                layoutScrollOffset: this.layoutScrollOffset,
                layoutSize: this.layoutSize,
                element: this.rootElement
            });
        },
        dispose: function () {
            $(window).add(this.rootElement).off('.pluginscrollview');

            this.rootElement = null;
            this.parent();
        }
    });


    var ScrollViewInstance = new Class({
        Extends: DW.Disposable,
        options: {
            layoutScrollOffset: null,
            layoutSize: null,
            isActive: null,
            delay: 10,
            element: null
        },
        observers: [],
        scrollOffset: 0,
        layoutSize: { width: 0, height: 0 },
        initialize: function (options) {
            $.extend(this.options, options);

            this.layoutSize = this.options.layoutSize();
            this.scrollOffset = this.options.layoutScrollOffset();
            this.isActive = this.addDisposable(ko.computed(this.options.isActive));

            this.addDisposable(this.options.layoutSize.subscribe(this.sizeChange, this));
            this.addDisposable(this.options.layoutScrollOffset.subscribe(this.scrollChange, this));
            this.addDisposable(this.isActive.subscribe(this.setActive, this));
        },
        removeObservers: function (observers) {
            observers.forEach(function (observer) {
                this.removeObserver(observer);
            }.bind(this));
        },
        addObservers: function (observers) {
            this.observers = this.observers.concat(observers);
            observers.forEach(function (observer) {
                this.initObserver(observer);
            }.bind(this));
        },
        addObserver: function (observer) {
            this.observers.push(observer);
            this.initObserver(observer);
        },
        initObserver: function (observer) {
            observer.resize(this.layoutSize);
            observer.scroll(this.scrollOffset);
        },
        removeObserver: function (observer) {
            this.observers = this.observers.filter(function (item) {
                return item !== observer;
            });
        },
        callObservers: function (method, args) {
            this.observers.forEach(function (observer) {
                observer[method].call(observer, args);
            });
        },
        setActive: function (isActive) {
            var offset = isActive === true ? this.scrollOffset : 0;
            this.setScroll.delay(0, this, [offset]);
        },
        sizeChange: function (size) {
            if (this.options.isActive() == false) {
                return;
            }
            this.layoutSize = size;
            this.callObservers('resize', size);
        },
        scrollChange: function (offset) {
            clearTimeout(this.scrollTimeoutId);

            this.scrollTimeoutId = setTimeout(function () {
                if (this.options.isActive() == false) {
                    return;
                }
                this.scrollOffset = offset;
                this.callObservers('scroll', offset);
            }.bind(this), this.options.delay);
        },
        setScroll: function (offset) {
            this.options.element.scrollTop(offset);
        }
    });

    extend(ns('DW'), {
        ScrollView: ScrollView
    });

}));
