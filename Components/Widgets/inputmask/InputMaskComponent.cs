using DocuWare.Web.Mvc.Resources.Bundling;
using System.Collections.Generic;
using System.Linq;

namespace DocuWare.Web.Mvc.Resources.SharedResources.Components
{
    public class InputMaskComponent : ComponentDefinition
    {
        public InputMaskComponent()
            : base(dependencies: GetDependencies(), scripts: GetScripts())
        { }
        private static IEnumerable<ComponentDefinition> GetDependencies()
        {
            return new ComponentDefinition[]
            {
                ComponentDefinition.Get<ExternalComponent>(),
                ComponentDefinition.Get<DWCoreComponent>()
            };
        }
        private static List<ResourceDefinition> GetScripts()
        {
            var t = typeof(InputMaskComponent);
            return new List<ResourceDefinition>(new string[] 
            { 
                "jquery.inputmask.bundle.js",
                "ko.bindingHandlers.inputMask.js",
            }
            .Select(s => new ResourceDefinition(t, string.Format("{0}/inputmask/js/{1}", ComponentDefinition.SharedWidgetComponentsPath, s))));
        }
    }
}
