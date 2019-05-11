export const models = [];
const modelTypesEnum = models.toStrEnum();
export type ModelType = keyof typeof modelTypesEnum;
export enum modelEnum {
  BOOK = 'BOOK',
  BOOK_COPY = 'BOOK_COPY',
  CAMPUS = 'CAMPUS',
  USER = 'USER',
  WISHLIST_ITEM = 'WISHLIST_ITEM'
}

export const actions = [];
const actionTypesEnum = actions.toStrEnum();
export type ActionType = keyof typeof actionTypesEnum;
export enum actionEnum {
  CREATE = 'CREATE',
  LIST = 'LIST',
  FIND = 'FIND',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE'
}
