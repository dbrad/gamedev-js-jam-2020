import { EncounterCard } from "./encounter-cards";
import { PlayerCard } from "./player-cards";
import { emit } from "./core/events";
import { rand } from "./core/random";

type GameState = {
  turn: number;

  riftStability: number;
  riftStabilityMax: number;

  encounterDeck: EncounterCard[];
  encountersActive: EncounterCard[];
  encounterTarget: EncounterCard;

  discardsRequired: number;
  destroysRequired: number;

  playerMode: "play" | "discard" | "destroy";
  playerDeck: PlayerCard[];
  playerHand: PlayerCard[];
  playerDiscardPile: PlayerCard[];
  playerPermanents: PlayerCard[];
  playerMoney: number;

  storeDeck: PlayerCard[];
  storeActive: PlayerCard[];
  storeDiscard: PlayerCard[];

  oldOnesFavourInPlay: boolean;
  oldOnesFavourCounter: number;

  stitchCounter: number;
};

export const GameState: GameState = {
  turn: 0,

  riftStability: 0,
  riftStabilityMax: 50,

  encounterDeck: [],
  encountersActive: [],
  encounterTarget: null,

  discardsRequired: 0,
  destroysRequired: 0,

  playerMode: "play",
  playerDeck: [],
  playerHand: [],
  playerDiscardPile: [],
  playerPermanents: [],
  playerMoney: 0,

  storeDeck: [],
  storeActive: [],
  storeDiscard: [],

  oldOnesFavourInPlay: false,
  oldOnesFavourCounter: 0,

  stitchCounter: 0
};

export function resetGameState(): void {
  GameState.turn = 0;

  GameState.riftStability = 0;
  GameState.riftStabilityMax = 50;

  GameState.encounterDeck = [];
  GameState.encountersActive = [];
  GameState.encounterTarget = null;

  GameState.discardsRequired = 0;
  GameState.destroysRequired = 0;

  GameState.playerMode = "play";
  GameState.playerDeck = [];
  GameState.playerHand = [];
  GameState.playerDiscardPile = [];
  GameState.playerPermanents = [];
  GameState.playerMoney = 0;

  GameState.storeDeck = [];
  GameState.storeActive = [];
  GameState.storeDiscard = [];

  GameState.oldOnesFavourInPlay = false;
  GameState.oldOnesFavourCounter = 0;

  GameState.stitchCounter = 0;
}

export function drawFromPlayerDeck(): void {
  if (GameState.playerDeck.length === 0) {
    GameState.playerDeck.push(...rand.shuffle(GameState.playerDiscardPile));
    GameState.playerDiscardPile.length = 0;
  }
  const cardData: PlayerCard = GameState.playerDeck.pop();
  if (GameState.playerHand.length < 10) {
    GameState.playerHand.push(cardData);
  } else {
    emit("card_discarded", cardData);
  }
}

export function drawFromEncounterDeck(): void {
  if (GameState.encounterDeck.length > 0) {
    const cardData: EncounterCard = GameState.encounterDeck.pop();
    GameState.encountersActive.push(cardData);
  }
}
