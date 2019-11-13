using DocuWare.Web.Mvc.Resources.Bundling;
using System.Collections.Generic;
using System.Linq;

namespace DocuWare.Web.Mvc.Resources.SharedResources.Components
{
    public class FieldsMappingComponent : ComponentDefinition
    {
        public FieldsMappingComponent()
            : base(scripts: GetScripts(), templates: GetTemplates(), localization: GetLocalization()/*, dependencies: GetDependencies()*/)
        { }


        //private static IEnumerable<ComponentDefinition> GetDependencies()
        //{
        //    return new ComponentDefinition[]
        //    {
        //        ComponentDefinition.Get<ExternalComponent>(),
        //        ComponentDefinition.Get<DWCoreComponent>(),
        //        ComponentDefinition.Get<DWUIComponent>(),
        //        ComponentDefinition.Get<AppComponents>()
        //    };
        //}

        private static List<ResourceDefinition> GetScripts()
        {
            var t = typeof(FieldsMappingComponent);
            return new List<ResourceDefinition>(new string[]
            {
                //"Utils.js",
                "ComponentApi.js",
                "FieldsMappingDialogVM.js",
                "FieldsMappingDialog.js",
                "FieldMappingVM.js"
            }
            .Select(s => new ResourceDefinition(t, string.Format("{0}/FieldsMapping/Scripts/{1}", ComponentDefinition.SharedAppComponentsPath, s))));
        }

        private static List<ResourceDefinition> GetTemplates()
        {
            return new List<ResourceDefinition>(new string[]
            {
                "FieldsMappingDialog.html",
                "Dialogs.html"
            }
            .Select(s => new ResourceDefinition(typeof(FieldsMappingComponent), string.Format("{0}/FieldsMapping/Templates/{1}", ComponentDefinition.SharedAppComponentsPath, s))));
        }

        private static LocalizationDefinition GetLocalization()
        {
            return new LocalizationDefinition("FieldsMapping", "~/bin/SharedResources/Components/AppComponents/FieldsMapping/Localization");
        }
    }
}
