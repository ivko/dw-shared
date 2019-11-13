using DocuWare.Web.Mvc.Resources.Bundling;
using DocuWare.Web.Resources;
using System.Collections.Generic;

namespace DocuWare.Web.Mvc.Resources.SharedResources.Components
{
    public class NameDescriptionComponent: ComponentDefinition
    {
        private static string resourceBasePath = "~/SharedResources/Components/Widgets/NameDescriptionComponent/";
        
        public NameDescriptionComponent()
            : base(dependencies: GetDependencies(), scripts: GetScripts(), templates: GetTemplates())
        { }

        private static IEnumerable<ComponentDefinition> GetDependencies()
        {
            return new ComponentDefinition[]
            {

            };
        }

        private static List<ResourceDefinition> GetResource(string path)
        {
            var sharedType = typeof(ResourcesRegistry);
            var t = typeof(NameDescriptionComponent);

            return new List<ResourceDefinition>() {
                    new ResourceDefinition(t, resourceBasePath + path),
                };
        }

        private static List<ResourceDefinition> GetScripts()
        {
            return GetResource("scripts/NameDescriptionComponentVM.js");
        }

        private static List<ResourceDefinition> GetTemplates()
        {
            return GetResource("templates/name-description-template.html");
        }
    }
}