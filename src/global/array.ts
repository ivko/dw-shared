import * as ko from 'knockout';
import * as $ from 'jquery';
export {}
/* Array prototypes */
declare global {


    interface Object {
        /**
        * Returns an array of the objects' values
        *
        */
        values(obj: Object): any[];
    }
    
    interface Window {
        MutationObserver: MutationObserverFactory;
        WebKitMutationObserver: MutationObserverFactory;
        MozMutationObserver: MutationObserverFactory;
    }
    
    interface MutationObserverFactory {
        new (callback: (mutations: MutationRecord[]) => void): MutationObserver;
    }
    
    interface ILimitedResultObjectResult<T> {
        more: boolean,
        result: Array<T>
    }
    

    interface Array<T> {

        include(item: T): Array<T>;
        chunk(size: number): Array<Array<T>>;
        move(old_index: number, new_index: number): Array<T>;

        combine(array: T): T;
        isEmpty():boolean;

        /**
        * Limit array content
        * @param limit { number } - limit number
        */
       limitedResultObject<T>(limit: number): ILimitedResultObjectResult<T>;
    
       /**
       * Limit array content
       * @param sortDir { number } 
       * @param sortBy { string|number } 
       * @param caseInsensitive { boolean } 
       */
       alphanumSort(sortDir: number, sortBy: string | number, caseInsensitive: boolean);
   
       /**
       * Return if array contain duplicate values
       * @return { boolean }
       */
       containsDuplicatedValues(): boolean;
   
       /**
       * Removed duplicates from arrays
       * @return { array }
       */
       unique(prop?: string): any[];
   
       /**
       * Inserts element in array at given index
       * @return { array }
       */
       insert(index: number, item: T): T[];
   
       /**
       * @param conditionCallback - checks if the array element matches
       *
       * @return the first occurence of an element in a collection,
       *         passing the given condition check
       */
       first(conditionCallback: (element: T, index?: number) => boolean): T;
   
       isEmpty(): boolean;
   
       removeItem(item: T): void;
   
       contains(item: T): boolean;
        /**
         * Returns first element of an array that meet the condition specified in a callback function. 
         * @param predicate A function that accepts up to three arguments. The find method calls the predicate function one time for each element in the array until an item satisfies the predicate.
         * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
         */
        find(predicate: (value: T, index: number, array: T[]) => boolean): T;


        /**
         * Returns an array of elements that meet the conditions specified in both callback functions. 
         * @param filterPredicate A function that accepts up to three arguments. The filter method calls the callbackfn function one time for each element in the array.
         * @param mapPredicate A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array.
         * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
         */
        filterMap<U>(filterPredicate: (value: T, index: number, array: T[]) => boolean, mapPredicate: (value: T, index: number, array: T[]) => U): U[]





    }
}

if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (item, from) {
        var length = this.length >>> 0;
        for (var i = (from < 0) ? Math.max(0, length + from) : from || 0; i < length; i++) {
            if (this[i] === item) return i;
        }
        return -1;
    };
};

if (!Array.prototype.contains) {
    Array.prototype.contains = function (item, from=0) {
        return this.indexOf(item, from) != -1;
    };
};

if (!Array.prototype.include) {
    Array.prototype.include = function (item) {
        if (!this.contains(item)) this.push(item);
        return this;
    };
};

if (!Array.prototype.chunk) {
    Array.prototype.chunk = function (size) {
        var x,
            i = 0,
            c = -1,
            l = this.length || 0,
            n = [];

        if (size < 1) {
            return null;
        }

        while (i < l) {
            (x = i % size) ? n[c][x] = this[i] : n[++c] = [this[i]];
            i++;
        }
        return n;
    };
};

if (!Array.prototype.move) {
    Array.prototype.move = function (old_index, new_index) {
        while (old_index < 0) {
            old_index += this.length;
        }
        while (new_index < 0) {
            new_index += this.length;
        }
        if (new_index >= this.length) {
            var k = new_index - this.length;
            while ((k--) + 1) {
                this.push(undefined);
            }
        }
        this.splice(new_index, 0, this.splice(old_index, 1)[0]);
        return this;
    };
};

if (!Array.prototype.unique) {
    Array.prototype.unique = function () {
        return [].combine(this);
    };
};

if (!Array.prototype.find) {
    Array.prototype.find = function (predicate) {
        if (this == null) {
            throw new TypeError('Array.prototype.find called on null or undefined');
        }
        if (typeof predicate !== 'function') {
            throw new TypeError('predicate must be a function');
        }
        var list = Object(this),
            length = list.length >>> 0,
            thisArg = arguments[1],
            value;

        for (var i = 0; i < length; i++) {
            value = list[i];
            if (predicate.call(thisArg, value, i, list)) {
                return value;
            }
        }
        return undefined;
    };
};

if (!Array.prototype.filterMap) {
    Array.prototype.filterMap = function (filterPredicate, mapPredicate) {
        if (this == null) {
            throw new TypeError('Array.prototype.find called on null or undefined');
        }
        if (typeof filterPredicate !== 'function') {
            throw new TypeError('filterPredicate must be a function');
        }
        if (typeof mapPredicate !== 'function') {
            throw new TypeError('mapPredicate must be a function');
        }
        var list = Object(this),
            length = list.length >>> 0,
            thisArg = arguments[2],
            res = [], value;

        for (var i = 0; i < length; i++) {
            value = list[i];
            if (filterPredicate.call(thisArg, value, i, list)) {
                res.push(mapPredicate.call(thisArg, value, i, list));
            }
        }
        return res;
    };
};

if (!Array.prototype.isEmpty) {
    Array.prototype.isEmpty = function () {
        return this.length === 0;
    };
};

//Array extensions
Array.prototype.limitedResultObject = function (limit) {
    return { more: this.length > limit, result: this.slice(0, limit) };
};

Array.prototype.alphanumSort = function (sortDir, sortBy, caseInsensitive) {
    if (this.length <= 0) return;

    function setValue(indexer, property, value) {
        if ($.isFunction(indexer[property])) {
            indexer[property](value);
        }
        else {
            indexer[property] = value;
        }
    }

    function getSortResult(x1, x2, direction) {
        // if the two values are null the are equal return 0
        if (x1 == null && x2 == null) return 0;

        if (direction > 0) { // asc

            if (x1 > x2 || x2 == null) {
                return 1;
            } else if (x1 < x2 || x1 == null) {
                return -1;
            }
        } else if (direction < 0) { // desc
            if (x1 < x2 || x1 == null) {
                return 1;
            } else if (x1 > x2 || x2 == null) {
                return -1;
            }
        }
        return 0;
    };

    // first we iterrate the sorting values split each one into array whenever there's number
    for (var z = 0; z < this.length; z++) {
        var t = ko.unwrap(this[z][sortBy]);

        if (t == null || typeof t != 'string') {
            //t = [t]; 
            //setValue(this[z][sortBy], [t]);// make it array anyway and set the value.
            continue;
        }

        t = t.split(/(\d+)/);
        setValue(this[z], sortBy, t);
    }

    this.sort(function (a, b) {
        var val1 = ko.unwrap(a[sortBy]),
            val2 = ko.unwrap(b[sortBy]);
        
        // if the values are not strings, we have to do simple comparison
        if ((typeof val1 != 'string' && !$.isArray(val1)) || val1 == null ||
            (typeof val2 != 'string' && !$.isArray(val2)) || val2 == null) {
            return getSortResult($.isArray(val1) ? val1.join("") : val1, $.isArray(val2) ? val2.join("") : val2, sortDir);
        }

        // take the maximum length from both values and iterrate by it.
        for (var x = 0; x < Math.max(val1.length, val2.length); x++) {
            var aa = caseInsensitive && val1[x] ? val1[x].toLowerCase() : val1[x],
                bb = caseInsensitive && val2[x] ? val2[x].toLowerCase() : val2[x];

            if (aa !== bb) {
                var c = Number(aa), d = Number(bb);
                if (c == aa && d == bb) { // if it is number compare them as numbers ...
                    return getSortResult(c, d, sortDir);
                } else return getSortResult(aa, bb, sortDir);// ... if not compare the strings
            }
        }
        return a.length - b.length;
    });

    // finally we join the splitted earlier values back into one string
    for (var z = 0; z < this.length; z++) {
        var v = ko.unwrap(this[z][sortBy]);

        if (v == null || v == 'undefined' || !$.isArray(v))
            continue;
        
        setValue(this[z], sortBy, v.join(""));
    }
};

Array.prototype.containsDuplicatedValues = function () {
    this.sort();
    for (var i = 1; i < this.length; i++) {
        if (this[i - 1] == this[i])
            return true;
    }
    return false;
};
/* //duplicated
Array.prototype.unique = function (prop) {
    var a = this.concat();
    for (var i = 0; i < a.length; ++i) {
        for (var j = i + 1; j < a.length; ++j) {
            if (a[i][prop]) {
                if (a[i][prop] === a[j][prop])
                    a.splice(j--, 1);
            }
            else {
                if (a[i] === a[j])
                    a.splice(j--, 1);
            }
        }
    }
    return a;
};
 */
Array.prototype.insert = function (index, item) {
    return this.splice(index, 0, item);
};

Array.prototype.first = function (conditionCallback) {
    var first;
    this.some(function (element, i) {
        var isMatching = conditionCallback(element, i);
        if (isMatching) {
            first = element;
        }
        return isMatching;
    });
    return first;
};


Array.prototype.removeItem = function (item) {
    let index = this.indexOf(item);
    if (index > -1) {
        //splice modifies the array
        this.splice(index, 1);
    }
};
