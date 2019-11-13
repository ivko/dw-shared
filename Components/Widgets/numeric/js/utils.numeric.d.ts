declare module DW.Utils {

    /**
    * Provides unified decimal string - removes thousands separators and puts '.' as a decimal separator
    * @param val - number or string
    * @return { string }
    */
    export function stringDecimalNumberUnify(val: number | string): string;

    /**
    * Make options for the numericValue float number binding
    * @param precision { number }
    * @param max { number }
    * @param min { number }
    * @return { JSON }
    */
    export function getNumericValueOptions(precision: number, max?: number, min?: number): { max: number, min: number, precision: number };

    /**
    * Make options for the numericValue decimal string binding
    * @param precision { number }
    * @return { JSON }
    */
    export function getDecimalValueOptions(precision: number): { max: string, min: string, precision: number, isDecimal: boolean };

    /**
    * Checks if the number is invariant decimal: no thousands separators and '.' as a decimal separator
    * @param s { number }
    * @return { boolean }
    */
    export function isNumber(value: any): boolean;

    /**
    * Checks if the number is invariant decimal: no thousands separators and '.' as a decimal separator
    * @param s { number }
    * @return { boolean }
    */
    export function isInvariantDecimal(s: string): boolean;

    /**
    * Checks if the value is empty string null or undefined
    * @param value { any }
    * @return { boolean }
    */
    export function isEpmtyNullUndefined(value: any): boolean;

    /**
    * Checks if the value is empty string, whitespace, null or undefined
    * @param value { any }
    * @return { boolean }
    */
    export function isEmptyNullUndefinedWhitespace(value: any): boolean;

    /**
    * Compare decimal strings with '<=' or '<'
    * the method could work correctly with comparisson '<=' or '<'
    * @param min 
    * @param max 
    * @param comparisson 
    * @return { string }
    */
    export function compareDecimalStrings(min: string | number, max: string | number, comparisson: string): string;

    /**
   * Adds decimal digits acc to the precision. Ex: 0.1 with precision 4 will become 0.1000
   * @param data { JSON }
   * @param precision { number }
   * @return { JSON }
   */
    function _recalculateMinMaxDecimals(data: { max: string, min: string, precision: number, isDecimal: boolean }, precision: number): { max: string, min: string, precision: number, isDecimal: boolean };

    /**
   * Indicates the sign of compared numbers
   * @param splitedDecimalMin { string[] }
   * @param splitedDecimalMax { string[] }
   * @return { boolean }
   */
    function _checkForNegativeValues(splitedDecimalMin: string[], splitedDecimalMax: string[]): boolean;

    /**
   * Adding zeros to the end of shorter string
   * @param splitedDecimalMin { string[] }
   * @param splitedDecimalMax { string[] }
   * @return { number }
   */
    function _fixEqualStringLengths(splitedDecimalMin: string[], splitedDecimalMax: string[]): number;
} 