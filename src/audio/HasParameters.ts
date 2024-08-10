class HasParameters {
  private parameters: { [key: string]: any };

  constructor() {
    this.parameters = {};
  }

  setParameter(id: string, value: any, options?: any): void {
    // TODO: Implement min, max, and options for select
    this.parameters[id] = {id, value, ...options};
    // console.log(this.parameters[id]);
  }

  getParameter(id: string): any {
    return this.parameters[id];
  }
  getParameterValue(id: string): any {
    return this.getParameter(id)?.value;
  }
}

export default HasParameters;
