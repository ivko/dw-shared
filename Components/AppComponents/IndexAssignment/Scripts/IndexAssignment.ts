namespace DW.IndexAssignment {
    let localizationResources = (<any>window).DWResources.IndexAssignment;
    export function localize(key: string, params?: any) {
        return DW.Utils.format((localizationResources && localizationResources[key]) || key || '', params);
    }
}