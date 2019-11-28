/// <reference path="../types/DataContracts.d.ts" />
/// <reference path="../types/toastr.d.ts" />
/// <reference path="../types/globalize.d.ts" />
/// <reference path="../types/knockout.d.ts" />

/// 
import * as $ from "jquery";
import * as ko from "knockout";
import "./global";
import { DateTime } from "./datetime"; 
import { Disposable } from "./model/disposable";
import { Deferred } from "./deferred";
import { When } from "./when";

/**
* Create and return resolved deferred
* @return {dfd.resolve();}
*/
export let resolvedDeferred: JQueryDeferred<any> = Deferred(function (dfd) { dfd.resolve(); });
/**
 * Create and return rejected deferred
 * @return {dfd.reject();}
 */
export let rejectedDeferred: JQueryDeferred<any> = Deferred(function (dfd) { dfd.reject(); });


export const isTypeDateInputSupportedByTheBrowser = (() => {
    let input = document.createElement('input'),
        notADateValue = 'not-a-date';

    input.setAttribute('type', 'date');
    input.setAttribute('value', notADateValue);

    return input.value !== notADateValue;
})();

export class ConditionalMessage {
    constructor(public message: string, public condition: () => boolean) { }
}
/**
*  this function returns a string as combined result from all conditionalMessages
*  if the condition function returns true, then the message from this condition is added to the result of this function
* @return {string}
*/
export function getConditionBasedMessage(conditionalMessages: Array<ConditionalMessage>, separator: string = ",", suffix: string = "", prefix: string = "") {
    let tooltipMessageContainer = [],
        result: string = "";
    conditionalMessages.forEach((item) => {
        if (item.condition())
            tooltipMessageContainer.push(item.message);
    });

    if (!tooltipMessageContainer.length) return "";
    result = tooltipMessageContainer.join(" " + separator + " ");
    return [prefix, result, suffix].join(" ");
}

export let _nextId: number = 1;

export let SORT_DIRECTIONS = {
    ASC: 1,
    DESC: -1
};

// zero based guid
export let EMPTY_GUID: string = "00000000-0000-0000-0000-000000000000";

// { boolean } shows if the device is touch
export let _isTouch = ('ontouchstart' in window) || (navigator.msMaxTouchPoints > 0) || (navigator.maxTouchPoints > 0);

export let isIE = !!(/trident\/(\d+\.\d+)/i.exec(navigator.userAgent) || [])[1];
export let isEdge = window.navigator.userAgent.indexOf("Edge") > -1;
// { boolean } shows if the browser is Mozilla Firefox
export let isFF: boolean = window.navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
export let isChrome: boolean = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
export let isSafari: boolean = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);

/**
* Indicate if the client device is supporting touch gestures
* @return {boolean}
*/
export function isTouchEnabled(): boolean {
    return _isTouch;
};

export var DeferredStates = {
    pending: 'pending',
    resolved: 'resolved',
    rejected: 'rejected'
};

export var jsKeyCodes = {
    '8': 'Backspace',
    '13': 'Enter',
    '27': 'Escape',
    '32': 'Space',
    '33': 'PgUp',
    '34': 'PgDn',
    '35': 'End',
    '37': 'arrowLeft',
    '38': 'arrowUp',
    '39': 'arrowRight',
    '40': 'arrowDown',
    '46': 'Del',
    '48': '0',
    '49': '1',
    '50': '2',
    '51': '3',
    '52': '4',
    '53': '5',
    '54': '6',
    '55': '7',
    '56': '8',
    '57': '9',
    '61': '+',
    '65': 'a',
    '67': 'c',
    '68': 'd',
    '69': 'e',
    '70': 'f',
    '71': 'g',
    '72': 'h',
    '73': 'i',
    '74': 'j',
    '75': 'k',
    '76': 'l',
    '77': 'm',
    '78': 'n',
    '79': 'o',
    '80': 'p',
    '81': 'q',
    '82': 'r',
    '83': 's',
    '84': 't',
    '85': 'u',
    '86': 'v',
    '87': 'w',
    '88': 'x',
    '89': 'y',
    '90': 'z',
    '96': '0',
    '97': '1',
    '98': '2',
    '99': '3',
    '100': '4',
    '101': '5',
    '102': '6',
    '103': '7',
    '104': '8',
    '105': '9',
    '107': '+',
    '109': '-',
    '112': 'F1',
    '113': 'F2',
    '114': 'F3',
    '115': 'F4',
    '116': 'F5',
    '117': 'F6',
    '118': 'F7',
    '119': 'F8',
    '120': 'F9',
    '121': 'F10',
    '122': 'F11',
    '123': 'F12',
    '173': '-',
    '187': '+',
    '188': ',',
    '189': '-'
};



/**
* Create and return resolved deferred with param
* @param param - a variable which will be resolved and returned
* @return { dfd.resolve(param); }
*/
export function resolvedDeferredWithParam<T>(param: T): JQueryDeferred<T> {
    return Deferred(function (dfd) { dfd.resolve(param); });
};

/**
* Create and return resolved deferred with param
* @param param - a variable which will be rejeted and returned
* @return { dfd.reject(param); }
*/
export function rejectedDeferredWithParam(param: any): JQueryDeferred<any> {
    return Deferred(function (dfd) { dfd.reject(param); });
};

//TODO: define types
/**
* Handles error message
* @param error - error instance
* @param options { JSON } - error config options
* @return { void } - show/log/handle error
*/
export function handleError(error: any, options?: any): void {
    if (!error || error.handled || error.canceled) return;

    options = window.extend({}, {
        show: function (message, html) {
            if (!toastr)
                alert(message);
            else
                html ? toastr.errorUnsafe("", message) : toastr.error("", message);
        },
        getNoConnectionString: function () {
            return window.$R('Error_NoServerConnection');
        }
    },
        options,
        error.displayOptions);

    error.handled = true;

    //filter network timeout (0) iis timeout (408) and general iis errors (e.g. Bad Gateway 502 etc.)
    if (error.statusCode == 0 || error.statusCode == 408 || error.statusCode > 500) {
        options.show(options.getNoConnectionString(), options.showHtmlMsg);
    }
    else if (error.message) {
        options.show(error.message, options.showHtmlMsg);
    }
};

/**
* Calulate the precision of double floating point number or decimal string
* @param value - float number or decimal string
* @return { number } - the precision
*/
export function getPrecision(value: number | string): number {
    var precision = undefined;
    if ($.isNumeric(value)) {
        var isoDec = ".",
            isoStr = value + "",
            decPos = isoStr.indexOf(isoDec);
        precision = decPos > 0 ? (isoStr.length - 1 - decPos) : 0;
    }
    return precision;
};

/**
 * Parses some value to float
 * @param value
 * @return the parsed value, or the value itself if the value meets the criteria in isRealObject
 */
export function parseFloat(value: any): any {
    //window is nesessary here to prevent recursion
    return isRealObject(value) ? window.parseFloat(value) : value;
}

/**
* After serialization the objects comming from the server include short type name and HTML namespace.
* This function will strip the namespace and will return the name
*
* Example:
* {__type:"DependencyQuery:http://dev.docuware.com/settings/dependencies/"}
* 
* The result will be 'DependencyQuery'
*/
export function getShortTypeName(obj: any): string {
    return obj.__type ? obj.__type.replace(/:.*$/, '') : '';
};

export type Salutation = 'de' | 'es' | 'default';
export let Salutations: { de: Salutation, es: Salutation, default: Salutation } = {
    de: 'de',
    es: 'es',
    default: 'default'
};
const SALUTATIONS = {
    de: ['Hr.', 'Fr.'],
    es: ['Sr.', 'Sra.'],
    default: ['Mr.', 'Mrs.', 'Ms.']
};
/**
*  this function returns array with salutations only for de, es and en
* @return {Array<string>}
*/
export function getSalutations(lang: Salutation = Salutations.default): string[] {
    return SALUTATIONS[lang] || SALUTATIONS.default;
};

export enum FCFieldTypes {
    Text,
    Numeric,
    Memo,
    Date,
    Keyword,
    Decimal,
    DateTime
};

export function getFieldTypeName(intType: dev.docuware.com.settings.interop.DWFieldType): string {
    return FCFieldTypes[intType] || '';
};

export function createMapFromArray<T>(arr: Array<T>, mapFnc: (elem: T) => string): { [guid: string]: T } {
    let result = (arr || []).reduce<{ [guid: string]: T }>((map, elem) => {
        map[mapFnc(elem)] = elem;
        return map;
    }, {});
    return result;
}

/**
* whenAllDone is wrapper around When to wait for all tasks, nevertheless if any of the tasks fails.
* By default When rejects, when any of the passed tasks fails and it doesn't wait for the rest to finish.
* whenAllDone will wait for all tasks. If any fails, whenAllDone will reject, but will wait for the rest and 
* will pass their results to the reject callbacks, to allow the user to inspect the result according to his wish. 
* If all tasks finish successfully, resolve callbacks will be executed again passing result from all tasks.
* whenAllDone also support progress. It will notify any progress callback how many tasks are waited.
* @param ...args: any[] - Input parameters: any amount of deferreds
* @return { all deferreds } - whenAllDone will wait for all tasks
*/
export function whenAllDone(...args: any[]): JQueryPromise<any> {
    var result = Deferred(),
        failed = false,
        _arguments = arguments.length && $.isArray(arguments[0]) ? arguments[0] : arguments,
        num = _arguments.length;

    // wrap all passed tasks to always finish with success, so that When waits for all of them
    var deferreds = $.map(_arguments, function (current) {
        var wrapDeferred = Deferred();
        current
            .always(function () {
                // notify the summary task with progress
                result.notify(--num);
            })
            .done(function (res) {
                // if done pass the result 
                wrapDeferred.resolve(res);
            })
            .fail(function (error) {
                // ... respectively if fails, pass the error as result
                failed = true;
                wrapDeferred.resolve(error);
            });
        return wrapDeferred;
    });

    When.apply(null, deferreds).done(function () {
        // check if any of the tasks has failed and decided if it should reject or resolve
        failed ? result.reject.apply($, arguments) : result.resolve.apply($, arguments);
    });

    return result.promise();
};

/**
* Encodes string in html
* @param text - input text string
* @return { string } - encoded text as html
*/
export function htmlEncode(text: string): string {
    return $('<div />').text(text).html();
};

/**
* Provides wrapper to knockout renderTemplate function
* @param template - function or template id
* @param context - view model, other js object or class instance
* @param options - template render options // http://aboutcode.net/2012/11/15/twitter-bootstrap-modals-and-knockoutjs.html
* @return { JQuery element } - the wrapper as JQuery element 
*/
export function renderTemplate(template: any, context: any, options?: any): JQuery {
    var wrapper = document.createElement('div');
    ko.renderTemplate(template, context, options, wrapper, 'replaceChildren');
    return $(wrapper.children);
};

/**
* Generate unique id - date + math floor + postfix?
* @param postfix - optional post parameter
* @return { string } - unique id
*/
export function uniqueId(postfix?: string): string {
    var from = 100000, to = 999999;
    postfix = postfix || '';
    return 'dwuid_' + (new Date()).getTime().toString() + '_' + (from + Math.floor(Math.random() * (to + 1 - from))).toString() + '_' + postfix;
};

/**
* Generate next id - date + math floor + postfix?
* @param postfix - optional post parameter
* @return { string } - next temporary id for the current client
*/
export function nextId(postfix?: string): string {
    postfix = postfix || '';
    return 'dwnid_' + (_nextId++) + '_' + postfix;
};

/**
* Returns a function, that, when invoked, will only be triggered at most once
* during a given window of time. Normally, the throttled function will run
* as much as it can, without ever going more than once per `wait` duration;
* but if you'd like to disable the execution on the leading edge, pass
* `{leading: false}`. To disable execution on the trailing edge, ditto.
*/
export function throttle(func: Function, wait: number, options: { leading: boolean, trailing: boolean } = { leading: false, trailing: false }): any {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    var later = function () {
        previous = options.leading === false ? 0 : Date.now();
        timeout = null;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
    };
    return function () {
        var now = Date.now();
        if (!previous && options.leading === false) previous = now;
        var remaining = wait - (now - previous);
        context = this;
        args = arguments;
        if (remaining <= 0 || remaining > wait) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            previous = now;
            result = func.apply(context, args);
            if (!timeout) context = args = null;
        } else if (!timeout && options.trailing !== false) {
            timeout = setTimeout(later, remaining);
        }
        return result;
    };
};

/**
* Returns a function, that, as long as it continues to be invoked, will not
* be triggered. The function will be called after it stops being called for
* N {wait: number} milliseconds. If `immediate` is passed, trigger the function on the
* leading edge, instead of the trailing.
*/
export function debounce(func: Function, wait: number, immediate?: boolean): any {
    var timeout, args, context, timestamp, result;

    var later = function () {
        var last = Date.now() - timestamp;

        if (last < wait && last >= 0) {
            timeout = setTimeout(later, wait - last);
        } else {
            timeout = null;
            if (!immediate) {
                result = func.apply(context, args);
                if (!timeout) context = args = null;
            }
        }
    };

    return function () {
        context = this;
        args = arguments;
        timestamp = Date.now();
        var callNow = immediate && !timeout;
        if (!timeout) timeout = setTimeout(later, wait);
        if (callNow) {
            result = func.apply(context, args);
            context = args = null;
        }

        return result;
    };
};

export function debounceWithResult<T>(func: () => T, wait: number, immediate?: boolean): () => JQueryPromise<T> {
    let executing = { deferred: Deferred<T>() },
        wrapper = (...args) => {
            executing.deferred.resolve(func.apply(this, args));
        },
        debounced = debounce(wrapper, wait, immediate);
    return () => {
        debounced();

        return executing.deferred.promise()
            .then((result) => {
                executing.deferred = Deferred();

                return result;
            });
    };
};

/**
* Apply function calling in closure
* @param func - Function to be applyed
* @return { Function } - function apply
*/
export function once(func: Function): Function {
    var ran = false, memo;
    return function () {
        if (ran) return memo;
        ran = true;
        memo = func.apply(this, arguments);
        func = null;
        return memo;
    };
};

/**
* Wraps function in wrapper function
* @param func - function to be wrapped
* @param wrapper - wrapped function
* @return { Function } - function apply
*/
export function wrap(func: Function, wrapper: any): Function {
    return function () {
        var args = [func];
        Array.prototype.push.apply(args, arguments);
        return wrapper.apply(this, args);
    };
};

/**
* Checks if the string ends with suffix
* @param str - text string
* @param suffix - suffix string
* @return { boolean }
*/
export function endsWith(str: string, suffix: string): boolean {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
};

/**
* Wraps function in wrapper function
* @param requestFunction - function to be wrapped in defered
* @return { Function(dfd) } - function which return deferred
*/
export function lazyDeferred<T>(requestFunction: (defer?: JQueryDeferred<T>) => any): () => JQueryPromise<T> {
    var promise = null,
        context;
    return function (...args) {
        context = this;
        if (!promise) {
            promise = Deferred<T>((defer) =>
                requestFunction.apply(context, [defer].concat(args))).promise();
        }
        return promise;
    };
};

export function lazyDeferredForPromises<T>(requestFunction: (...args) => JQueryPromise<T>): () => JQueryDeferred<any> {
    return this.lazyDeferred(function (dfd) {
        return requestFunction.apply(this, Array.prototype.slice.call(arguments, 1)).then(dfd.resolve, dfd.reject);
    }.bind(this))
};

export function virtualProxy(job, context?): any {
    var task,
        context = context || this;
    return function (force) {
        if (!task || (force && task.state() != DeferredStates.pending)) {
            //create or renew current initializing task 
            task = Deferred();
            When(job.apply(context, Array.prototype.slice.call(arguments)))
                .then(task.resolve, task.reject);
        }
        return task.promise();
    };
};  //TODO: define types

/**
* <summary>
* Replaces {n} placeholders with arguments.
* One or more arguments can be passed, in addition to the string template itself, to insert
* into the string.
* </summary>
* <param name="source" type="String">
* The string to format.
* </param>
* <param name="params" type="String">
* The first argument to insert, or an array of Strings to insert
* </param>
* <returns type="String" />
*/
export function format(source: string, params?: string | string[] | number | boolean, ...arg: any[]): string {
    if (!source) return ""; //make sure there is a string which we'll modify 

    if (!params && params != '0') return source; // if there aren't params to modify the source string, return the source string

    if (arguments.length > 2 && params.constructor != Array) {
        params = $.makeArray(arguments).slice(1);
    }
    if ((params || params == '0') && params.constructor != Array) {
        params = [String(params)];
    }
    $.each(params, (i, n) => {
        source = source.replace(new RegExp("\\{" + i + "\\}", "g"), n);
    });
    return source;
};

/**
* A helper function which can be used to call 'mootools class' parent method after a delay
* <param name="owner"></param>
* <param name="args"></param>
*/
export function wrapClassParentMethod(owner: any, args: any): any {
    //keep initial mootools environment
    var parent = owner.parent,
        initialCaller = owner.caller,
        $initialCaller = owner.$caller;

    return function () {
        //keep current mootools environment since this function could be used in a delay (timeout or deferred)
        var currentCaller = this.caller,
            $currentCaller = this.$caller;

        //set the initial mootools environment as it was before the delay
        this.caller = initialCaller;
        this.$caller = $initialCaller;

        var result = parent.apply(this, arguments);

        //restore current mootools environment
        this.caller = currentCaller;
        this.$caller = $currentCaller;

        return result;
    }.bind(owner);

    //test: function () {
    //    var parent = wrapClassParentMethod(this);
    //    return Deferred(function (task) {
    //        parent().then(function (res) {
    //            setTimeout(function () {
    //                task.resolve();
    //            }, 1000);
    //        });
    //    }).promise();
    //}
};

/**
* Converts date object to string
* @param dateObject - date object
* @return { string } - time string
*/
export function dateObjectToTimeString(dateObject: number): string {
    let d = new Date(dateObject);
    return d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + ':' + d.getMilliseconds();
};

/**
* Generates client guid 
* rfc4122 version 4 compliant solution
* @return { string } - guid
*/
export function guid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

/**
* Generate iterative name acc to resource name and other group names
* @param nameResource - element name
* @param elementsWithName - elements with same group name
* @return { string } - new name
*/
export function generateIterativeName(nameResource: string, elements: any[]): string {
    var name = format(nameResource, 1);

    if (elements && elements.length > 0) {
        name = format(nameResource, elements.length + 1);

        for (var i = 0, j = elements.length + 1; i < elements.length; i++) {
            var existingName = typeof elements[i] == 'string' ? elements[i] : elements[i].Name;

            if (existingName && existingName.indexOf(format(nameResource, j)) != -1) {
                name = format(nameResource, ++j);
                i = -1;
            }
        }
    }
    return name;
};

/**
* Copy iterative name
* @param name - element name
* @param namePrefix 
* @param nameSufix 
* @param elementsWithName - array of strings 
* @return { string } - new name
*/
export function copyIterativeName(
    name: string,
    namePrefix?: string,
    nameSuffix?: string,
    elementsWithName?: string[]): string {

    let result = format(namePrefix, name);

    if (elementsWithName && elementsWithName.length > 0) {
        let j = 1;
        while (j <= elementsWithName.length) {
            if (!(elementsWithName.find((element) => { return element == result; }))) {
                return result;
            }
            result = format(nameSuffix, name, ++j);
        }
    }
    return result;
};

/**
* Copy iterative name
* @param name - element name
* @param namePrefix 
* @param nameSufix 
* @param elementsWithName - array of objects with 'Name' property (at least)
* @return { string } - new name
*/
export function copyIterativeNameInHeader(
    name: string,
    namePrefix?: string,
    nameSuffix?: string,
    elementsWithName?: { Name: string }[]): string {

    let result = format(namePrefix, name);

    if (elementsWithName && elementsWithName.length > 0) {
        let j = 1;
        while (j <= elementsWithName.length) {
            if (!(elementsWithName.find((element) => { return element.Name == result; }))) {
                return result;
            }
            result = format(nameSuffix, name, ++j);
        }
    }
    return result;
};

/**
* Indicate if the client support local storage
* @return { boolean }
*/
export function supportsLocalStorage(): boolean {
    var res = false;
    try {
        res = 'localStorage' in window && window['localStorage'] !== null;
    }
    catch (e) { }

    if (!res) console.log('No local storage. Please check your browser options.');

    return res;
};

/**
* Indicate if the client support session storage
* @return { boolean }
*/
export function supportsSessionLocalStorage(): boolean {
    var res = false;
    try {
        res = 'sessionStorage' in window && window['sessionStorage'] !== null;
    }
    catch (e) { }

    if (!res) console.log('No session local storage. Please check your browser options.');

    return res;
};

/**
* Shows if the variable is null or undefined
* @return { boolean }
*/
export function isNullOrUndefined(obj: any): boolean {
    return (obj === undefined || obj === null);
};

/**
* Shows if the variable is real object instance
* @return { boolean }
*/
export function isRealObject(obj: any): boolean {
    if (obj === undefined || obj === null || obj === "") return false;

    //number but not exactly ... the mighty 'NaN'
    if ((typeof obj == 'number' || obj instanceof Number) && !$.isNumeric(obj)) return false;

    //date but not exactly ... the mighty 'Invalid Date'
    if (obj instanceof Date && isNaN(Number(obj))) return false;

    return true;
};

/**
* Disposing elements which have a dispose method
* @obj - Disposable instance or array with Disposable instances
* @return { void }
*/
export function dispose(obj: any | IDisposable | IDisposable[]): any {
    if (obj) {
        return $.isFunction((<IDisposable>obj).dispose) ?
            (<IDisposable>obj).dispose() :
            $.isArray(obj) && (<IDisposable[]>obj).forEach((disposable) => $.isFunction(disposable.dispose) && disposable.dispose());
    }
};

export let _scrollbarSize = { height: 18, width: 18 };

/**
* Shows the scrollbar sizes
* @return { json object }
*/
export function getScrollbarSize(): { height: number, width: number } {
    return _scrollbarSize;
};

/**
* <summary>Find and update dialog element dimensions within specified element.</summary>
* <param name="rootElement" type="Object">Element to search within for dialog or data-dw-resizable elements</param>
* All layout elements in WebClient are with fixed or auto dimensions, except dialogs!!!
*/
export function updateLayout(rootElement: HTMLElement, skipRootElement: boolean = false): void {
    //Update dialog element dimensions.
    var $rootElement = $(rootElement);
    if ($rootElement.attr('data-dw-resizableDialog') !== undefined) {
        resizeDialog(rootElement);
    } else if (!skipRootElement) {
        $(rootElement).find("div[data-dw-resizableDialog]").each(function () {
            resizeDialog(this);
        });
    }

    //Once dialogs are resized all components around them could be 'auto' resized or repositioned.
    //So check the ones we are interested in.
    setTimeout(function () {
        var triggerDwResize = function ($elem) {

            var sizeChanged = false,
                props = [
                    { property: 'height', offset: 'top' },
                    { property: 'width', offset: 'left' }
                ],
                data = $elem.data('elementSize') || {};

            for (var i = 0; i < props.length; i++) {
                if ($elem[props[i].property]() !== data[props[i].property]) {
                    data[props[i].property] = $elem[props[i].property]();
                    sizeChanged = true;
                }

                if ($elem.offset()[props[i].offset] !== data[props[i].offset]) {
                    data[props[i].offset] = $elem.offset()[props[i].offset];
                    sizeChanged = true;//position changed
                }
            };

            // If element size has changed since the last time, store the element
            // data and trigger the 'resize' event.
            if (sizeChanged) {
                $elem.data("dw.elementSize", data);
                $elem.triggerHandler('dwResize', data);
            }
        }

        if (!skipRootElement && $rootElement.attr('data-dw-resizable') !== undefined) {
            triggerDwResize($rootElement);
        }

        $(rootElement).find("*[data-dw-resizable]").each(function () {
            triggerDwResize($(this));
        });
    }, 0);
};

/**
* Update dialog element size and notify for dwResize event
* <summary>Updates dialog element dimensions and raise a 'dwResize' event for this element</summary>
* <param name="element" type="Object">Dialog element</param>
* @return { void }
*/
export function resizeDialog(element: HTMLElement | JQuery): void {
    var $element = $(element);
    var props = [
        { property: 'height', inner: 'innerHeight', offset: 'offsetTop' },
        { property: 'width', inner: 'innerWidth', offset: 'offsetLeft' }
    ],
        values = {},
        dialogSize = $element.data('dw.elementSize') || values,
        sizeChanged = false;

    for (var i = 0; i < props.length; i++) {
        var size = $element[props[i].property](),
            delta = $element[props[i].inner]() - size,
            value = $element.offsetParent()[props[i].inner]() - element[props[i].offset] - delta;
        if (value === dialogSize[props[i].property]) {
            continue;
        }
        values[props[i].property] = value;
    };

    $.extend(dialogSize, values);

    $element.data('dw.elementSize', dialogSize);

    for (var property in values) {
        sizeChanged = true;
        // is not necessary to set the width on block-level elements
        if (property == 'width') continue;
        $element[property](values[property]);
    }

    if (sizeChanged) {
        $element.triggerHandler('dwResize');
    }
};

/**
* Executes sequentially one/array of async tasks
* @param ...args: any[] example (context, execSequentiallyArray)
* @return { void } - executes tasks sequentially
*/
export function execSequentially(first: any, ...args: any[]): JQueryPromise<any> {
    if (arguments.length === 0) {
        return When<any>();
    } else if (arguments.length === 1) {
        return When(first.call()).then((result) => {
            return (result !== false) ? result : Deferred().reject().promise();
        });
    } else {
        var rest = [].slice.call(arguments, 1);
        return execSequentially(first).then(() => {
            return execSequentially.apply(self, rest);
        });
    }
};

/**
* Concat the full adress
* @param address
* @return { string }
*/
export function getFullAddress(address: string): string {
    if (address.indexOf('http') == 0) return address;
    if (address.indexOf("/") !== 0) address = "/" + address;
    return window.location.protocol + "//" + window.location.host + address;
};

/**
* registers custom event 'dw.domchange'
* takes jquery $element
* subscribtion of: $element.on('dw.domchange', callback);
* @param $element - jquery element
* @return { void }
*/
export function registerObserveDomElement($element: JQuery): void {
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

    var eventCallback = function () {
        $element.trigger('dw.domchange', $element);
    };

    if (MutationObserver && !isFF) {
        // define a new observer
        var obs = new MutationObserver((mutations) => {
            if (mutations[0].addedNodes.length || mutations[0].removedNodes.length || mutations[0].attributeName)
                eventCallback();
        });
        // have the observer observe for changes in children
        obs.observe($element[0], { childList: true, subtree: true, attributes: true, attributeOldValue: true });
        $element.disconnectObserver = obs.disconnect.bind(obs);
    }
    else {
        $element.on("DOMSubtreeModified", eventCallback);

        $element.disconnectObserver = function () {
            $element.off("DOMSubtreeModified", eventCallback);
        }
    }
};

/**
* Disconnect and null the observer
* @param $element - jquery element
* @return { void }
*/
export function disconnectObserveDomElement($element: JQuery): void {
    if ($element.disconnectObserver) {
        $element.disconnectObserver();
        $element.disconnectObserver = null;
    }
};

/**
* Normalize date
* @param date
* @return { string } date to string
*/
export function getNormalizedDate(date: Date): Date {
    return date ? DateTime.normalizeDate(new Date(date.getTime())) : null;
};

// { Object } roles json
export let dwRelationItemTypes: Object = {
    User: 1,
    Role: 2
};

/**
* Compare strings alphabetically
* @param str1 { string }
* @param str2 { string }
* @return { number }
*/
export function strAlphabetCompare(str1: string, str2: string): number {
    //alphabetically sort
    var _str1 = str1.toLowerCase(),
        _str2 = str2.toLowerCase();

    if (_str1 == _str2) {
        //if equal when normalized, continue with comparing the real values
        _str1 = str1;
        _str2 = str2;
    }

    if (_str1 < _str2) return -1;
    if (_str1 > _str2) return 1;

    return 0;
};

/**
* Sorting array
* @param arr { any[] }
* @param prop { string | number } sort property
* @param dir { number } direction of sorting
* @return { number }
*/
export function sortBy(arr: any, prop: string | number, dir?: string): any[] {
    dir = dir || 'ASC';
    var directions = { ASC: 1, DESC: -1 },
        dir = dir.toUpperCase();

    return arr.sort(function (item1, item2) {
        return strAlphabetCompare(item1[prop], item2[prop]) * directions[dir];
    });
};

/**
* Clones and returns new table row based on current 'tr'
* @param e { any }
* @param tr { JQuery }
* @return { JQuery }
*/
export function cloneTableRow(e: any, tr: JQuery): JQuery {
    var originals = tr.children(),
        clone = tr.clone().addClass('active'),
        table = tr.closest('table'),
        helper = $('<table />')
            .addClass(table.attr('class'));

    clone.children().each(function (index) {
        // Set helper cell sizes (without paddings) to match the original sizes
        $(this).width(originals.eq(index).innerWidth());
    });

    $('<tbody />').append(clone).appendTo(helper);

    return helper;
};

/**
* Concatenates observable arrays contained inside an object
* @param obj
* @return a simple array of all contained objects
*/
export function concatKOArrayWrapper<T, K>(obj: Map<K, KnockoutObservableArray<T>>): Array<T> {
    return Array.prototype.concat.apply([], Object.values(obj).map(ko.unwrap));
};


/**
 * 
 * @param title
 * @param message
 * @param okButtonText
 */
export function messageBox(title: string, message: string, okButtonText: string = window.$R('Button_OK_Text')) {
    toastr.confirm(title, message, null,
        {
            buttons: {
                ok: {
                    text: true,
                    className: "toastr-confirm-btn main ui-button ui-widget ui-state-default ui-button-text-only"
                }
            },
            okText: okButtonText
        });
}

/**
 * Fix for date time objects, prepared for storing with settings service, because of time zone.
 * @param onTime { dev.docuware.com.settings.common.dwschedule.ScheduleOnTime } on time schedule object for fixing
 * */
export function fixScheduleOnTimeDateTimeForSs(onTime: dev.docuware.com.settings.common.dwschedule.ScheduleOnTime):
    dev.docuware.com.settings.common.dwschedule.ScheduleOnTime {
    if (onTime) {
        let schedule;

        switch (onTime.Type) {
            case dev.docuware.com.settings.common.dwschedule.OnTimeType.Daily:
                {
                    schedule = onTime.DailySchedule;
                    break;
                }
            case dev.docuware.com.settings.common.dwschedule.OnTimeType.Monthly:
                {
                    schedule = onTime.MonthlySchedule;
                    break;
                }
            case dev.docuware.com.settings.common.dwschedule.OnTimeType.Weekly:
                {
                    schedule = onTime.WeeklySchedule;
                    break;
                }
        }

        if (schedule) {
            schedule.StartAt = <any>DateTime.getDateForSS(new Date(schedule.StartAt));
            if (schedule.EndAt) {
                schedule.EndAt = <any>DateTime.getDateForSS(new Date(schedule.EndAt));
            }
        }
    }

    return onTime;
}

/**
 * Fix for date time objects, got from settings service, because of time zone.
 * @param onTime { dev.docuware.com.settings.common.dwschedule.ScheduleOnTime } on time schedule object for fixing
 * */
export function fixScheduleOnTimeDateTimeFromSs(onTime: dev.docuware.com.settings.common.dwschedule.ScheduleOnTime):
    dev.docuware.com.settings.common.dwschedule.ScheduleOnTime {
    if (onTime) {
        let schedule;
        switch (onTime.Type) {
            case dev.docuware.com.settings.common.dwschedule.OnTimeType.Daily:
                {
                    schedule = onTime.DailySchedule;
                    break;
                }
            case dev.docuware.com.settings.common.dwschedule.OnTimeType.Monthly:
                {
                    schedule = onTime.MonthlySchedule;
                    break;
                }
            case dev.docuware.com.settings.common.dwschedule.OnTimeType.Weekly:
                {
                    schedule = onTime.WeeklySchedule;
                    break;
                }
        }

        if (schedule) {
            schedule.StartAt = DateTime.getDateFromSSDate(schedule.StartAt);
            if (schedule.EndAt) {
                schedule.EndAt = DateTime.getDateFromSSDate(schedule.EndAt);

                // In JS the earlier date is 01/02/1901 00:00:00, but in C# is 01/01/0001 00:00:00. Don't remove it, because the tracker will handle fake change.
                if (schedule.EndAt === '01/01/0001 00:00:00') {
                    schedule.EndAt = '01/02/1901 00:00:00';
                    //schedule.NeverEndAt = true;
                }
            }
        }
    }

    return onTime;
}

/**
* @param settingsServiceAddress { string } address of SettingsService
* @param settingsGuid { string } guid of job which will be monitored
* @param moduleName { string } name of module, which call the monitoring plugin
* @param title { string } title of plugin
* @param processedColumnName { string }
* @param unitString { string } units of processed items
* @param icon { string } css class of icon in header (module icon)
*
*/
export function composeMonitoringUrl(
    settingsServiceAddress: string,
    settingsGuid: string,
    moduleName: string,
    title: string,
    processedColumnName: string,
    unitString: string,
    icon: string,
    fastStart: boolean): string {

    var settingsAddress = settingsServiceAddress.substring(0, settingsServiceAddress.lastIndexOf("/"));

    return settingsAddress +
        "?link=Monitoring&resourceStr=" + encodeURIComponent(processedColumnName) +
        "&disablenav=true" +
        "&unitStr=" + encodeURIComponent(unitString) +
        "&module=" + moduleName +
        "&detailGuid=" + settingsGuid +
        "&customHeadline=" + encodeURIComponent(title) +
        "&customIcon=" + icon +
        "&fastStart=" + fastStart;
};

export function composeContainerDolwnloadUrl(
    baseURL: string,
    sessionID: string,
    organization: string,
    settingsGuid: string,
    controllerName: string,
    validationHash: string): string {

    let baseAddr = baseURL +
        "Request" + "/" + controllerName + "/" +
        "DownloadRequest" +
        "?workflowGuid=" + encodeURIComponent(settingsGuid) +
        "&sessionID=" + encodeURIComponent(sessionID) +
        "&organization=" + encodeURIComponent(organization) +
        "&verificationHash=" + encodeURIComponent(validationHash);

    return baseAddr;
};

export let colorsToArgb = {
    'black': "FF000000",
    'blue': "FF0000FF",
    'green': "FF008000",
    'red': "FFFF0000",
    'yellow': "FFFFFF00",
};

export let argbColorsToHex = {
    "FF000000": "#353535",
    "FF0000FF": "#0089cf",
    "FF008000": "#368d2e",
    "FFFF0000": "#bb3937",
    "FFFFFF00": "#fcb200"
};

export function getColors(): Array<{ argb: string, hex: string }> {
    var result = [];
    for (var dwColor in argbColorsToHex) {
        result.push({
            hex: argbColorsToHex[dwColor],
            argb: dwColor
        });
    }
    return result;
};

/**
* Gets value from style unit (42px => 42)
*/
export function styleToValue(style: string): number {
    var value = parseFloat(style);

    return isNaN(value) ? 0 : value;
};

export function attributesToString(attributes: NamedNodeMap): string {
    var toString = '';
    for (var i = 0; i < attributes.length; ++i) {
        var attribute = attributes[i];

        if (attribute.value.indexOf('\n') === -1) {
            toString += '[' + attribute.name + '=' + '"' + attribute.value + '"' + ']';
        }
    }
    return toString;
};

export function isElement(entity: any): boolean {
    return (
        typeof HTMLElement === "object" ?
            entity instanceof HTMLElement : //DOM2
            entity && typeof entity === "object" &&
            entity !== null &&
            entity.nodeType === 1 &&
            typeof entity.nodeName === "string"
    );
};

/**
 *  Returns null if there are not element siblings
 */
export function findNextElementSibling(node: Node): Node {
    while (node !== null && !this.isElement(node)) {
        node = node.nextSibling;
    }
    return node;
};

/**
*  Generate object to access keys from enums by their values
*/
export function buildMapFromEnum(enumPrototype: any): { [id: string]: string } {
    var map = {};
    for (var type in enumPrototype) {
        map[enumPrototype[type]] = type;
    }
    return map;
};

export function addUrlParams(url: any, params: any): any {
    if (params !== undefined) {
        let first: boolean | number = url.indexOf('?') == -1;
        for (var p in params) {
            url += first ? "?" : "&";
            url += encodeURIComponent(p) + "=" + encodeURIComponent(params[p]);
            first = 0;
        }
    }
    return url;
};

export function addDisposable(disposable, disposables) {
    disposables.push(disposable);

    return disposable;
};

export function folderDropIsSupported() {
    return isChrome || isFF || isEdge;
};

export function folderIsDropped(files, types) {
    var folders = 0, items = 0;

    for (var i = 0, f; f = files[i]; i++) { // iterate in the files dropped
        if (!f.type && f.size % 4096 == 0) folders++;
        else items++;
    }

    if (folders && !items) {
        // folder is dropped
        return true;
    } else if (!folders && items) {
        // file is dropped
        return false;
    } else {
        if (!types) {
            return true;
        }

        for (var i = 0, len = types.length; i < len; i++) {
            var item = types[i];
            // folder is dropped
            if (item == 'Files') return true;
        }
        // other is dropped
        return false;
    }
};

let NUMBER_EXAMPLE: number = 12345;

let wholeNumberToString = function (number, precision) {
    var string = (number / Math.pow(10, precision)).toString();

    if (string.indexOf("e") !== -1) {
        string = "0.";
        var numberLength = number.toString().length;
        for (var i = 0; i < precision - numberLength; i++) {
            string += "0";
        }
        string += number;
    }
    return Globalize.format(Number(string), "n" + precision);
};

export function getExampleString(precision) {
    return wholeNumberToString(NUMBER_EXAMPLE, precision);
};

export function isElementOverflowing(text, el) {
    var $el = $(el),
        $contentAsElement = $('<div>' + htmlEncode(text) + '</div>'),
        isOverflowing;

    $contentAsElement.css({
        position: 'absolute',
        left: -9999,
        top: -9999,
        // ensure that the span has same font properties as the element
        'text-indent': $el.css('text-indent'),
        'font-family': $el.css('font-family'),
        'font-size': $el.css('font-size'),
        'font-weight': $el.css('font-weight'),
        'font-style': $el.css('font-style'),
        'padding-left': $el.css('padding-left'),
        'padding-right': $el.css('padding-right'),
        'border-left-width': $el.css('border-left-width'),
        'border-left-style': $el.css('border-left-style'),
        'border-right-width': $el.css('border-right-width'),
        'border-right-style': $el.css('border-right-style')
    });
    $('body').append($contentAsElement);

    isOverflowing = $contentAsElement[0].getBoundingClientRect().width > el.getBoundingClientRect().width;
    $contentAsElement.remove();

    return isOverflowing;
};

/**
* @param sourceField { DWField } field from source file cabinet
* @param targetField { DWField } field from target file cabinet
*
* Uses in FCSelector UI component, to compare types of two fields which should be mapped
*/
export function areFieldsCompatible(sourceField: dev.docuware.com.settings.filecabinet.Field, targetField: dev.docuware.com.settings.filecabinet.Field) {
    var numeric = dev.docuware.com.settings.interop.DWFieldType.Numeric;
    var decimal = dev.docuware.com.settings.interop.DWFieldType.Decimal;

    if ((sourceField.DWType === numeric || sourceField.DWType === decimal) &&
        (targetField.DWType === numeric || targetField.DWType === decimal)) {
        return true;
    }

    return sourceField.DWType === targetField.DWType;
}

export function getArrangedArray<T>(originalArr: T[], arr: T[], options?: { inArray: (array: T[], item: T) => number }): T[] {
    options = $.extend({
        inArray: (array, item) => {
            return array.indexOf(item);
        }
    }, options);

    let workArr: T[] = Array.prototype.concat([], arr),
        arrangedArray: T[] = [];

    for (var i = 0; i < originalArr.length; i++) {
        let indexInArray = options.inArray(workArr, originalArr[i]);

        if (indexInArray < 0) return arr;

        arrangedArray.push(originalArr[i]);
        workArr.splice(indexInArray, 1);
    }
    if (workArr.length) return arr;

    return arrangedArray;
}

export function generateRandomPassword(length?: number) {
    //To satisfy the security policy the password must have
    //min length - 30 
    //capital letter
    //lower case letter
    //special symbols - [!""#$%&'()*+,./:;<=>?@\^_`{|}~-]
    //So we can use GUID for password, because guid.length = 36 and contains special symbol '-'.
    let pwd = this.guid().toLowerCase().replace(/[a-z]/, chr => chr.toUpperCase());
    if (length && length < 36)
        pwd = pwd.substring(0, 10);
    return pwd;
}

export function copyToClipboard(text: string, containerSelector = "body"): JQueryPromise<any> {
    let success = false,
        currentFocus = document.activeElement,
        $temp = $("<textarea>");

    $(containerSelector).append($temp); //TODO: should we add some div somewhere in the viewer and attach it there
    $temp.val(text).select();

    try { //try/catch needed for Mozilla
        success = document.execCommand("copy");
    }
    catch (e) {
    }
    $temp.remove();
    if (currentFocus && $.isFunction((<any>currentFocus).focus)) {
        (<any>currentFocus).focus();
    }

    if (success)
        return resolvedDeferred.promise();

    var task = Deferred();
    if (!success && (<any>navigator).permissions) { //supported in FF and Chrome
        (<any>navigator).permissions.query({ name: "clipboard-write" }).then(
            result => {
                if (result.state == "granted" || result.state == "prompt") {
                    try { //try write to the clipboard now
                        (<any>navigator).clipboard.writeText(text).then(task.resolve, task.reject);
                    } catch (ex) {
                    }
                }
                else { //the permission to the clipboard is denied
                    task.reject();
                }
            },
            result => {
                if (isFF) { //Firefox does not yet support the "clipboard-read" and "clipboard-write" permissions (this else if should be removed in the future)
                    try {//Even under all the assumptions so far FF still could return error because this is not exactly "user interaction event"
                        (<any>navigator).clipboard.writeText(text).then(task.resolve, task.reject);
                        return;
                    } catch (ex) {
                    }
                    task.reject();
                } else
                    task.reject();
            }); //internal API error (e.g. there is no "clipboard-write" permission)
    } else //Finally we give up - not FF neither Chrome nor it is working...
        task.reject();

    return task.promise();
}

export function reloadBrowser(reason: string = "", dialogButtonText: string = "OK", beforeReload: () => void = () => { }) {
    toastr.confirm("", reason,
        (confirm) => {
            beforeReload();
            window.setTimeout(() => {
                window.parent.location.reload();
            }, 100);
        }, {
            buttons: {
                'ok': toastr.defaults.buttons.ok
            } as ToastrButtons,
            roles: { confirm: 'ok', cancel: 'ok' },
            okText: dialogButtonText
        });
}

export function extendMethod<T>(method: (...args) => T, override: (result: T, ...args) => T) {
    return (...args) => {
        let result = method.apply(this, args);
        args.unshift(result);
        return override.apply(this, args);
    }
}

export function isVisible(element: HTMLElement) {
    return element.style.position !== 'fixed' ?
        element.offsetParent !== null :
        window.getComputedStyle(element).display !== 'none';
}

export function alterListeningForDWResizeEvent(element: HTMLElement, startListening: boolean, attribute: 'data-dw-resizableDialog' | 'data-dw-resizable') {
    if (startListening) {
        $(element).attr(attribute, 'true');
        setTimeout(function () {
            updateLayout(element);
        }, 0);
    }
    else {
        $(element).removeAttr(attribute);
    }
}
export function addTemplates(templates: Array<{ id: string, content: string }>) {
    templates.forEach(function (tpl) {
        var s = document.createElement('script');
        s.id = tpl.id;
        s.innerHTML = tpl.content;
        s.type = 'text/html';
        document.head.appendChild(s);
    });
}