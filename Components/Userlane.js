(function (factory) {
    if (typeof define === "function" && define.amd) { // AMD.
        define(['./global'], factory);
    } else { // Global
        factory(ko);
    }
}(function (ko) {
    function loadUserlane() {
        if (window['UserlaneCommandObject'] === 'Userlane' && window['Userlane']) return;
        window['UserlaneCommandObject'] = 'Userlane';
        window['Userlane'] = window['Userlane'] || function () {
            (window['Userlane'].q = window['Userlane'].q || []).push(arguments);
        };
        var script = document.createElement('script'),
            firstScript = document.getElementsByTagName('script')[0];
        script.async = 1;
        script.src = 'https://cdn.userlane.com/userlane.js';
        firstScript.parentNode.insertBefore(script, firstScript);
    }

    extend(ns('DW'), {
        Userlane: function (id, commands) {

            loadUserlane();
            
            (commands || []).forEach(function (command) {
                Userlane.apply(null, command);
            });
            
            Userlane('init', id);
        },
        BuildUserlaneVersionTags: function (versionSettings) {
            return [
                "Minor" + versionSettings.Minor,
                "Major" + versionSettings.Major,
                "Version" + versionSettings.Major + "." + versionSettings.Minor,
                "Build" + versionSettings.Build
            ];
        },
        BuildUserlaneKSTemplateNameTag: function (organizationName) {
            return organizationName.substring(organizationName.lastIndexOf("(") + 1, organizationName.lastIndexOf(")"));
        }
    });
}));