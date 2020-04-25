import { GameState, drawFromEncounterDeck, drawFromPlayerDeck } from "./game-state";

import { EncounterCard } from "./encounter-cards";
import { emit } from "./core/events";
import { thwack } from "./core/zzfx";

export type PlayerCardType = "attack" | "action" | "status" | "permanent";
export type PlayerCardData = {
  name: string;
  cost: number;
  type: PlayerCardType;
  art: string;
  levels: string[];
};

export type PlayerCardAssetJson = {
  type: "player_cards";
  cards: PlayerCardData[];
};

export const PLAYER_CARD_CACHE: Map<string, PlayerCardData> = new Map();

export const loadPlayerCards: (cardsData: PlayerCardAssetJson) => Promise<any> =
  (cardsData: PlayerCardAssetJson) => {
    return new Promise((resolve, reject) => {
      try {
        for (const cardData of cardsData.cards) {
          PLAYER_CARD_CACHE.set(cardData.name, cardData);
        }
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  };

export type PlayerCardEffect = (target: any) => void;
export class PlayerCard {
  public name: string;
  public level: number;
  public cost: number;
  public type: PlayerCardType;
  public art: string;
  public levelsText: string[] = [];
  public effects: PlayerCardEffect[] = [];
  public description: string[];
  public attackValue: number = 0;

  constructor(cardData: PlayerCardData) {
    this.name = cardData.name;
    this.cost = +cardData.cost;
    this.type = cardData.type;
    this.art = cardData.art;
    this.level = 0;

    this.description = ["unplayable"];

    if (cardData.levels) {
      this.parseEffects(cardData.levels[this.level]);
      if (cardData.levels.length > 1) {
        for (let level: number = 1; level <= cardData.levels.length - 1; level++) {
          this.levelsText.push(`LV${level}: ${cardData.levels[level]}`);
        }
      }
    }
  }

  public levelUp(): void {
    this.level++;
    if (this.level > 5) {
      this.level = 5;
    }
    const cardData: PlayerCardData = PLAYER_CARD_CACHE.get(this.name);
    this.cost = +cardData.cost + this.level;
    this.parseEffects(cardData.levels[this.level]);
  }

  private parseEffects(effectsString: string): void {
    const effects: string[] = effectsString.split(", ");
    this.effects = [];
    this.description = [];

    for (const effectString of effects) {
      const [effect, param] = effectString.split(" ");
      this.effects.push(
        (target: any) => {
          this[effect](...param, target);
        });
      if (effect === "attack") {
        this.attackValue = +param;
      }
      if (effect === "oldOne") {
        this.description.push(`call to it...`);
      } else {
        this.description.push(`${effect} ${param}`);
      }
      if (this.type === "permanent") {
        this.description.push(`(per turn)`);
      }
    }
  }

  private attack(value: number, target: EncounterCard): void {
    target.hurt(+value);
    thwack();
  }

  private disrupt(value: number): void {
    GameState.riftStability -= +value;
    if (GameState.riftStability < 0) {
      GameState.riftStability = 0;
    }
  }

  private gain(value: number): void {
    GameState.playerMoney += +value;
  }

  private draw(value: number): void {
    const total: number = +value;
    for (let i: number = 0; i < total; i++) {
      drawFromPlayerDeck();
    }
  }
  private recall(value: number): void {
    if (GameState.encountersActive.length > 0) {
      GameState.encounterDeck.push(GameState.encountersActive.pop());
    }
  }
  private stitch(value: number): void {
    GameState.stitchCounter += +value;
  }
  private oldOne(value: number): void {
    GameState.oldOnesFavourInPlay = true;
    GameState.oldOnesFavourCounter++;
  }
  private discard(value: number): void {
    if (GameState.playerHand.length <= value) {
      while (GameState.playerHand.length > 0) {
        const card: PlayerCard = GameState.playerHand.pop();
        emit("card_discarded", card);
      }
      return;
    }
    GameState.playerMode = "discard";
    GameState.discardsRequired = +value;
  }
  private destroy(value: number): void {
    if (GameState.playerHand.length <= value) {
      while (GameState.playerHand.length > 0) {
        GameState.playerHand.pop();
      }
      return;
    }
    GameState.playerMode = "destroy";
    GameState.destroysRequired = +value;
  }
  private spawn(value: number): void {
    drawFromEncounterDeck();
  }
  private stabilize(value: number): void {
    GameState.riftStability = Math.min(GameState.riftStabilityMax, GameState.riftStability + +value);
  }
}
