
declare namespace DW {
    
    export interface StorageInterface {
        init(): JQueryPromise<any>;
        contains(key: string): boolean;
        write(key: string, value: any, opts?: any): void;
        read(key: string, defaultValue?: any): any;
        remove(key: string): void;
    }

    interface PersistStateInterface {
        persistItem(subkey, value): KnockoutObservable<any>;
        updateItem(subkey: string, value: any, opts?: any): void;
        loadItem(subkey: string, defaultValue?: any, skipExpirationUpdate?: boolean): any;
    }

    interface PersistStateFactoryInterface {
        getPersistState(persistKey: string): PersistStateInterface;
        getSessionPersistState(persistKey: string): PersistStateInterface;
    }

    class BaseStorage implements StorageInterface {
        init(): JQueryPromise<any>;
        contains(key: string): boolean;
        write(key: string, value: any, opts?: any): void;
        read(key: string, defaultValue?: any): any;
        remove(key: string): void;
    }

    class LocalStorage extends BaseStorage { }

    class SessionLocalStorage extends BaseStorage { }

    class PersistState implements PersistStateInterface {
        constructor(options: { persistKey: string, storage: StorageInterface });
        persistItem(subkey, value): KnockoutObservable<any>;
        updateItem(subkey: string, value: any, opts?: any): void;
        loadItem(subkey: string, defaultValue?: any, skipExpirationUpdate?: boolean): any;
    }

    module PersistFactoryPrototype {
        export function get(mainKey: string, storage: StorageInterface): PersistStateFactoryInterface;
    }
}