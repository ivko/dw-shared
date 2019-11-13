using DocuWare.Web.Mvc.Resources.Bundling;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DocuWare.Web.Mvc.Resources.SharedResources.Components
{
    public class ErrorComponent : ComponentDefinition
    {
        public ErrorComponent()
            : base(dependencies: GetDependencies(), scripts: GetScripts(), localization: GetLocalization())
        { }

        private static IEnumerable<ComponentDefinition> GetDependencies()
        {
            return new ComponentDefinition[]
            {
                ComponentDefinition.Get<ExternalComponent>(),
                ComponentDefinition.Get<DWCoreComponent>(),
                ComponentDefinition.Get<ToastrComponent>()
            };
        }

        private static List<ResourceDefinition> GetScripts()
        {
            return new string[]
            {
                "Error.js",
                "ErrorHandlers.js"
            }
            .Select(s => new ResourceDefinition(typeof(ErrorComponent), string.Format("{0}/ErrorComponent/{1}", ComponentDefinition.SharedComponentsPath, s)))
            .ToList();
        }

        private static LocalizationDefinition GetLocalization()
        {
            return new LocalizationDefinition("Error", "~/bin/SharedResources/Components/ErrorComponent/Localization");
        }
    }
}
