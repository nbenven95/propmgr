/**
 * Checks if a value is nullish or falsey
 * @param {*} obj 
 */
const isNull = (obj) => {
  const nullSet = [undefined, null, false, ''];
  return nullSet.includes(obj);
}

export { isNull }