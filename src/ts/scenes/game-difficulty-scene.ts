import { ENCOUNTER_CARD_CACHE, EncounterCard } from "../encounter-cards";
import { GameState, resetGameState } from "../game-state";
import { PLAYER_CARD_CACHE, PlayerCard } from "../player-cards";

import { Align } from "../core/draw";
import { Builder } from "../core/builder";
import { ButtonNode } from "../scene-nodes/button-node";
import { Easing } from "../core/interpolation";
import { GameSceneName } from "./game-scene";
import { Scene } from "../core/scene";
import { SceneManager } from "../core/scene-manager";
import { TextNode } from "../scene-nodes/text-node";
import { rand } from "../core/random";

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
          resetGameState();

          GameState.playerDeck = rand.shuffle([
            new PlayerCard(PLAYER_CARD_CACHE.get("open fire")),
            new PlayerCard(PLAYER_CARD_CACHE.get("open fire")),
            new PlayerCard(PLAYER_CARD_CACHE.get("open fire")),
            new PlayerCard(PLAYER_CARD_CACHE.get("open fire")),
            new PlayerCard(PLAYER_CARD_CACHE.get("open fire")),
            new PlayerCard(PLAYER_CARD_CACHE.get("funds")),
            new PlayerCard(PLAYER_CARD_CACHE.get("funds")),
            new PlayerCard(PLAYER_CARD_CACHE.get("funds")),
            new PlayerCard(PLAYER_CARD_CACHE.get("funds")),
            new PlayerCard(PLAYER_CARD_CACHE.get("funds")),
            new PlayerCard(PLAYER_CARD_CACHE.get("electrical interference")),
            new PlayerCard(PLAYER_CARD_CACHE.get("electrical interference")),
          ]);

          const enemies: EncounterCard[] =[];
          for(const [name, card] of ENCOUNTER_CARD_CACHE) {
            enemies.push(new EncounterCard(card));
          }
          GameState.encounterDeck = rand.shuffle(enemies);
          
          GameState.storeDeck = rand.shuffle([
            // Tier 0
            new PlayerCard(PLAYER_CARD_CACHE.get("barrage")),
            new PlayerCard(PLAYER_CARD_CACHE.get("barrage")),

            new PlayerCard(PLAYER_CARD_CACHE.get("emp burst")),
            new PlayerCard(PLAYER_CARD_CACHE.get("emp burst")),

            new PlayerCard(PLAYER_CARD_CACHE.get("taxation")),
            new PlayerCard(PLAYER_CARD_CACHE.get("taxation")),

            new PlayerCard(PLAYER_CARD_CACHE.get("supressive fire")),
            new PlayerCard(PLAYER_CARD_CACHE.get("supressive fire")),

            new PlayerCard(PLAYER_CARD_CACHE.get("bounty")),
            new PlayerCard(PLAYER_CARD_CACHE.get("bounty")),

            // Tier 1
            new PlayerCard(PLAYER_CARD_CACHE.get("reevaluate")),
            new PlayerCard(PLAYER_CARD_CACHE.get("reevaluate")),

            new PlayerCard(PLAYER_CARD_CACHE.get("recruitment")),
            new PlayerCard(PLAYER_CARD_CACHE.get("recruitment")),

            new PlayerCard(PLAYER_CARD_CACHE.get("psychic offensive")),
            new PlayerCard(PLAYER_CARD_CACHE.get("psychic offensive")),
            new PlayerCard(PLAYER_CARD_CACHE.get("psychic offensive")),

            new PlayerCard(PLAYER_CARD_CACHE.get("psychic interference")),
            new PlayerCard(PLAYER_CARD_CACHE.get("psychic interference")),
            new PlayerCard(PLAYER_CARD_CACHE.get("psychic interference")),

            new PlayerCard(PLAYER_CARD_CACHE.get("old one's wrath")),
            new PlayerCard(PLAYER_CARD_CACHE.get("old one's wrath")),
            new PlayerCard(PLAYER_CARD_CACHE.get("old one's wrath")),

            new PlayerCard(PLAYER_CARD_CACHE.get("dark pact")),
            new PlayerCard(PLAYER_CARD_CACHE.get("dark pact")),
            new PlayerCard(PLAYER_CARD_CACHE.get("dark pact")),

            new PlayerCard(PLAYER_CARD_CACHE.get("experimental rifle")),
            new PlayerCard(PLAYER_CARD_CACHE.get("experimental rifle")),
            new PlayerCard(PLAYER_CARD_CACHE.get("experimental rifle")),

            new PlayerCard(PLAYER_CARD_CACHE.get("collect samples")),
            new PlayerCard(PLAYER_CARD_CACHE.get("collect samples")),
            new PlayerCard(PLAYER_CARD_CACHE.get("collect samples")),

          ]);
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
