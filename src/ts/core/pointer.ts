import { SCREEN_HEIGHT, SCREEN_WIDTH, screenScale } from "../game";

import { V2 } from "./v2";
import { emit } from "./events";

export let mouseDown: boolean = false;
export const pointer: V2 = { x: 0, y: 0 };
export let inputFocus: boolean = false;
export let mouseSensitivity: number = 1.0;

export interface Interactive {
  hover: boolean;
  pressed: boolean;
  onHover(mouseDown: boolean): void;
  onBlur(): void;
  onMouseDown(): void;
  onMouseUp(): void;
}
type mouseListener = (this: HTMLCanvasElement, ev: MouseEvent) => any;

export function initPointer(canvas: HTMLCanvasElement): void {
  const mouseClickHandler: mouseListener = (event: MouseEvent): void => {
    if (document.pointerLockElement === null) {
      canvas.requestPointerLock();
      const canvasRect: DOMRect = canvas.getBoundingClientRect();
      pointer.x = ~~((event.clientX - canvasRect.left) / screenScale);
      pointer.y = ~~((event.clientY - canvasRect.top) / screenScale);
    }
  };

  const mouseDownHandler: mouseListener = (event: MouseEvent): void => {
    mouseDown = true;
    emit("mouse_down", V2.copy(pointer));
  };

  const mouseUpHandler: mouseListener = (event: MouseEvent): void => {
    mouseDown = false;
    emit("mouse_up", V2.copy(pointer));
  };

  canvas.addEventListener("click", mouseClickHandler, false);

  const POLL_RATE: number = 1000 / 60;
  let now: number;
  let then: number = 0;
  let timer: number = 0;
  const updatePosition: mouseListener = (e: MouseEvent): void => {
    now = performance.now();
    const delta: number = now - then;
    timer += delta;
    then = now;
    pointer.x += ~~(e.movementX * mouseSensitivity);
    pointer.y += ~~(e.movementY * mouseSensitivity);
    if (pointer.x >= SCREEN_WIDTH) {
      pointer.x = SCREEN_WIDTH - 1;
    }
    if (pointer.y >= SCREEN_HEIGHT) {
      pointer.y = SCREEN_HEIGHT - 1;
    }
    if (pointer.x < 0) {
      pointer.x = 0;
    }
    if (pointer.y < 0) {
      pointer.y = 0;
    }
    if (timer >= POLL_RATE) {
      timer = 0;
      // emit("mouse_move", V2.copy(pointer), mouseDown);
    }
  };

  document.addEventListener("pointerlockchange", () => {
    if (document.pointerLockElement === canvas) {
      canvas.addEventListener("mousedown", mouseDownHandler, false);
      canvas.addEventListener("mouseup", mouseUpHandler, false);
      canvas.removeEventListener("click", mouseClickHandler, false);
      document.addEventListener("mousemove", updatePosition, false);
      inputFocus = true;
    } else {
      canvas.removeEventListener("mousedown", mouseDownHandler, false);
      canvas.removeEventListener("mouseup", mouseUpHandler, false);
      canvas.addEventListener("click", mouseClickHandler, false);
      document.removeEventListener("mousemove", updatePosition, false);
      inputFocus = false;
    }
  }, false);
}
