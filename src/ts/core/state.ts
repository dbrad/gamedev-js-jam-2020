export interface State {
  id: any;
  transitionIn(): Promise<any>;
  transitionOut(): Promise<any>;
}
