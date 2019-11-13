using DocuWare.Web.Mvc.Resources.Bundling;
using System.Collections.Generic;
using System.Linq;

namespace DocuWare.Web.Mvc.Resources.SharedResources.Components
{
    public class GlobalizeComponent : ComponentDefinition
    {
        public GlobalizeComponent()
            : base(scripts: GetScripts())
        { }
        private static List<ResourceDefinition> GetScripts()
        {
            var t = typeof(GlobalizeComponent);

            return new string[]
            {   
                "globalize.js",
                "globalize.culture-ar.js",
                "globalize.culture-bg.js",
                "globalize.culture-de.js",
                "globalize.culture-de-CH.js",
                "globalize.culture-el.js",
                "globalize.culture-en-AU.js",
                "globalize.culture-en-GB.js",
                "globalize.culture-en-US.js",
                "globalize.culture-es.js",
                "globalize.culture-fr.js",
                "globalize.culture-hr.js",
                "globalize.culture-it.js",
                "globalize.culture-ja.js",
                "globalize.culture-nl.js",
                "globalize.culture-pl.js",
                "globalize.culture-pt.js",
                "globalize.culture-ru.js",
                "globalize.culture-sv.js",
                "globalize.culture-zh.js",
                "dw.globalize.extensions.js"

            }
            .Select(s => new ResourceDefinition(t, string.Format("{0}/Globalize/{1}", ComponentDefinition.SharedComponentsPath, s)))
            .ToList();
        }
    }
}
