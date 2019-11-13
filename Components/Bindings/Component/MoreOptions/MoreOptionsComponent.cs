using DocuWare.Web.Mvc.Resources.Bundling;
using System.Collections.Generic;
using System.Linq;

namespace DocuWare.Web.Mvc.Resources.SharedResources.Components
{
    public class MoreOptionsComponent : ComponentDefinition
    {
        public MoreOptionsComponent()
            : base(dependencies: GetDependencies(), scripts: GetScripts(), templates: GetTemplates(), localization: GetLocalization())
        { }
        private static IEnumerable<ComponentDefinition> GetDependencies()
        {
            return new ComponentDefinition[]
            {
                ComponentDefinition.Get<ExternalComponent>(),
                ComponentDefinition.Get<DWCoreComponent>()
            };
        }

        private static LocalizationDefinition GetLocalization()
        {
            return new LocalizationDefinition("MoreOptions", "~/bin/SharedResources/Components/Bindings/Component/MoreOptions/Localization");
        }

        private static List<ResourceDefinition> GetScripts()
        {
            var t = typeof(MoreOptionsComponent);
            return new List<ResourceDefinition>(new string[]
            {
                "Bindings/Component/MoreOptions/Scripts/MoreOptionsComponent.js",
                "Bindings/Component/MoreOptions/Scripts/MoreOptionsVM.js"
            }
            .Select(s => new ResourceDefinition(t, string.Format("{0}/{1}", ComponentDefinition.SharedComponentsPath, s))));
        }

        private static List<ResourceDefinition> GetTemplates()
        {
            return new List<ResourceDefinition>(new string[]
            {
                "Bindings/Component/MoreOptions/Templates/MoreOptionsComponent.html",
            }
            .Select(s => new ResourceDefinition(typeof(MoreOptionsComponent), string.Format("{0}/{1}", ComponentDefinition.SharedComponentsPath, s))));
        }
    }
}
