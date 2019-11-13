using DocuWare.Web.Mvc.Resources.Bundling;
using System.Collections.Generic;
using System.Linq;

namespace DocuWare.Web.Mvc.Resources.SharedResources.Components
{
    public class IndexAssignmentComponent : ComponentDefinition
    {
        public IndexAssignmentComponent()
            : base(scripts: GetScripts(), templates: GetTemplates(), localization: GetLocalization())
        { }

        private static List<ResourceDefinition> GetScripts()
        {
            var t = typeof(IndexAssignmentComponent);
            return new List<ResourceDefinition>(new []
                {
                    "IndexAssignment.js",
                    "Models/DwFieldType.js",

                    "Models/Values/StringValue.js",
                    "Models/Values/NumericValue.js",
                    "Models/Values/EmailPropertyValue.js",
                    "Models/Values/DateValue.js",

                    "Models/ValidationError.js",
                    "Models/Exceptions/MissingRequiredFieldError.js",
                    "Models/Exceptions/FieldMaskValidationError.js",

                    "Models/Validations/RequiredFieldValidation.js",
                    "Models/Validations/ReadOnlyValidation.js",
                    "Models/Validations/LengthValidation.js",
                    "Models/Validations/FieldMaskValidation.js",

                    "Models/Fields/BaseField.js",
                    "Models/Fields/BaseFieldMaskField.js",
                    "Models/Fields/TextField.js",
                    "Models/Fields/NumberField.js",
                    "Models/Fields/NullField.js",
                    "Models/Fields/MemoField.js",
                    "Models/Fields/KeywordField.js",
                    "Models/Fields/EmailPropertyField.js",
                    "Models/Fields/DateTimeField.js",

                    "Models/ValueSources/BaseValueSource.js",
                    "Models/ValueSources/EmailPropertyValueSource.js",
                    "Models/ValueSources/FixedValueSource.js",
                    "Models/ValueSources/NullValueSource.js",
                    "Models/ValueSources/KeywordValueSource.js",

                    "Models/ValueSourceFactories/EmailPropertySourceFactory.js",
                    "Models/ValueSourceFactories/FixedValueSourceFactory.js",
                    "Models/ValueSourceFactories/NullValueSourceFactory.js",
                    "Models/ValueSourceFactories/KeywordValueSourceFactory.js",

                    "Models/IndexFields/BaseIndexField.js",
                    "Models/IndexFields/EmptyIndexField.js",
                    "Models/IndexFields/IndexField.js",

                    "Models/ValidationEntry.js",
                    "Models/ValidationFactory.js",
                    "Models/ValidationModel.js",
                    "Models/SettingsService.js",
                    "Models/ValidationModelFactory.js",

                    "Controllers/ValueInput/BaseValueInputTemplate.js",
                    "Controllers/ValueInput/EmailPropertyTemplate.js",
                    "Controllers/ValueInput/FixedValueDateTemplate.js",
                    "Controllers/ValueInput/FixedValueNumberTemplate.js",
                    "Controllers/ValueInput/FixedValueStringTemplate.js",
                    "Controllers/ValueInput/NullValueTemplate.js",
                    "Controllers/ValueInput/KeywordTemplate.js",
                    "Controllers/ValueInput/InputTemplate.js",
                    "Controllers/IndexAssignmentTableItem.js",

                    "Controllers/ViewController.js",
                }
                .Select(s => new ResourceDefinition(t, $"{SharedAppComponentsPath}/IndexAssignment/Scripts/{s}")));
        }

        private static List<ResourceDefinition> GetTemplates()
        {
            return new List<ResourceDefinition>(new []
                {
                    "IndexingGrid.html"
                }
                .Select(s => new ResourceDefinition(typeof(IndexAssignmentComponent), $"{SharedAppComponentsPath}/IndexAssignment/Templates/{s}")));
        }

        private static LocalizationDefinition GetLocalization()
        {
            return new LocalizationDefinition("IndexAssignment", "~/bin/SharedResources/Components/AppComponents/IndexAssignment/Localization");
        }
    }
}

