export const models = [];
const modelTypesEnum = models.toStrEnum();
export type ModelType = keyof typeof modelTypesEnum;

export const actions = [];
const actionTypesEnum = actions.toStrEnum();
export type ActionType = keyof typeof actionTypesEnum;
