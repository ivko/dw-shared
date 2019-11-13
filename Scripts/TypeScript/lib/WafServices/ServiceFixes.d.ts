// at this time this file has to be maintained manually

declare module System {
    export interface TimeSpan { }

    module Collections.Generic {
        export interface Dictionary<TKey, TValue> { }
    }
}


// only exists on client side -> see PluginBase\Scripts\Shared\Service.js for more information

declare module Server {
    interface ISettingsService {
        getUserCredentials(): UserCredentials
    }
    interface UserCredentials {
        Guid: string,
        Name: string,
        organizationGuid: string,
        organizationName: string
    }
}