(function( factory ) {
    if ( typeof define === "function" && define.amd ) {
        define(["jquery", "knockout", "globalize"], factory);
    } else {
        factory(jQuery, ko);
    }
}(function ($, ko) {
    // var max = '790000000000000000000000000', //(7.9 × 10^27)
    //    min = '-790000000000000000000000000';//(-7.9 × 10^27)

    DW = DW || {};
    DW.Utils = DW.Utils || {};

    var maxNumeric = 2147483647,
        maxDecimal = '999999999999999999999999999',
        minDecimal = '-999999999999999999999999999';

    $.extend(DW.Utils, {
        stringDecimalNumberUnify: function (val) {
            return (val.toString().replace(eval("/\\" + Globalize.culture().numberFormat[","] + "/g"), "").replace(eval("/\\" + Globalize.culture().numberFormat["."] + "/g"), "."));
        },

        getNumericValueOptions: function (precision, max, min) {
            precision = precision || 0;
            precision = precision < 0 ? 0 : precision;
            max = max || maxNumeric;
            max = max / Math.pow(10, precision);
            min = min || -max;
            return {
                max: max,
                min: min,
                precision: precision
            };
        },

        getDecimalValueOptions: function (precision) {

            var values = this._recalculateMinMaxDecimals({ min: minDecimal, max: maxDecimal }, precision);
            // not reusing numeric method because of the math operations
            return {
                max: values.max,
                min: values.min,
                precision: precision,
                isDecimal: true
            };
        },

        adjustInvariantDecimalPrecision: function (invariantDecimal, precision) {
            if (invariantDecimal) {
                var parts = invariantDecimal.split(".");
                if (parts) {
                    if (parts.length === 1 && precision > 0) {
                        //precision = 2
                        //then "5" -> "5.00"
                        invariantDecimal += ".";
                        for (var i = 0; i < precision; i++) {
                            invariantDecimal += "0";
                        }
                    }
                    else if (parts.length === 2 && parts[1].length > precision) {
                        //precision = 2
                        //then "5.678" -> "5.67"
                        parts[1] = parts[1].substring(0, precision);
                        if (parts[1] !== "")
                            invariantDecimal = parts.join(".");
                        else
                            invariantDecimal = parts[0];
                    }
                }
            }
            
            return invariantDecimal;
        },

        isNumber: function (value) {
            return (typeof value == 'number' || value instanceof Number) && $.isNumeric(value);
        },

        isInvariantDecimal: function (s) {
            return String(s).search(/^\s*(\+|-)?((\d+(\.\d+)?)|(\.\d+))\s*$/) != -1;
        },

        isEpmtyNullUndefined: function (value) {
            return ((typeof value) === null || (typeof value) === 'undefined' || value === '' || value === null);
        },

        isEmptyNullUndefinedWhitespace: function (value) {
            if ((typeof value) === 'string')
                value = value.trim();

            return this.isEpmtyNullUndefined(value);
        },

        // the method could work correctly with comparisson '<=' or '<'
        compareDecimalStrings: function (min, max, comparisson) {
            // The min & max should be format ##########.#### (no thousand separators, point as decimal separator)
            // Need to replace the decimal and thousand separators to unify the different cultures comparing
            // min = this.stringDecimalNumberUnify(min);
            // max = this.stringDecimalNumberUnify(max);
            if (DW.Utils.isEpmtyNullUndefined(min) || DW.Utils.isEpmtyNullUndefined(max)) { return true; }

            // split values by the decimal separator
            var splitedDecimalMin = min.toString().split(".");
            var splitedDecimalMax = max.toString().split(".");

            // check for plus or minus
            var stateOfSigns = this._checkForNegativeValues(splitedDecimalMin, splitedDecimalMax);
            if (stateOfSigns === true) { return true; }
            if (stateOfSigns === false) { return false; }
            // else continue

            // compare left parts lengths
            var maxIsBigger = (splitedDecimalMin[0].length < splitedDecimalMax[0].length) ? true : false;
            var minIsBigger = (splitedDecimalMin[0].length > splitedDecimalMax[0].length) ? true : false;
            if (maxIsBigger) { return stateOfSigns === 'continue-positive' ? true : false; }
            if (minIsBigger) { return stateOfSigns === 'continue-positive' ? false : true; }
            // compare left part symbols
            var leftPartsLengths = splitedDecimalMin[0].length;
            var minSymbol, maxSymbol;
            for (var i = 0; i < leftPartsLengths; i++) {

                minSymbol = parseInt(splitedDecimalMin[0][i]);
                maxSymbol = parseInt(splitedDecimalMax[0][i]);

                if (minSymbol < maxSymbol) { return stateOfSigns === 'continue-positive' ? true : false; }
                if (minSymbol > maxSymbol) { return stateOfSigns === 'continue-positive' ? false : true; }
            }
            // compare rigth parts
            var rightPartsLength = this._fixEqualStringLengths(splitedDecimalMin, splitedDecimalMax);

            for (var i = 0; i < rightPartsLength; i++) {

                minSymbol = parseInt(splitedDecimalMin[1][i]);
                maxSymbol = parseInt(splitedDecimalMax[1][i]);

                if (minSymbol < maxSymbol) { return stateOfSigns === 'continue-positive' ? true : false; }
                if (minSymbol > maxSymbol) { return stateOfSigns === 'continue-positive' ? false : true; }
            }
            // if still equal - return the last numbers comparison '<=' or '<'
            return stateOfSigns === 'continue-positive' ? eval(minSymbol + comparisson + maxSymbol) : eval('-' + minSymbol + ' ' + comparisson + ' ' + '-' + maxSymbol);
        },

        _recalculateMinMaxDecimals: function (data, precision) {
            if (precision && precision > 0) {

                var splitedMinArray = data.min.split('');
                var minLength = splitedMinArray.length;

                var splitedMaxArray = data.max.split('');
                var maxLength = splitedMaxArray.length;

                splitedMinArray.splice(minLength - precision, 0, ".");
                data.min = splitedMinArray.join("");

                splitedMaxArray.splice(maxLength - precision, 0, ".");
                data.max = splitedMaxArray.join("");
            }
            return data;
        },

        _checkForNegativeValues: function (splitedDecimalMin, splitedDecimalMax) {
            var minFirstSign = splitedDecimalMin[0].charAt(0);
            var maxFirstSign = splitedDecimalMax[0].charAt(0);

            if (minFirstSign === '-' && maxFirstSign !== '-') {
                return true;
            }
            else if (minFirstSign !== '-' && maxFirstSign === '-') {
                return false;
            }
            else if (minFirstSign === '-' && maxFirstSign === '-') {
                return 'continue-negative';
            }
            else {
                return 'continue-positive';
            }
        },

        _fixEqualStringLengths: function (splitedDecimalMin, splitedDecimalMax) {

            splitedDecimalMin[1] = splitedDecimalMin[1] === undefined ? '0' : splitedDecimalMin[1];
            splitedDecimalMax[1] = splitedDecimalMax[1] === undefined ? '0' : splitedDecimalMax[1];

            var biggestLeftLength = splitedDecimalMin[1].length <= splitedDecimalMax[1].length ? splitedDecimalMax[1].length : splitedDecimalMin[1].length;
            var leftPartMinSplitted = splitedDecimalMin[1].split('');
            var leftPartMaxSplitted = splitedDecimalMax[1].split('');

            for (var i = 0; i < biggestLeftLength; i++) {

                leftPartMinSplitted[i] = leftPartMinSplitted[i] === undefined ? '0' : leftPartMinSplitted[i];
                leftPartMaxSplitted[i] = leftPartMaxSplitted[i] === undefined ? '0' : leftPartMaxSplitted[i];
            }

            splitedDecimalMin[1] = leftPartMinSplitted.join("");
            splitedDecimalMax[1] = leftPartMaxSplitted.join("");

            return biggestLeftLength;
        }
    });
}));