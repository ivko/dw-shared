(function (factory) {
    if (typeof define === "function" && define.amd) {
        define([
            "jquery",
            "knockout",
            "../utils",
            "../Widgets/numeric/js/utils.numeric",
            "./knockout.validation"
        ], factory);
    } else {
        factory(jQuery, ko);
    }
}(function ($, ko) {
    /* https://github.com/Knockout-Contrib/Knockout-Validation/wiki/User-Contributed-Rules 
    Validates that all values in an array are unique. 
    To initialize the simple validator provide an array to compare against. 
    By default this will simply compare do an exactly equal (===) operation against each element in the supplied array.
    For a little more control, initialize the validator with an object instead. The object should contain two properties: array and predicate. 
    The predicate option enables you to provide a function to define equality. The array option can be observable. 
    Note: This is similar to the 'arrayItemsPropertyValueUnique' rule but I find it to be more flexible/functional.

    SIMPLE EXAMPLE::
    model.thisProp.extend({ isUnique: model.thoseProps });

    COMPLEX EXAMPLE::
    model.selectedOption.extend({ isUnique: {
        array: model.options,
        predicate: function (opt, selectedVal) {
            return ko.utils.unwrapObservable(opt.id) === selectedVal;
        }
    }});
    */
    ko.validation.rules['isUnique'] = {
        validator: function (newVal, options) {
            if (options.predicate && typeof options.predicate !== "function")
                throw new Error("Invalid option for isUnique validator. The 'predicate' option must be a function.");

            var array = options.array || options;
            var count = 0;
            ko.utils.arrayMap(ko.utils.unwrapObservable(array), function (existingVal) {
                if (equalityDelegate()(existingVal, newVal)) count++;
            });
            return count < 2;

            function equalityDelegate() {
                return options.predicate ? options.predicate : function (v1, v2) { return v1 === v2; };
            }
        },
        message: 'This value is a duplicate',
    };

    //uniqueCaseInvariant in collection
    // options are:
    //    collection: array or function returning (observable) array
    //              in which the value has to be unique
    //    valueAccessor: function that returns value from an object stored in collection
    //              if it is null the value is compared directly
    //    external: set to true when object you are validating is automatically updating collection
    ko.validation.rules['uniqueCaseInvariant'] = {
        validator: function (val, options) {
            var c = ko.validation.utils.getValue(options.collection),
                external = ko.validation.utils.getValue(options.externalValue),
                counter = 0;

            if (!val || !$.isFunction(val.toLowerCase) || !c) { return true; }

            ko.utils.arrayFilter(c, function (item) {
                if (val.toLowerCase() === (options.valueAccessor ? options.valueAccessor(item) : (typeof item === 'string' ? item : item[0])).toLowerCase()) { counter++; }
            });
            // if value is external even 1 same value in collection means the value is not unique
            return counter < (!!external ? 1 : 2);
        },
        message: 'Please make sure the value is unique.'
    };

    // custom validation for decimal fields
    ko.validation.rules['isInvariantDecimal'] = {
        validator: function (value, isActive) {
            if (isActive)
                return String(value).search(/^\s*(\+|-)?((\d+(\.\d+)?)|(\.\d+))\s*$/) != -1;
            else
                return true;
        },
        message: 'The value is not invariant decimal'
    }
    // custom validation for numeric fields
    ko.validation.rules['isNumericValue'] = {
        validator: function (value, isActive) {
            if (isActive)
                return (typeof value === 'number');
            else
                return true;
        },
        message: 'The value is not valid numeric'
    }
    // custom validation for date fields
    ko.validation.rules['isDateValue'] = {
        validator: function (value, isActive) {
            if (isActive)
                return (((typeof value) === 'object') && value !== undefined && value !== null && value !== '');
            else
                return true;
        },
        message: 'The value is not valid date'
    }
    // custom validation for relative date/datetime fields
    ko.validation.rules['isRelativeDateValue'] = {
        validator: function (value, isActive) {
            if (isActive)
                return (value !== undefined && value !== null && value === '');
            else
                return true;
        },
        message: 'The value is not valid relative date'
    }
    // custom validation for relative text fields
    ko.validation.rules['isTextValue'] = {
        validator: function (value, isActive) {
            if (isActive)
                return (((typeof value) === 'string') && value !== '' && !!value.trim());
            else
                return true;
        },
        message: 'The value is not valid text'
    }
    // custom validation for PredefinedPropertyVM customPredefinedValue
    ko.validation.rules['isRealObject'] = {
        validator: function (value, isActive) {
            if (isActive) {
                return DW.Utils.isRealObject(value);
            }
            else
                return true;
        },
        message: 'The value is not valid text'
    }
    // custom validation for decimal range fields
    ko.validation.rules['isRangeDecimal'] = {
        validator: function (toValue, fromValue) {
            var fieldsAreEmpty = DW.Utils.isEpmtyNullUndefined(fromValue) && DW.Utils.isEpmtyNullUndefined(toValue);
            return !fieldsAreEmpty && DW.Utils.compareDecimalStrings(fromValue, toValue, '<=');
        },
        message: 'The values are not valid range decimals'
    }
    // custom validation for numeric range fields
    ko.validation.rules['isRangeNumeric'] = {
        validator: function (toValue, fromValue) {
            var fieldsAreNotEmpty = !DW.Utils.isEpmtyNullUndefined(fromValue) && !DW.Utils.isEpmtyNullUndefined(toValue);
            var fieldsAreEmpty = DW.Utils.isEpmtyNullUndefined(fromValue) && DW.Utils.isEpmtyNullUndefined(toValue);
            return !fieldsAreEmpty && (fromValue <= toValue || !fieldsAreNotEmpty);
        },
        message: 'The values are not valid range numerics'
    }
    // custom validation for date range fields
    ko.validation.rules['isRangeDate'] = {
        validator: function (toValue, fromValue) {
            // result later are strings 2050-05-05 so compare date part only
            fromValue = DW.Utils.getNormalizedDate(fromValue);
            toValue = DW.Utils.getNormalizedDate(toValue);

            var fieldsAreNotEmpty = !DW.Utils.isEpmtyNullUndefined(fromValue) && !DW.Utils.isEpmtyNullUndefined(toValue);
            var fieldsAreEmpty = DW.Utils.isEpmtyNullUndefined(fromValue) && DW.Utils.isEpmtyNullUndefined(toValue);
            return (!fieldsAreEmpty && ((fromValue <= toValue) || !fieldsAreNotEmpty));
        },
        message: 'The values are not valid range date'
    }
    // custom validation for datetime range fields
    ko.validation.rules['isRangeDateTime'] = {
        validator: function (toValue, fromValue) {
            var fieldsAreNotEmpty = !DW.Utils.isEpmtyNullUndefined(fromValue) && !DW.Utils.isEpmtyNullUndefined(toValue);
            var fieldsAreEmpty = DW.Utils.isEpmtyNullUndefined(fromValue) && DW.Utils.isEpmtyNullUndefined(toValue);
            return (!fieldsAreEmpty && ((fromValue <= toValue) || !fieldsAreNotEmpty));
        },
        message: 'The values are not valid range datetime'
    }
    // custom validation for relative fields
    ko.validation.rules['relativeValidator'] = {
        validator: function (value, validatorLog) {
            if (validatorLog === 'date' || validatorLog === 'datetime') {
                return !DW.Utils.isEpmtyNullUndefined(value);
            }
            return false;
        },
        message: 'The value is not valid relative field'
    }
    // custom validation for unique field passed by boolean param - can be used by the parent by the parent
    ko.validation.rules['passedParamValidator'] = {
        validator: function (value, isNotValid) {
            return !isNotValid;
        },
        message: 'The item is not valid'
    }
    // custom validation for positive numbers
    ko.validation.rules['isPositive'] = {
        validator: function (value, isActive) {
            if (isActive) {
                return value > 0;
            }
            else
                return true;
        },
        message: 'The number must be positive'
    }

    // custom validation function
    ko.validation.rules['customFunc'] = {
        validator: function (value, func) {
            return func(value);
        },
        message: 'The number must be positive'
    }

    ko.validation.registerExtenders();

    // use to add params in the configuration options
    // can add automatic html/css class update handler
    $.extend(ko.validation.configuration , {
        insertMessages: false,
        decorateElement: false, // true for apply the class style
        decorateInputElement: false, // true for apply the class style
        errorElementClass: 'has-validation-error',
        decorateElementOnModified: false
    })

}));