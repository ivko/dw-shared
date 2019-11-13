using DocuWare.Web.Mvc.Resources.Bundling;
using System.Collections.Generic;
using System.Linq;

namespace DocuWare.Web.Mvc.Resources.SharedResources.Components
{
    public class QueryBuilderComponentApi : ComponentDefinition
    {
        public QueryBuilderComponentApi()
            : base(dependencies: GetDependencies(), scripts: GetScripts(), templates: GetTemplates(), localization: GetLocalization())
        { }

        private static IEnumerable<ComponentDefinition> GetDependencies()
        {
            return new ComponentDefinition[]
            {
                ComponentDefinition.Get<ExternalComponent>(),
                ComponentDefinition.Get<DWCoreComponent>(),
                ComponentDefinition.Get<DWUIComponent>(),
                ComponentDefinition.Get<AppComponents.AppComponents>()
            };
        }

        private static LocalizationDefinition GetLocalization()
        {
            return new LocalizationDefinition("QueryBuilder", "~/bin/SharedResources/Components/AppComponents/QueryBuilder/Localization");
        }

        private static List<ResourceDefinition> GetScripts()
        {
            var t = typeof(QueryBuilderComponentApi);
            return new List<ResourceDefinition>(new string[]
            {
                "qbAutocompleteMenu.js",
                "ComponentApi.js",
                "QueryBuilderVM.js",
                "GroupConditionVM.js",
                "ConditionVM.js"
            }
            .Select(s => new ResourceDefinition(t, string.Format("{0}/QueryBuilder/Scripts/{1}", ComponentDefinition.SharedAppComponentsPath, s))));
        }

        private static List<ResourceDefinition> GetTemplates()
        {
            return new List<ResourceDefinition>(new string[]
            {
                "QueryBuilder.html"
            }
            .Select(s => new ResourceDefinition(typeof(QueryBuilderComponentApi), string.Format("{0}/QueryBuilder/Templates/{1}", ComponentDefinition.SharedAppComponentsPath, s))));
        }
    }
}
