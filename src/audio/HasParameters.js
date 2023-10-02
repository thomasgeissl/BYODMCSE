class HasParameters {
  constructor() {
    this.parameters = {};
  }
  setParameter(id, value) {
    this.parameters[id] = value;
    // console.log(this.parameters[id]);
  }
  getParameter(id) {
    return this.parameters[id];
  }
}

export default HasParameters;
