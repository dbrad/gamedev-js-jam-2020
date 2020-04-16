import { Scene } from "./scene";
import { StateMachine } from "./state-machine";
import { V2 } from "./v2";
import { emit } from "./events";
import { pointer } from "./pointer";

class SceneStateMachine implements StateMachine<Scene> {
  private stack: Scene[] = [];
  private scenes: Map<string, Scene> = new Map();

  public register(scene: Scene): void {
    this.scenes.set(scene.id, scene);
  }

  public get current(): Scene {
    return this.stack[this.stack.length - 1];
  }

  public push(sceneName: string): void {
    const newScene: Scene = this.scenes.get(sceneName);

    if (this.current) {
      this.current.transitionOut()
        .then(() => {
          this.stack.push(newScene);
          this.current.transitionIn().then(() => {
            emit("mouse_move", V2.copy(pointer), false);
          });
        });
    } else {
      this.stack.push(newScene);
      this.stack[this.stack.length - 1].transitionIn().then(() => {
        emit("mouse_move", V2.copy(pointer), false);
      });
    }
  }

  public pop(): void {
    this.stack[this.stack.length - 1].transitionOut()
      .then(() => {
        this.stack.pop();
        if (this.stack.length > 0) {
          this.stack[this.stack.length - 1].transitionIn().then(() => {
            emit("mouse_move", V2.copy(pointer), false);
          });
        }
      });
  }

  public clear(): void {
    while (this.current) {
      this.stack.pop();
    }
    this.stack.length = 0;
  }

  public update(now: number, delta: number): void {
    this.stack[this.stack.length - 1].update(now, delta);
  }

  public draw(now: number, delta: number): void {
    this.stack[this.stack.length - 1].draw(now, delta);
  }
}

export const SceneManager: SceneStateMachine = new SceneStateMachine();
