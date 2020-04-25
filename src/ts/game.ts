import { Align, drawText, drawTexture } from "./core/draw.js";
import { MainMenuScene, MainMenuSceneName } from "./scenes/main-menu-scene.js";
import { initPointer, inputFocus, mouseDown, pointer } from "./core/pointer.js";
import { initStats, tickStats } from "./stats.js";

import { DeckSelectScene } from "./scenes/deck-select-scene.js";
import { DiscardPileScene } from "./scenes/discard-pile-scene.js";
import { GameDifficultyScene } from "./scenes/game-difficulty-scene.js";
import { GameOverScene } from "./scenes/game-over-scene.js";
import { GameScene } from "./scenes/game-scene.js";
import { HelpScene } from "./scenes/help-scene.js";
import { SceneManager } from "./core/scene-manager.js";
import { V2 } from "./core/v2.js";
import { emit } from "./core/events.js";
import { gl } from "./core/gl.js";
import { loadAsset } from "./core/assets.js";

export const SCREEN_WIDTH: number = 512;
export const SCREEN_HEIGHT: number = 288;
export let screenScale: number = 1;

let blinkTimer: number = 0;
window.addEventListener("load", async (): Promise<any> => {
  document.title = `Beyond The Rift`;
  let then: number = 0;
  function tick(now: number): void {
    const delta: number = now - then;
    then = now;
    gl.clear();

    // @ifdef DEBUG
    tickStats(delta, now);
    // @endif

    if (inputFocus) {
      SceneManager.update(now, delta);
    }
    SceneManager.draw(now, delta);

    if (!inputFocus) {
      gl.colour(0xCC000000);
      drawTexture("solid", 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT + 1);
      blinkTimer += delta;
      if (blinkTimer > 0) {
        drawText("click to focus", SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 6, { textAlign: Align.Center, colour: 0XCC000000, scale: 3 });
        drawText("click to focus", SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 8, { textAlign: Align.Center, colour: 0XFFEEEEEE, scale: 3 });
        if (blinkTimer > 750) {
          blinkTimer = -750;
        }
      }
    } else {
      gl.colour(0xFFFFFFFF);
      drawTexture("pointer", pointer.x, pointer.y, 1, 1);
      emit("mouse_move", V2.copy(pointer), mouseDown);
    }

    gl.flush();
    gl.colour(0xFFFFFFFF);
    requestAnimationFrame(tick);
  }

  const stage: HTMLDivElement = document.querySelector("#stage");
  const canvas: HTMLCanvasElement = document.querySelector("canvas");
  canvas.width = SCREEN_WIDTH;
  canvas.height = SCREEN_HEIGHT;

  window.addEventListener(
    "resize",
    (): void => {
      const scaleX: number = window.innerWidth / canvas.clientWidth;
      const scaleY: number = window.innerHeight / canvas.clientHeight;
      const tempScale: number = ~~Math.min(scaleX, scaleY);
      screenScale = tempScale < 1 ? 1 : tempScale;
      const size: number[] = [canvas.clientWidth * screenScale, canvas.clientHeight * screenScale];
      const offset: number[] = [(window.innerWidth - size[0]) / 2, (window.innerHeight - size[1]) / 2];
      const rule: string = "translate(" + ~~offset[0] + "px, " + ~~offset[1] + "px) scale(" + screenScale + ") translateZ(0)";
      stage.style.transform = rule;
      stage.style.webkitTransform = rule;
    }
  );

  // @ifdef DEBUG
  initStats();
  // @endif

  gl.initialize(canvas);
  gl.setBackground(0, 25, 55);
  await loadAsset("sheet.json");
  await loadAsset("player-cards.json");
  await loadAsset("encounter-cards.json");
  initPointer(canvas);
  SceneManager.register(new MainMenuScene());
  SceneManager.register(new GameDifficultyScene());
  SceneManager.register(new DeckSelectScene());
  SceneManager.register(new GameScene());
  SceneManager.register(new HelpScene());
  SceneManager.register(new DiscardPileScene());
  SceneManager.register(new GameOverScene());
  SceneManager.push(MainMenuSceneName);

  requestAnimationFrame(tick);
  window.dispatchEvent(new Event("resize"));
});
