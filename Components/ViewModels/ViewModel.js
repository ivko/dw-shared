(function (factory) {
    if (typeof define === "function" && define.amd) {
        define(["../global", "./Disposable"], factory);
    } else {
        factory();
    }
}(function () {
    var ViewModel = new Class({
        Extends: DW.Disposable
    });

    extend(ns('DW'), { ViewModel: ViewModel });
}))