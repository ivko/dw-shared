import 'mootools-core';
import 'mootools-interfaces';
import * as $ from 'jquery';
import "./array";
import "./string";

declare global {
    
    interface JQuery{
        exists(): boolean;
    }

    interface Window {
        [x: string]: any;
        extend(obj: any, ...args:any[]):any;
        namespace(namespace: string):any;
        ns(namespace: string):any;
        $R(res:string):string;
    }
}

$.fn.exists = function () {
    return this.length !== 0;
};

window.extend = function (obj:any, ...args: any[]) {
    var type = typeof obj,
        isObject = type === 'function' || type === 'object' && !!obj;
    if (!isObject) return obj;
    var source, prop;
    for (var i = 0, length = args.length; i < length; i++) {
        source = args[i];
        for (prop in source) {
            if (source.hasOwnProperty(prop)) {
                obj[prop] = source[prop];
            }
        }
    }
    return obj;
};

// define namespace starting from global object
window.ns = window.namespace = function (namespace) {
    return (namespace || '').split('.').reduce(function (ns, fragment) {
        return ns[fragment] || Object.defineProperty(ns, fragment, {
            value: {},
            writable: false,
            enumerable: true,
            configurable: ns === window
        })[fragment];
    }, this);
};

window.$R = function (res) {
    return res || '';
};