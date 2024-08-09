class HasParameters {
  constructor() {
    this.parameters = {};
  }
  setParameter(id, value, options) {
    // TODO: min, max, and options for select 
    this.parameters[id] = value;
    // console.log(this.parameters[id]);
  }
  getParameter(id) {
    return this.parameters[id];
  }
}

export default HasParameters;
