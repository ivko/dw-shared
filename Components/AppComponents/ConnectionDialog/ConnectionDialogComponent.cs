using DocuWare.Web.Mvc.Resources.Bundling;
using System.Collections.Generic;
using System.Linq;

namespace DocuWare.Web.Mvc.Resources.SharedResources.Components
{
    public class ConnectionDialogComponent : ComponentDefinition
    {
        public ConnectionDialogComponent()
            : base(scripts: GetScripts(), templates: GetTemplates(), localization: GetLocalization()/*, dependencies: GetDependencies()*/)
        { }

        /*private static IEnumerable<ComponentDefinition> GetDependencies()
        {
            return new ComponentDefinition[]
            {
                ComponentDefinition.Get<FieldsMappingComponent>()
            };
        }*/

        private static List<ResourceDefinition> GetScripts()
        {
            var t = typeof(ConnectionDialogComponent);
            return new List<ResourceDefinition>(new string[]
                {
                    "ComponentApi.js",
                    "ConnectionDialog.js",
                    "ConnectionDialogVM.js"
                }
                .Select(s => new ResourceDefinition(t, string.Format("{0}/ConnectionDialog/Scripts/{1}", ComponentDefinition.SharedAppComponentsPath, s))));
        }

        private static List<ResourceDefinition> GetTemplates()
        {
            return new List<ResourceDefinition>(new string[]
                {
                    "ConnectionDialog.html",
                    "Dialogs.html"
                }
                .Select(s => new ResourceDefinition(typeof(ConnectionDialogComponent), string.Format("{0}/ConnectionDialog/Templates/{1}", ComponentDefinition.SharedAppComponentsPath, s))));
        }

        private static LocalizationDefinition GetLocalization()
        {
            return new LocalizationDefinition("ConnectionDialog", "~/bin/SharedResources/Components/AppComponents/ConnectionDialog/Localization");
        }
    }
}
