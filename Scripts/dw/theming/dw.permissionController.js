function PermissionController(customOptions) {
    var self = this;
    self.plugin;
    var options = {
        pluginOptions: {
            height: 195,
            captions: customOptions.captions,
            callbackfunction: customOptions.customMethod,
            highCountTrigger: customOptions.highCountTrigger
        },
        selector: "",
        owner: "",
        //Here are some default values. 
        //Real values are passed from caller
        entityTypes: [
            {
                "Id": 0,
                "Name": "User"
            },
            {
                "Id": 1,
                "Name": "Role"
            }
        ],
        entityRights: [
            {
                "Id": 0,
                "Name": "User"
            },
            {
                "Id": 1,
                "Name": "Administrator"
            }
        ]
    };

    // merge settings in options to defaults
    $.extend(options, customOptions);

    self.lock = function () {
        if (!self.hasLock())
            self.plugin.permissionPlugin('option', 'locked', true);
    }

    self.unlock = function () {
        if (self.hasLock())
            self.plugin.permissionPlugin('option', 'locked', false);
    }

    self.hasLock = function () {
        return self.plugin.permissionPlugin("option", "locked");
    }

    self.render = function () {
        //reset plugin if already exists
        if (self.plugin != undefined) {
            self.plugin.permissionPlugin('destroy');
        }

        // enable permissions control
        self.plugin = $(options.selector).permissionPlugin(options.pluginOptions);
    }

    self.mapPermissions = function (permissionsToMap) {
        //object to represent OPTGROUP
        function Group(id, label, children) {
            this.id = id;
            this.label = label;
            this.children = children;
        }

        //object to represent OPTION
        function Option(value, label, selectedin, locked, allowed) {
            this.value = value;
            this.label = label;
            this.selectedinTab = selectedin;
            this.lockedinTab = locked;
            this.allowedinTab = allowed;
        }

        var data = new Array();
        $(permissionsToMap).each(function (index, rolesArr) {
            var roleType = rolesArr[0];
            var roleTypeId;
            var roleTypeName;

            if (roleType != undefined) {
                roleTypeId = roleType.Type;

                //search for entityType(=sourceTab)
                $(options.entityTypes).each(function (i, type) {
                    if (type.Id == roleTypeId) {
                        roleTypeName = type.Name;
                        return;
                    }
                })
            }
            else {
                return;
            }



            data.push(new Group(roleTypeId, roleTypeName,
                $.map(rolesArr, function (val, idx) {
                    //if Org. Admin comes along as role type
                    //this must be only available as user if current user has right to manage users
                    var allowedList;
                    var arr = new Array()
                    $(options.entityRights).each(function (i, el) {
                        //if there is no property 'RoleType' coming from server -> its possible to add user/role as User/Administrator
                        //this is needed for supporting other modules like DWRequest
                        if (val.RoleType == undefined) {
                            arr.push(el.Id.toString())
                        }
                        //if current right is a normal "user" -> its possible to add user/role as User/Administrator
                        else if (val.RoleType != undefined && val.RoleType != 4) {
                            arr.push(el.Id.toString())
                        }
                        //if its is org. admin
                        else if (val.RoleType != undefined && val.RoleType == 4) {
                            //only in case the current loggedin user is able to manage users
                            //Otherwise current user is also able to add Org. Admin as Administrator(el.Id == 0)
                            if (rolesArr[1] != undefined || el.Id != 0)
                                arr.push(el.Id.toString())
                        }
                    });
                    allowedList = arr.join(",");



                    var combinedSelect = (val.Rights != undefined) ? val.Rights.join(",") : "";
                    var lockTo;
                    if (options.owner == val.Name && options.owner != null && options.owner != undefined) {
                        //where to lock owner?
                        lockTo = 1
                    }
                    else if (val.Locked) {
                        lockTo = combinedSelect
                    }

                    return new Option(val.Guid, val.Name, combinedSelect, lockTo, allowedList);
                })
      ))
        });

        return data;
    }



    self.getAssignedPermissions = function () {
        //object to represent one single permission entity
        function Entity(value, label, selectedin, type) {
            var isSelected = (selectedin != null && selectedin.length > 0);

            //define properties
            this.Name = label;
            this.Guid = value;
            this.Type = type;
            this.IsAssigned = isSelected
            this.Rights = (isSelected) ? selectedin : null;
        }


        //access SELECT element
        var list = $(options.selector + " SELECT")
        //this holds group of roles including corresponding single entities
        var data = new Array();

        //iterate through OPTGROUPS
        //and transform into entity object
        $("OPTGROUP", list).each(function (i, roles) {
            var group = new Array();

            //to get single role
            var role = $(roles).attr("id");
            $("OPTION", roles).each(function (index, entity) {

                //set properties
                var guid = $(entity).val();
                var name = $(entity).text();

                var rights = $(entity).attr("selectedin");
                var rightsArr = null;
                if (rights != undefined && rights != "") {
                    rightsArr = $.map(rights.split(","), function (val, idx) {
                        if (val != "") { return val; }
                    })
                }

                //add to group
                group.push(new Entity(guid, name, rightsArr, role));
            })
            data.push(group);
        })

        return data;
    }

    self.EntityRights = function () {
        return options.entityRights;
    }
}
