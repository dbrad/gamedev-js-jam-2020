import { EncounterCard } from "./encounter-cards";
import { PlayerCard } from "./player-cards";

type GameState = {
  turn: number;

  playerHealth: number;
  playerHealthMax: number;
  riftStability: number;
  riftStabilityMax: number;

  encounterDeck: EncounterCard[];
  activeEncounters: EncounterCard[];

  playerDeck: PlayerCard[];
  playerHand: PlayerCard[];
  discardPile: PlayerCard[];

  storeDeck: PlayerCard[];
  activeStore: PlayerCard[];

  energyResearchLevel: number;
  psychicResearchLevel: number;
  forbiddenResearchLevel: number;

  oldOnesFavourInPlayer: boolean;
  oldOnesFavourCounter: number;
};

export const GameState: GameState = {
  turn: 0,

  playerHealth: 10,
  playerHealthMax: 10,
  riftStability: 0,
  riftStabilityMax: 50,

  encounterDeck: [],
  activeEncounters: [],

  playerDeck: [],
  playerHand: [],
  discardPile: [],

  storeDeck: [],
  activeStore: [],

  energyResearchLevel: 0,
  psychicResearchLevel: 0,
  forbiddenResearchLevel: 0,

  oldOnesFavourInPlayer: false,
  oldOnesFavourCounter: 0
};
