using DocuWare.Web.Mvc.Resources.Bundling;
using System.Collections.Generic;
using System.Linq;

namespace DocuWare.Web.Mvc.Resources.SharedResources.Components
{
    public class QueryBuilderComponent : RenderableComponentDefinition
    {
        public QueryBuilderComponent()
            : base(dependencies: GetDependencies(), scripts: GetScripts())
        {}

        private static IEnumerable<ComponentDefinition> GetDependencies()
        {
            return new ComponentDefinition[]
            {
                ComponentDefinition.Get<QueryBuilderComponentApi>()
            };
        }
        

        private static List<ResourceDefinition> GetScripts()
        {
            var t = typeof(QueryBuilderComponent);
            return new List<ResourceDefinition>(new string[] 
            {
                "SettingsService.js",
                "ConditionProviders/BaseConditionProviderVM.js",
                "ConditionProviders/BaseRangeConditionProviderVM.js",
                "ConditionProviders/BaseRelativeConditionProviderVM.js",
                "ConditionProviders/RelativeDateTimeConditionProviderVM.js",
                "ConditionProviders/SqlConditionProviderVM.js",
                "ConditionProviders/TextConditionProviderVM.js",
                "ConditionProviders/DateConditionProviderVM.js",
                "ConditionProviders/EmptyConditionProviderVM.js",
                "ConditionProviders/KeyWordConditionProviderVM.js",
                "ConditionProviders/MemoConditionProviderVM.js",
                "ConditionProviders/NumericConditionProviderVM.js",
                "ConditionProviders/DecimalConditionProviderVM.js",
                "ConditionProviders/RangeDateConditionProviderVM.js",
                "ConditionProviders/RangeDateTimeConditionProviderVM.js",
                "ConditionProviders/RangeNumericConditionProviderVM.js",
                "ConditionProviders/RangeDecimalConditionProviderVM.js",
                "ConditionProviders/RelativeDateConditionProviderVM.js",
                "QueryBuilderComponent.js"
            }
            .Select(s => new ResourceDefinition(t, string.Format("{0}/QueryBuilder/Scripts/{1}", ComponentDefinition.SharedAppComponentsPath, s))));
        }
    }
}