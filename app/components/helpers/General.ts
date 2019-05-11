import { Types } from 'mongoose';

export function cloneObject<T>(obj: T, idMap?: Map<string, string>): T {
  const objToClone = obj && (obj as any)._doc ? (obj as any)._doc : obj;

  if (objToClone && objToClone._id) {
    if (idMap) {
      idMap[objToClone._id] = idMap[objToClone._id] || new Types.ObjectId();
      objToClone._id = idMap[objToClone._id];
    } else {
      objToClone._id = new Types.ObjectId();
    }
  }

  if (objToClone) {
    for (let key in objToClone) {
      if (objToClone.hasOwnProperty(key)) {
        if (Object.prototype.toString.call(objToClone[key]) === '[object Array]') {
          for (let i = 0; i < objToClone[key].length; i++) {
            if (!Types.ObjectId.isValid(objToClone[key][i])) {
              cloneObject(objToClone[key][i], idMap);
            }
          }
        } else if (Object.prototype.toString.call(objToClone[key]) === '[object Object]' &&
          !Types.ObjectId.isValid(objToClone[key])) {
          cloneObject(objToClone[key], idMap);
        }
      }
    }
  }
  return objToClone;
}
