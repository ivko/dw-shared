//TODO: add to architecture
namespace DW.IndexAssignment.Models {
    import IValidation = Interfaces.IValidation;

    export class ValidationFactory {
        create(storageToFileCabinet: boolean): IValidation[] {
            //let validations = IValidation[] = [];

            //if (storageToFileCabinet) {
            //    validations.push(new LengthValidation());
            //    validations.push(new ReadOnlyValidation());
            //}

            //return validations;
            throw new Error("Not implemented");
        }

        createValidationsForTray(): IValidation[] {
            throw new Error("Not implemented");
        }

        createValidationsForFileCabinet(): IValidation[] {
            throw new Error("Not implemented");
        }

        createMinimalValidations(): IValidation[] {
            throw new Error("Not implemented");
        }
    }
}