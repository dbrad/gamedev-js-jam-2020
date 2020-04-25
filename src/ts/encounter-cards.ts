import { GameState, drawFromEncounterDeck } from "./game-state";
import { PLAYER_CARD_CACHE, PlayerCard, PlayerCardData } from "./player-cards";

import { emit } from "./core/events";

export type EncounterSetType = "all" | "yellow_king";
export type EncounterCardData = {
  name: string;
  art: string;
  set: EncounterSetType;
  health: number;
  armor: number;
  effects: string;
};

export type EncounterCardAssetJson = {
  type: "encounter_cards";
  cards: EncounterCardData[];
};

export const ENCOUNTER_CARD_CACHE: Map<string, EncounterCardData> = new Map();

export const loadEncounterCards: (cardsData: EncounterCardAssetJson) => Promise<any> =
  (cardsData: EncounterCardAssetJson) => {
    return new Promise((resolve, reject) => {
      try {
        for (const cardData of cardsData.cards) {
          ENCOUNTER_CARD_CACHE.set(cardData.name, cardData);
        }
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  };

export type EncounterCardEffect = () => void;
export class EncounterCard {
  public name: string;
  public maxHealth: number;
  public health: number;
  public set: EncounterSetType;
  public art: string;
  public armor: number;
  public effects: EncounterCardEffect[] = [];
  public description: string[] = [];

  constructor(cardData: EncounterCardData) {
    this.name = cardData.name;
    this.art = cardData.art;
    this.set = cardData.set;
    this.maxHealth = cardData.health;
    this.health = cardData.health;
    this.armor = cardData.armor;

    if (cardData.effects) {
      this.parseEffects(cardData.effects);
    }
  }

  public hurt(value: number): void {
    this.health = Math.max(this.health - Math.max(+value - this.armor, 0), 0);
  }

  private parseEffects(effectsString: string): void {
    const effects: string[] = effectsString.split(", ");
    this.effects = [];
    this.description = [];
    for (const effectString of effects) {
      const [effect, ...param] = effectString.split(" ");
      this.effects.push(
        () => {
          this[effect](...param);
        });
      if (effect === "summon") {
        this.description.push(`${effect} ${param[0]} ${param[1].replace("_", " ")}`);
      } else {
        this.description.push(`${effect} ${param[0]}`);

      }
    }
  }

  private discard(value: number): void {
    GameState.playerMode = "discard";
    GameState.discardsRequired += +value;
  }

  private regenerate(value: number): void {
    this.health = Math.min(this.maxHealth, this.health + +value);
  }

  private spawn(value: number): void {
    drawFromEncounterDeck();
  }

  private summon(value: number, name: string): void {
    name = name.replace("_", " ");
    const cardData: EncounterCardData = ENCOUNTER_CARD_CACHE.get(name);
    for (let i: number = 0; i < value; i++) {
      const card: EncounterCard = new EncounterCard(cardData);
      GameState.encountersActive.push(card);
    }
  }

  private stabilize(value: number): void {
    GameState.riftStability = Math.min(GameState.riftStabilityMax, GameState.riftStability + +value);
  }

  private wound(value: number): void {
    const cardData: PlayerCardData = PLAYER_CARD_CACHE.get("wounded");
    const card: PlayerCard = new PlayerCard(cardData);
    emit("card_discarded", card);
  }

}
