// Type definitions for Globalize
// Project: https://github.com/jquery/globalize
// only currently needed methods are defined, 

interface GlobalizeStatic {

    //format date or number
    format(value: Date | number, format?: string, cultureSelector?: string): string;

    //get default culture or specified by param cultureSelector 
    culture(cultureSelector?: string): any;

    addCultureInfo(cultureName: string, baseCultureName: string, info: any): void;

    // radix argument is optional
    parseFloat(value: string, radix: number | string, cultureSelector?: string): number;

    parseDate(value: string, formats: string | string[], cultureSelector: string): Date;

    findClosestCulture(name: string): any;

}

declare var Globalize: GlobalizeStatic;
