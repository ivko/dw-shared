namespace DW.IndexAssignment.Interfaces {
    export interface IValueSourceFactory {
        readonly name: string;

        create(dwField: IDwField): IValueSource;
    }
}