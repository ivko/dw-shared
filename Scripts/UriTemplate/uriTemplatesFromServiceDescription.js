(function (w) {
    w.UriTemplates = function (templates) {
        var self = this;
        var resources = new Array();

        for (var i = 0; i < templates.length; i++) {
            resources[templates[i].Name] = {
                pattern: templates[i].UriPattern,
                parsed: null
            };
        }

        this.createUri = function (templateName, parameters) {
            var resource = resources[templateName];
            if (resource == null)
                throw "The template '" + templateName + "' is not specified.";
            if (resource.parsed == null)
                resource.parsed = UriTemplate.parse(resource.pattern);
            return resource.parsed.expand(parameters);
        }
    };
})(this);
