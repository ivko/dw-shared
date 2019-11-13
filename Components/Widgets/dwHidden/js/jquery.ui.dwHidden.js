(function ($, undefined) {

    $.fn.dwHide = function (duration, easing, callback) {
        this.addClass('ui-hidden');
        this.css('display', '');
        callback.call();
    }

    $.fn.dwShow = function (duration, easing, callback) {
        this.removeClass('ui-hidden');
        this.css('display', '');
        callback.call();
    }
})(jQuery);