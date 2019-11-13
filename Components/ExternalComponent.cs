using DocuWare.Web.Mvc.Resources.Bundling;
using DocuWare.Web.Mvc.Resources.Bundling.Base;
using DocuWare.Web.Resources; //TODO: remove and use components only
using System.Collections.Generic;
using System.Linq;

namespace DocuWare.Web.Mvc.Resources.SharedResources.Components
{
    public class ExternalComponent : ComponentDefinition
    {
        public ExternalComponent()
            : base(scripts: GetScripts())
        { }

        private static List<ResourceDefinition> GetScripts()
        {
            var t = typeof(ExternalComponent);
            return new IResource[] 
            {
                ResourcesRegistry.Jq20WithoutUiBundle,
                ResourcesRegistry.JqUi1114CustomBundle,
                ResourcesRegistry.Knockout3Bundle,
                ResourcesRegistry.MootoolsBundle
            }.Select(b => new ResourceDefinition(b))
            .Concat(new string[] 
            {
                "BigNumber/bignumber.js",
                "global.js",
                "pep-0.4.3.js",
                "hammer.js",
                "jstz.js",
                "jquery.mousewheel.js",
                "knockout-jquery-ui-widget.js",
                "jquery.event.drag-2.2.js",
                "jquery.event.drop-2.2.js",
                "jquery.base64.js",                
                "jquery.cookie.js",
                "jquery.browser.js",
                "ResizeObserver.js",
                "spin.js",
                "activity-indicator.js",
                //toastr - moved
                "moment.js",
                "ko.editables.js"
            }
            .Select(s => new ResourceDefinition(t, string.Format("{0}/{1}", ComponentDefinition.SharedComponentsPath, s))))
            .Concat(new string[] 
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
            .Select(s => new ResourceDefinition(t, string.Format("{0}/Globalize/{1}", ComponentDefinition.SharedComponentsPath, s))))
            .ToList();
        }
    }
}
