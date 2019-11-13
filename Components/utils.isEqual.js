(function (factory) {
    if (typeof define === "function" && define.amd) { // AMD.
        define(['./global'], factory);
    } else { // Global
        factory();
    }
}(function () {
    var definition = new Class({
        TYPES: {
            //base types
            array: 'array',
            number: 'number',
            object: 'object',
            string: 'string',
            bool: 'boolean',
            //custom types
            date: 'date',
            float: 'float',
            int: 'integer',
        },
        _equal: {},
        _isCaseSensitive: true,
        initialize: function () {
            this._equal = {
                array: this.compareArrays.bind(this),
                object: this.compareObjects.bind(this),
                date: function (a, b) {
                    return a.getTime() === b.getTime();
                },
                regexp: function (a, b) {
                    return a.toString() === b.toString();
                },
                string: function (a, b) {
                    return this._isCaseSensitive ?
                        a === b : a.toLowerCase() === b.toLowerCase();
                }.bind(this)
            };

            //uncoment to support function as string compare
            //this._equal.fucntion = this._equal.regexp;
        },
        getClass: function (val) {
            return Object.prototype.toString.call(val)
                .match(/^\[object\s(.*)\]$/)[1];
        },
        //Defines the type of the value, extended typeof
        whatis: function (val) {
            var type = typeof val;

            switch (type) {
                case this.TYPES.object:
                    type = this.getClass(val).toLowerCase();
                    break;
                case this.TYPES.number:
                    type = val.toString().indexOf('.') > 0 ?
                        this.TYPES.float : this.TYPES.int;
                    break;
            }
            return type;
        },
        compareObjects: function (a, b) {
            if (a === b)
                return true;
            for (var i in a) {
                if (b.hasOwnProperty(i)) {
                    if (!this.equal(a[i], b[i]))
                        return false;
                } else {
                    return false;
                }
            }

            for (var i in b) {
                if (!a.hasOwnProperty(i)) {
                    return false;
                }
            }
            return true;
        },
        compareArrays: function (a, b) {
            if (a === b)
                return true;
            if (a.length !== b.length)
                return false;
            for (var i = 0; i < a.length; i++) {
                if (!this.equal(a[i], b[i])) return false;
            }
            return true;
        },
        equal: function (a, b, isCaseSensitive) {
            if (typeof isCaseSensitive === this.TYPES.bool) {
                this._isCaseSensitive = isCaseSensitive;
            }

            if (a !== b) {
                var atype = this.whatis(a),
                    btype = this.whatis(b);
                if (atype === btype)
                    return this._equal.hasOwnProperty(atype) ? this._equal[atype](a, b) : a == b;
                return false;
            }
            return true;
        }
    });

    var definitionForSkip = new Class({
        Extends: definition,
        _propertiesToSkip: [],
        equal: function (a, b, propertiesToSkip, isCaseSensitive) {
            if (typeof isCaseSensitive === this.TYPES.bool) {
                this._isCaseSensitive = isCaseSensitive;
            }
            if (Array.isArray(propertiesToSkip)) {
                this._propertiesToSkip = propertiesToSkip;
            }

            if (a !== b) {
                var atype = this.whatis(a),
                    btype = this.whatis(b);
                if (atype === btype) {
                    return this._equal.hasOwnProperty(atype) ? this._equal[atype](a, b) : a == b;
                }
                return false;
            }
            return true;
        },
        compareObjects: function (a, b) {
            if (a === b) {
                return true;
            }
            for (var i in a) {
                if (this._propertiesToSkip.indexOf(i) !== -1) {
                    continue;
                }
                if (b.hasOwnProperty(i)) {
                    if (!this.equal(a[i], b[i])) {
                        return false;
                    }
                } else {
                    return false;
                }
            }

            for (var i in b) {
                if (this._propertiesToSkip.indexOf(i) !== -1) {
                    continue;
                }
                if (!a.hasOwnProperty(i)) {
                    return false;
                }
            }
            return true;
        }
    });
    var instance = new definition,
        skippingInstance = new definitionForSkip;

    extend(ns('DW.Utils'), {
        isEqual: instance.equal.bind(instance),
        isEqualSkippingProperties: skippingInstance.equal.bind(skippingInstance)
    });
}));
