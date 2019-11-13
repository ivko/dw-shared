(function (factory) {
    if (typeof define === "function" && define.amd) { // AMD.
        define(["jquery", "jquery-ui"], factory);
    } else { // Global
        factory(jQuery);
    }
}(function ($) {
    $.widget('dw.dwAccordion', $.ui.accordion, {


    });
}));
