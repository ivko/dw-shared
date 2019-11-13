(function (factory) {
    if (typeof define === "function" && define.amd) { // AMD.
        define(["jquery", "knockout", "../../../Bindings/koJquiBindingFactory", "./spectrum"], factory);
    } else { // Global
        factory(jQuery, ko);
    }
}(function ($, ko) {
    ko.jqui.bindingFactory.create({
        name: 'spectrum',
        options: [
            'color',
            'flat',
            'showInput',
            'allowEmpty',
            'showButtons',
            'clickoutFiresChange',
            'showInitial',
            'showPalette',
            'showPaletteOnly',
            'hideAfterPaletteSelect',
            'togglePaletteOnly',
            'showSelectionPalette',
            'localStorageKey',
            'appendTo',
            'maxSelectionSize',
            'cancelText',
            'chooseText',
            'togglePaletteMoreText',
            'togglePaletteLessText',
            'clearText',
            'noColorSelectedText',
            'preferredFormat',
            'className',
            'containerClassName',
            'replacerClassName',
            'showAlpha',
            'theme',
            'palette',
            'selectionPalette',
            'disabled',
            'offset'
        ],
        events: [
            'change',
            'move',
            'show',
            'hide',
            'beforeShow'
        ],
        postInit: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var value = valueAccessor(), computed;

            if (value.value) {
                computed = ko.computed(function () {
                    $(element).spectrum('set', ko.utils.unwrapObservable(value.value));
                });
            }

            if (ko.isWriteableObservable(value.value)) {
                $(element).on('change.ko ' + allBindingsAccessor().valueUpdate ? 'move.spectrum.ko' : '', function (_, color) {
                    value.value(color.toHexString());
                });
            }

            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                computed && computed.dispose();
                $(element).off('.ko');
            });
        }
    });

    $.fn.spectrum.load = false;

    $.extend($.spectrum.palettes, {
        dw: [
            ["#ff8080", "#ffff80", "#80ff80", "#00ff80", "#80ffff", "#0080ff", "#ff80c0", "#ff80ff"],
            ["#ff0000", "#ffff00", "#80ff00", "#00ff40", "#00ffff", "#0080c0", "#8080c0", "#ff00ff"],
            ["#804040", "#ff8040", "#00ff00", "#008080", "#004080", "#8080ff", "#800040", "#ff0080"],
            ["#800000", "#ff8000", "#008000", "#008040", "#0000ff", "#0000a0", "#800080", "#8000ff"],
            ["#400000", "#804000", "#004000", "#004040", "#000080", "#000040", "#400040", "#400080"],
            ["#000000", "#808000", "#808040", "#808080", "#408080", "#c0c0c0", "#ffffff"]
        ],
        dwFileCabinetColors: [["#485258", "#bb3937", "#368d2e"], ["#fcb200", "#0089cf"]]
    });

    $.extend($.fn.spectrum.defaults, {
        showPaletteOnly: true,
        showPalette: true,
        hideAfterPaletteSelect: true,
        palette: $.spectrum.palettes.dw
    });

    //  <spectrum params="params: obj"></spectrum>
    ko.components.register('spectrum', {
        viewModel: function (params) {
            this.params = params.params || {};
        },
        template: '<input type="text" data-bind="spectrum: params" />'
    });

}));