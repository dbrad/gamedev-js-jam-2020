export type EncounterCardType = "enemy" | "boss" | "event";
export type EncounterSetType = "all" | "yellow_king";
export type EncounterCardData = {
  name: string;
  health: number;
  damage: number;
  set: EncounterSetType;
  type: EncounterCardType;
  art: string;
  conditions: string;
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

export type EncounterCardEffect = (target: any) => void;
export class EncounterCard {
  public name: string;
  public health: number;
  public damage: number;
  public set: EncounterSetType;
  public type: EncounterCardType;
  public art: string;
  public conditions: EncounterCardEffect[];
  public description: string[];

  constructor(cardData: EncounterCardData) {
    this.name = cardData.name;
    this.health = cardData.health;
    this.damage = cardData.damage;
    this.set = cardData.set;
    this.type = cardData.type;
    this.art = cardData.art;
    this.parseConditions(cardData.conditions);
  }

  private parseConditions(conditionsString: string): void {
    const conditions: string[] = conditionsString.split(",");
    this.conditions = [];
    this.description = [];
    for (const conditionString of conditions) {
      const [condition, param] = conditionString.split(" ");
      this.conditions.push(
        (target: any) => {
          this[condition](...param, target);
        });
      this.description.push(`${condition} for ${param}`);
    }
  }
}
