export type PlayerCardType = "action" | "status" | "permanent";
export type PlayerCardData = {
  name: string;
  cost: number;
  value: number;
  type: PlayerCardType;
  art: string;
  effects: string;
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
  public value: number;
  public type: PlayerCardType;
  public art: string;
  public effects: PlayerCardEffect[];
  public description: string[];

  constructor(cardData: PlayerCardData) {
    this.name = cardData.name;
    this.cost = cardData.cost;
    this.value = cardData.value;
    this.type = cardData.type;
    this.art = cardData.art;
    this.parseEffects(cardData.effects);
  }

  private parseEffects(effectsString: string): void {
    const effects: string[] = effectsString.split(",");
    this.effects = [];
    this.description = [];
    for (const effectString of effects) {
      const [effect, param] = effectString.split(" ");
      this.effects.push(
        (target: any) => {
          this[effect](...param, target);
        });
        this.description.push(`${effect} for ${param}`);
    }
  }

  private attack(value: number, target: any): void {

  }
}
