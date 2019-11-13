(function (factory) {
    if (typeof define === "function" && define.amd) { // AMD.
        define(["jquery", "knockout"], factory);
    } else { // Global
        factory(jQuery, ko);
    }
}(function ($, ko) {
    ko.bindingHandlers.doughnut = {
        update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            $(element).empty();

            var options = ko.unwrap(valueAccessor());

            var sections = options.values,
                $this = $(element),
                start = 0,
                offset = 0,
                total = 0,
                n = 0;

            sections.forEach(function (val) {
                $this.append('<div data-doughnut-value="' + val + '"></div>');
            })

            $this.find("> div").each(function () {
                var item = $(this);
                var value = item.data("doughnut-value");
                item.append('<div class="before"></div>');

                if (value > 50) {
                    item.addClass("big");
                }

                total += value;
                n++;
            }).each(function (index, el) {
                var item = $(this);
                var value = Math.round(item.data("doughnut-value") * 3.6); //because the value is percent

                if (total >= 99.9 && n == index + 1) {
                    value = 360 - start;
                }

                item.css({
                    '-webkit-transform': 'rotate(' + (start + offset) + 'deg)',
                    '-moz-transform': 'rotate(' + (start + offset) + 'deg)',
                    '-o-transform': 'rotate(' + (start + offset) + 'deg)',
                    'transform': 'rotate(' + (start + offset) + 'deg)'
                });

                item.find('.before').css({
                    '-webkit-transform': 'rotate(' + (value + 1) + 'deg)',
                    '-moz-transform': 'rotate(' + (value + 1) + 'deg)',
                    '-o-transform': 'rotate(' + (value + 1) + 'deg)',
                    'transform': 'rotate(' + (value + 1) + 'deg)'
                });

                start += value;
            });
        }
    };
}));