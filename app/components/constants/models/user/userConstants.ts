export enum userTypesEnum {
  PROFESSOR = 'PROFESSOR',
  NORMAL_USER = 'NORMAL_USER'
}
export const userTypes = [ userTypesEnum.PROFESSOR, userTypesEnum.NORMAL_USER];
const localUserTypes = userTypes.toStrEnum();
export type UserType = keyof typeof localUserTypes;

export enum  userGracePeriodDays {
  PROFESSOR = 14,
  NORMAL_USER = 7
}

export const maxLoans = 5;
