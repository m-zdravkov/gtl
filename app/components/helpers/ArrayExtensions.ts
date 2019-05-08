interface Array<T> {
  /**
   * Creates an enum out of array by copying the array values and making them keys
   *
   * @example
   * ["ARRAY_ITEM_ONE", "ARRAY_ITEM_TWO"].toStrEnum() =>
   * {
   *   ARRAY_ITEM_ONE: "ARRAY_ITEM_ONE",
   *   ARRAY_ITEM_TWO: "ARRAY_ITEM_TWO"
   * }
   */
  toStrEnum(): { [key: string]: T };
}

Array.prototype.toStrEnum = function <T extends string>(): {[K in T]: K} {
  const localEnum = this.reduce(
    (res, key) => {
      res[key] = key;
      return res;
    },
    Object.create(null));
  return Object.freeze(localEnum);
};
