import { Align, drawText, drawTexture } from "../core/draw";
import { ENCOUNTER_CARD_CACHE, EncounterCard, EncounterCardData } from "../encounter-cards";
import { GameState, resetGameState } from "../game-state";
import { PLAYER_CARD_CACHE, PlayerCard } from "../player-cards";

import { Builder } from "../core/builder";
import { ButtonNode } from "../scene-nodes/button-node";
import { DeckSelectSceneName } from "./deck-select-scene";
import { Easing } from "../core/interpolation";
import { Scene } from "../core/scene";
import { SceneManager } from "../core/scene-manager";
import { TextNode } from "../scene-nodes/text-node";
import { V2 } from "../core/v2";
import { buttonMouseUp } from "../core/zzfx";
import { gl } from "../core/gl";
import { rand } from "../core/random";

export const GameDifficultySceneName: string = "GameDifficulty";
export class GameDifficultyScene extends Scene
{
  constructor()
  {
    super();
    this.id = GameDifficultySceneName;
    const title: TextNode =
      new Builder(TextNode)
        .with("text", "select a difficulty")
        .with("scale", 3)
        .with("textAlign", Align.Center)
        .build();
    title.moveTo({ x: this.root.size.x / 2, y: 40 });
    this.root.add(title);

    const easyButton: ButtonNode =
      new Builder(ButtonNode)
        .with("text", "Easy")
        .with("size", { x: 120, y: 25 })
        .with("colour", 0xFF44AA44)
        .with("onMouseUp", () =>
        {
          buttonMouseUp();
          this.setupGame();
          GameState.riftStabilityMax = 75;
          SceneManager.push(DeckSelectSceneName);
        })
        .build();
    easyButton.moveTo({ x: this.root.size.x / 2 - 190, y: this.root.size.y / 2 + 20 });
    this.root.add(easyButton);

    const normalButton: ButtonNode =
      new Builder(ButtonNode)
        .with("text", "Normal")
        .with("size", { x: 120, y: 25 })
        .with("colour", 0xFF44AA44)
        .with("onMouseUp", () =>
        {
          buttonMouseUp();
          this.setupGame();
          GameState.riftStabilityMax = 50;
          SceneManager.push(DeckSelectSceneName);
        })
        .build();
    normalButton.moveTo({ x: this.root.size.x / 2 - 60, y: this.root.size.y / 2 + 20 });
    this.root.add(normalButton);

    const hardButton: ButtonNode =
      new Builder(ButtonNode)
        .with("text", "Hard")
        .with("size", { x: 120, y: 25 })
        .with("colour", 0xFF44AA44)
        .with("onMouseUp", () =>
        {
          buttonMouseUp();
          this.setupGame();
          GameState.riftStabilityMax = 30;
          SceneManager.push(DeckSelectSceneName);
        })
        .build();
    hardButton.moveTo({ x: this.root.size.x / 2 + 70, y: this.root.size.y / 2 + 20 });
    this.root.add(hardButton);
  }

  private setupGame(): void
  {
    resetGameState();

    GameState.playerDeck = rand.shuffle([
      new PlayerCard(PLAYER_CARD_CACHE.get("wounded")),
      new PlayerCard(PLAYER_CARD_CACHE.get("dazed")),
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

    this.createEncounterDeck();
  }

  private createEncounterDeck(): void
  {
    const bossData: EncounterCardData = ENCOUNTER_CARD_CACHE.get("the king in yellow");
    const boss: EncounterCard = new EncounterCard(bossData);
    const enemies: EncounterCard[] = [boss];

    function populateEnemies(wave: Map<string, number>): void
    {
      const temp: EncounterCard[] = [];
      for (const [name, count] of wave)
      {
        const cardData: EncounterCardData = ENCOUNTER_CARD_CACHE.get(name);
        for (let i: number = 0; i < count; i++)
        {
          temp.push(new EncounterCard(cardData));
        }
      }
      enemies.push(...rand.shuffle(temp));
    }

    const finalWaves: Map<string, number> = new Map([
      ["timelost creature", 1],
      ["shapeless threat", 1],
      ["sentient rock", 1],
      ["cultist", 1],
      ["unspeakable horror", 1],
      ["dimensional vagabonds", 2],
      ["faceless one", 2],
      ["creeping feeler", 3],
    ]);

    populateEnemies(finalWaves);

    const middleWaves: Map<string, number> = new Map([
      ["timelost creature", 1],
      ["shapeless threat", 1],
      ["sentient rock", 1],
      ["cultist", 2],
      ["unspeakable horror", 2],
      ["dimensional vagabonds", 1],
      ["faceless one", 2],
      ["creeping feeler", 1]
    ]);

    populateEnemies(middleWaves);

    const startingWave: Map<string, number> = new Map([
      ["timelost creature", 3],
      ["shapeless threat", 3],
      ["sentient rock", 3],
      ["cultist", 2],
      ["unspeakable horror", 2],
      ["thrashing tenticle", 2],
      ["faceless one", 1],
    ]);
    populateEnemies(startingWave);

    GameState.encounterDeck = enemies;
  }

  public transitionIn(): Promise<any>
  {
    return this.root.moveTo({ x: 0, y: this.root.size.y }).then(() =>
    {
      return this.root.moveTo({ x: 0, y: 0 }, 500, Easing.easeOutQuad).then(() =>
      {
        return super.transitionIn();
      });
    });
  }

  public transitionOut(): Promise<any>
  {
    super.transitionOut();
    return this.root.moveTo({ x: 0, y: -this.root.size.y }, 500, Easing.easeOutQuad);
  }

  public draw(now: number, delta: number): void
  {
    const easyTextPos: V2 = { x: this.root.topLeft.x + this.root.size.x / 2 - 130, y: this.root.topLeft.y + this.root.size.y / 2 - 30 };
    gl.colour(0x66000000);
    drawTexture("solid", easyTextPos.x - 62, easyTextPos.y - 4, 124, 81);
    drawText("the rift takes longer to stabilize (about 25 turns)", easyTextPos.x, easyTextPos.y, { wrap: 120, textAlign: Align.Center });
    drawText("you can select 2 card sets to use", easyTextPos.x, easyTextPos.y + 26, { wrap: 120, textAlign: Align.Center });

    const normalTextPos: V2 = { x: this.root.topLeft.x + this.root.size.x / 2, y: this.root.topLeft.y + this.root.size.y / 2 - 30 };
    gl.colour(0x66000000);
    drawTexture("solid", normalTextPos.x - 62, normalTextPos.y - 4, 124, 81);
    drawText("the rift stabilizes at a standard rate (about 20 turns)", normalTextPos.x, normalTextPos.y, { wrap: 120, textAlign: Align.Center });
    drawText("you can select 2 card sets to use", normalTextPos.x, normalTextPos.y + 26, { wrap: 120, textAlign: Align.Center });

    const hardTextPos: V2 = { x: this.root.topLeft.x + this.root.size.x / 2 + 130, y: this.root.topLeft.y + this.root.size.y / 2 - 30 };
    gl.colour(0x66000000);
    drawTexture("solid", hardTextPos.x - 62, hardTextPos.y - 4, 124, 81);
    drawText("the rift stabilizes much sooner", hardTextPos.x, hardTextPos.y, { wrap: 120, textAlign: Align.Center });
    drawText("(about 15 turn)", hardTextPos.x, hardTextPos.y + 14, { wrap: 120, textAlign: Align.Center });
    drawText("you can select 1 card set to use", hardTextPos.x, hardTextPos.y + 26, { wrap: 120, textAlign: Align.Center });
    super.draw(now, delta);
  }
}
