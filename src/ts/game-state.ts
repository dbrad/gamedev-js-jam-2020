import { EncounterCard } from "./encounter-cards";
import { PlayerCard } from "./player-cards";
import { cardFwip } from "./core/zzfx";
import { emit } from "./core/events";
import { rand } from "./core/random";

type GameState = {
  turn: number;

  riftStability: number;
  riftStabilityMax: number;

  encounterDeck: EncounterCard[];
  encountersActive: EncounterCard[];
  encounterPlayingIndex: number,
  encounterPlaying: EncounterCard,
  encounterTarget: EncounterCard;

  discardsRequired: number;
  destroysRequired: number;

  playerMode: "play" | "discard" | "destroy";
  playerDeck: PlayerCard[];
  playerHand: PlayerCard[];
  playerDiscardPile: PlayerCard[];
  playerPermanents: PlayerCard[];
  playerPermanentPlayingIndex: number;
  playerPermanentPlaying: PlayerCard;
  playerMoney: number;
  playerSelectedCard: PlayerCard;

  discardPileMode: "player" | "store";

  decksPicked: ("occult" | "psy" | "tech")[];
  storeDeck: PlayerCard[];
  storeActive: PlayerCard[];
  storeDiscard: PlayerCard[];

  oldOnesFavourInPlay: boolean;
  oldOnesFavourCounter: number;

  stitchCounter: number;

  gameOverReason: "none" | "overrun" | "oldOne" | "clear" | "stitch";
};

export const GameState: GameState = {
  turn: 0,

  riftStability: 0,
  riftStabilityMax: 50,

  encounterDeck: [],
  encountersActive: [],
  encounterPlayingIndex: 0,
  encounterPlaying: null,
  encounterTarget: null,

  discardsRequired: 0,
  destroysRequired: 0,

  playerMode: "play",
  playerDeck: [],
  playerHand: [],
  playerDiscardPile: [],
  playerPermanents: [],
  playerPermanentPlayingIndex: 0,
  playerPermanentPlaying: null,
  playerMoney: 0,
  playerSelectedCard: null,

  discardPileMode: "player",

  decksPicked: [],
  storeDeck: [],
  storeActive: [],
  storeDiscard: [],

  oldOnesFavourInPlay: false,
  oldOnesFavourCounter: 0,

  stitchCounter: 0,

  gameOverReason: "none"
};

export function resetGameState(): void {
  GameState.turn = 0;

  GameState.riftStability = 0;
  GameState.riftStabilityMax = 50;

  GameState.encounterDeck = [];
  GameState.encountersActive = [];
  GameState.encounterPlayingIndex = 0;
  GameState.encounterPlaying = null;
  GameState.encounterTarget = null;

  GameState.discardsRequired = 0;
  GameState.destroysRequired = 0;

  GameState.playerMode = "play";
  GameState.playerDeck = [];
  GameState.playerHand = [];
  GameState.playerDiscardPile = [];
  GameState.playerPermanents = [];
  GameState.playerPermanentPlayingIndex = 0;
  GameState.playerPermanentPlaying = null;
  GameState.playerMoney = 0;
  GameState.playerSelectedCard = null;

  GameState.discardPileMode = "player";

  GameState.decksPicked = [];
  GameState.storeDeck = [];
  GameState.storeActive = [];
  GameState.storeDiscard = [];

  GameState.oldOnesFavourInPlay = false;
  GameState.oldOnesFavourCounter = 0;

  GameState.stitchCounter = 0;
  GameState.gameOverReason = "none";
}

export function drawFromPlayerDeck(): void {
  if (GameState.playerDeck.length === 0) {
    GameState.playerDeck.push(...rand.shuffle(GameState.playerDiscardPile));
    GameState.playerDiscardPile.length = 0;
  }
  const cardData: PlayerCard = GameState.playerDeck.pop();
  if (GameState.playerHand.length < 10) {
    GameState.playerHand.push(cardData);
    cardFwip();
  } else {
    emit("card_discarded", cardData);
  }
}

export function drawFromEncounterDeck(): void {
  if (GameState.encounterDeck.length > 0) {
    const cardData: EncounterCard = GameState.encounterDeck.pop();
    GameState.encountersActive.push(cardData);
    cardFwip();
  }
}
