(function () {
    var UsersAndRolesCache = new Class({
        Extends: DW.ViewModel,
        //getAllUsersAndRoles: function () {
        //    return DW.When(App.fcService.getUserHeaders(null), App.fcService.getRoleHeaders(null));
        //},
        initialize: function (getAllUsersAndRoles) {
            this._getAllUsersAndRoles = DW.Utils.lazyDeferred(function (dfd) {
                this.addDisposableTask(getAllUsersAndRoles())
                    .then(function (users, roles) {
                        var mapItems = function (items) {
                            return (items || []).reduce(function (map, item) { // convert to map
                                map[item.Guid] = item;
                                return map;
                            }, {});
                        };
                        dfd.resolve(mapItems(users), mapItems(roles), users, roles);
                    }, dfd.reject)
            });
        },

        _findIt: function (guids, mappedItems, items) {
            if (guids === null || guids === undefined) return items;
            if (typeOf(guids) !== "array") guids = [guids];

            var result = [];
            (guids || []).forEach(function (guid) {
                if (mappedItems[guid])
                    result.push(mappedItems[guid]);
            });
            return result;
        },

        getUsers: function (guids) {
            return this._getAllUsersAndRoles().then((function (mappedUsers, mappedRoles, users, roles) {
                return this._findIt(guids, mappedUsers, users);
            }).bind(this));
        },

        getRoles: function (guids) {
            return this._getAllUsersAndRoles().then((function (mappedUsers, mappedRoles, users, roles) {
                return this._findIt(guids, mappedRoles, roles);
            }).bind(this));
        },
        dispose: function () {
            this._getAllUsersAndRoles = null;
            this.parent();
        }
    });

    extend(ns('DW'), { UsersAndRolesCache: UsersAndRolesCache });
})();