import sysPath from 'node:path'
import { readFile } from 'node:fs/promises'

import { isNull } from '@util/util.js'

/*
const STATEDATA = sysPath.resolve('util/state-validator/states.json');
console.log(STATEDATA);

class StateValidator {

  constructor() {
    this.jsonPath = null;
    this.stateList = null;
    this.initialized = false;
  }

  async ensureInitialized() { if (!this.initialized) throw new Error('StateValidator not initialized'); }

  // TODO: enforce singleton to prevent re-loading of data
  static async create(jsonPath) {
    const instance = new StateValidator();
    await instance._loadData(jsonPath);
    return instance;
  }

  async _loadData(jsonPath) {
    this.jsonPath = jsonPath
    try {
      const jsonUrl = new URL(this.jsonPath, import.meta.url);
      const data = await readFile(jsonUrl);
      this.stateList = JSON.parse(data);
      if (!Array.isArray(this.stateList)) {
        throw new Error('Invalid state list data format');
      }
      this.initialized = true;
    } catch (e) {
      throw new Error(`Failed to load or parse JSON data: ${e.message}`);
    }
  }

  getAll() {
    this.ensureInitialized();
    return this.stateList;
  }

  find(state) {
    this.ensureInitialized();
    if (isNull(state)) throw new Error('Missing state identifier');
    const stUpr = state.toUpperCase();
    const result = this.stateList.find((st) => {
      const altMatch = st.altAbbr?.some((alt) => alt.toUpperCase() === stUpr);
      return (
        st.name.toUpperCase() === stUpr ||
        st.usps.toUpperCase() === stUpr ||
        st.uscg.toUpperCase() === stUpr ||
        altMatch
      );
    });
    if (isNull(result)) throw new Error(`No record for state ${stUpr}`);
    return result;
  }

  isValid(state) {
    try {
      this.find(state);
      return true;
    } catch {
      return false;
    }
  }

  abbrFromName(stateName) {
    const result = this.find(stateName);
    return result?.abbr;
  }

  nameFromAbbr(stateAbbr) {
    const result = this.find(stateAbbr);
    return result?.name;
  }

  demonym(state) {
    const result = this.find(state);
    return result?.demonym;
  }

  only50() {
    const notStates = ['DC', 'AS', 'GU', 'MP', 'PR', 'VI', 'UM'];
    this.ensureInitialized();
    return this.stateList.filter((item) => !notStates.includes(item.usps));
  }

}

const validator = await StateValidator.create(STATEDATA);
export default validator;
*/