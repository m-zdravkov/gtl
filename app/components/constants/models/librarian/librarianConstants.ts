export const librarianTypes = [ 'CHIEF', 'DEPARTMENTAL_ASSOCIATE', 'REFERENCE',
    'CHECK_OUT', 'ASSISTANT'];
export enum librarianTypesEnum {
    CHIEF = 'CHIEF',
    DEPARTMENTAL_ASSOCIATE = 'DEPARTMENTAL_ASSOCIATE',
    REFERENCE = 'REFERENCE',
    CHECK_OUT = 'CHECK_OUT',
    ASSISTANT = 'ASSISTANT'

}
const localLibrarianTypes = librarianTypes.toStrEnum();
export type LibrarianType = keyof typeof localLibrarianTypes;

export enum  librarianPermissions {
    CHIEF = 'CHIEF_PERM',
    DEPARTMENTAL_ASSOCIATE = 'DEPARTMENTAL_ASSOCIATE_PERM',
    REFERENCE = 'REFERENCE_PERM',
    CHECK_OUT = 'CHECK_OUT_PERM',
    ASSISTANT = 'ASSISTANT_PERM'
}
