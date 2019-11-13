(function ($, ko) {
    ko.bindingHandlers.svgOverlay = {
        init: function (element, valueAccessor, allBindingsAccessor, data, context) {
            var model = ko.utils.unwrapObservable(valueAccessor());
            var prepareSvg = function (/*model,*/ svg) {
                var viewBox = svg[0].getAttribute('viewBox');
                if (!viewBox)
                    return;
                var viewBoxArr = viewBox.split(" ");
                var width = parseInt(viewBoxArr[2]),
                    height = parseInt(viewBoxArr[3]);
                //A default parameter is used for the thumbnail size into the query so I cannot use a real data for the svg size. This works only because the platform returns 80x80 by default which is teh defalt size here
                var svgDemensions = width > height ? { width: model.size, height: model.size * height / width } : { width: model.size * width / height, height: model.size };
                svg[0].setAttribute('style', 'width:' + svgDemensions.width + 'px; height:' + svgDemensions.height + 'px;');
            };

            if (!model.link) {
                return;
            }
            if (model.svg) {
                prepareSvg(/*model,*/ model.svg);
                $(element).append(model.svg);
                return;
            }

            var img = new Image();
            img.src = model.link;
            img.onload = function (data) {
                //NOTE - PATCH FOR IE11 (width property doesn't get set there and stays 0 all the time)
                var width = img.width ? img.width : img.clientWidth;
                var height = img.height ? img.height : img.clientHeight;
                var svgDemensions = width > height ? { width: model.size, height: model.size * height / width } : { width: model.size * width / height, height: model.size };
                img.width = svgDemensions.width;
                img.height = svgDemensions.height;
            };
            $(element).append(img);

            var dispose = function () {
                ko.utils.domNodeDisposal.removeDisposeCallback(element, dispose);
            };
            ko.utils.domNodeDisposal.addDisposeCallback(element, dispose);
        }
    };
})(jQuery, ko);