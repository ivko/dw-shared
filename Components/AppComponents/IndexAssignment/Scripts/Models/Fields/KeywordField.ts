namespace DW.IndexAssignment.Models.Fields {

    //field masks are only allowed for text & keyword fields in DocuWare
    export class KeywordField extends BaseFieldMaskField {
        name: string = 'KeywordField';
    }
}