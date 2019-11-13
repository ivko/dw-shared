(function () {
    var SyncType = {
        Export: 0,
        Sync: 1,
        Custom: 2
    };

    var Utils = new Class({
        convertFCColorToString: function (fcColor) {
            switch (fcColor.toLowerCase()) {
            case 'ff000000':
                return 'Black';
            case 'ffff0000':
                return 'Red';
            case 'ff008000':
                return 'Green';
            case 'ffffff00':
                return 'Yellow';
            case 'ff0000ff':
                return 'Blue';
            default: return '';
            }
        }
    });

    extend(ns('DW.FCSelector'), {
        Utils: Utils,
        SyncType: SyncType
    });
})();