var path = require('path');
var utils = require("loader-utils");
var eval = require('eval');

function splitTemplate(source) {
  
  var loads = [];
  source.replace(/<script[^>]*>([^]*?)<\/script>/gmi, function (tag, content) {
      var matches = tag.match(/<script [^>]*id=["']([a-zA-Z0-9-_]+)["'][^>]*>/i);
      if (!matches) {
          throw new Error('invalid subtemplate');
      }
      loads.push({
          name: matches[1],
          content: content
      });
  });

  return loads;
}


function loader(source) {
  var callback = this.async();
  
  this.cacheable();
  
  //console.log('source', source.replace("module.exports = ", ""));

  var templates = splitTemplate(eval(source));
  if (templates.length == 0) {
    var options = utils.getOptions(this);

    var name = options && options.name || "[name]-[ext]";
  
    if (typeof name === "function") {
      name = name(utils.interpolateName(this, "[path][name].[ext]", {}));
    }
  
    name = utils.interpolateName(this, name, {});
  
    var caseInsensitive = options && options.caseInsensitive;
  
    if (caseInsensitive) {
      name = name.toLowerCase();
    }

    templates.push({
      name: name,
      content: eval(source)
    });
  }
  var modulePath = path.resolve(__dirname, 'string-template-engine');
  
  var result = [
    "var ko = require('knockout');", 
    "require('"+modulePath+"').initStringTemplateEngine(ko);", 
    "ko.templateSources.stringTemplate.caseInsensitive = " + (caseInsensitive ? "true" : "false") + ";", 
  ];

  templates.forEach((value, i) => {
    result.push("ko.templates['" + value.name + "'] = " + JSON.stringify(value.content) + ";")
  });

  callback(null, result.join("\n"));
}

module.exports = loader;