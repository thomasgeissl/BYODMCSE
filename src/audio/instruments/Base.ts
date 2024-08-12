import { el, ElemNode } from "@elemaudio/core";
import { v4 as uuidv4 } from "uuid";

abstract class Base {
  id: string;

  constructor(id: string) {
    this.id = id;
  }

  abstract noteOn(note: number, velocity: number): void;
  abstract noteOff(note: number, velocity: number): void;
  abstract render(): ElemNode;
}
export default Base;
