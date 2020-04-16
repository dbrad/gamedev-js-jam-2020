import { State } from "./state";

export interface StateMachine<T extends State> {
  register(state: T): void;
  push(stateId: string): void;
  pop(): void;
  clear(): void;
}
