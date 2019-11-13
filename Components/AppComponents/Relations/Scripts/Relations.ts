/// <reference path="TypedSettingsHeader.ts" />
/// <reference path="RelationsTableRowVM.ts" />
/// <reference path="RelationsVM.ts" />

namespace DW.Relations {
    let localizationResources = (<any>window).DWResources.Relations;
    export function localize(key: string, params?: any) {
        return DW.Utils.format((localizationResources && localizationResources[key]) || key || '', params);
    }

    export class Relations extends DW.Disposable {
        public relationsTableVM: KnockoutObservable<RelationsVM> = ko.observable<RelationsVM>();
        constructor() {
            super();
        }

        public init(relations: Array<dev.docuware.com.settings.relations.Relationship>, usersAndRolesCache: DW.UsersAndRolesCache, settingsGuid: string, currentUserGuid: string, relationsSettingsType: dev.docuware.com.settings.relations.RelationSettingsType): void {
            let relationsVM = new RelationsVM(relations, usersAndRolesCache,
                settingsGuid,
                currentUserGuid,
                relationsSettingsType);
            this.relationsTableVM(relationsVM || null);
        }

        public getRelations(): Array<dev.docuware.com.settings.relations.Relationship> {
            return this.relationsTableVM().newRelations();
        }
    }
}