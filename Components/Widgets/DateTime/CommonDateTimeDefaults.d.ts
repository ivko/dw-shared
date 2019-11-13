declare module DW.DateTime{
    export var CommonSettings: any;

    export function getCommonDateTimeDefaults(options: { getCultureInfo(): string }): any; //CommonSettings: TODO
    export function setCommonDateTimeDefaults(options: { getCultureInfo(): string }): any;
    
    export function fromString(value: string): Date;
    export function fromISODateString(value: string): Date;
    export function toISODateString(value: Date): string;
    export function toUtcISODateTimeString(value: Date): string;
    export function getRangeStartDate(value: Date): Date;
    export function getRangeEndDate(value: Date): Date;
    export function getDateFromSSDate(value: string): Date;
    export function getDateForSS(value: Date): Date;
    export function normalizeDate(date: Date): Date;
    export function getDateTimeRangeEnd(value: Date): Date;
    export function getLocalizedDateStringFromISO(dateValue: any): string;
    export function getLocalizedDateTimeString(dateValue: any): string;
    export function getLocalizedUTCDateTimeString(dateValue: any): string;
    export function compareDateTimes(date: Date, originalDate: Date): boolean;
    export function getValidDateTime(date: Date): Date;
    export function getCurrentTimeZoneId(): string;
}