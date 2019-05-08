export const userTypes = [ 'PROFESSOR', 'NORMAL_USER' ];
const localUserTypes = userTypes.toStrEnum();
export type UserType = keyof typeof localUserTypes; 
