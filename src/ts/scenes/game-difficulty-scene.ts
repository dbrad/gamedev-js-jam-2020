import { PLAYER_CARD_CACHE, PlayerCard } from "../player-cards";

import { Align } from "../core/draw";
import { Builder } from "../core/builder";
import { ButtonNode } from "../scene-nodes/button-node";
import { Easing } from "../core/interpolation";
import { GameSceneName } from "./game-scene";
import { GameState } from "../game-state";
import { Scene } from "../core/scene";
import { SceneManager } from "../core/scene-manager";
import { TextNode } from "../scene-nodes/text-node";

export const GameDifficultySceneName: string = "GameDifficulty";
export class GameDifficultyScene extends Scene {
  constructor() {
    super();
    this.id = GameDifficultySceneName;
    const title: TextNode =
      new Builder(TextNode)
        .with("text", "select a difficulty")
        .with("scale", 3)
        .with("textAlign", Align.Center)
        .build();
    title.moveTo({ x: this.root.size.x / 2, y: 20 });
    this.root.add(title);

    const goButton: ButtonNode =
      new Builder(ButtonNode)
        .with("text", "GO!")
        .with("size", { x: 80, y: 25 })
        .with("anchor", { x: 0.5, y: 0.5 })
        .with("colour", 0xFF44AA44)
        .with("onMouseUp", () => {
          GameState.playerDeck = [
            new PlayerCard(PLAYER_CARD_CACHE.get("pistol")),
            new PlayerCard(PLAYER_CARD_CACHE.get("pistol")),
            new PlayerCard(PLAYER_CARD_CACHE.get("pistol")),
            new PlayerCard(PLAYER_CARD_CACHE.get("pistol")),
            new PlayerCard(PLAYER_CARD_CACHE.get("pistol")),
            new PlayerCard(PLAYER_CARD_CACHE.get("pistol")),
            new PlayerCard(PLAYER_CARD_CACHE.get("pistol")),
            new PlayerCard(PLAYER_CARD_CACHE.get("pistol")),
            new PlayerCard(PLAYER_CARD_CACHE.get("pistol")),
            new PlayerCard(PLAYER_CARD_CACHE.get("pistol")),
          ];
          SceneManager.pop();
          SceneManager.push(GameSceneName);
        })
        .build();
    goButton.moveTo({ x: this.root.size.x / 2, y: this.root.size.y / 2 });
    this.root.add(goButton);
  }

  public transitionIn(): Promise<any> {
    return this.root.moveTo({ x: 0, y: this.root.size.y }).then(() => {
      return this.root.moveTo({ x: 0, y: 0 }, 500, Easing.easeOutQuad).then(() => {
        return super.transitionIn();
      });
    });
  }

  public transitionOut(): Promise<any> {
    super.transitionOut();
    return this.root.moveTo({ x: -this.root.size.x, y: 0 }, 500, Easing.easeOutQuad);
  }
}
