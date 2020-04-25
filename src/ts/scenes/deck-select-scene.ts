import { Align, drawText } from "../core/draw";
import { PLAYER_CARD_CACHE, PlayerCard } from "../player-cards";

import { Builder } from "../core/builder";
import { ButtonNode } from "../scene-nodes/button-node";
import { DeckSelectorNode } from "../scene-nodes/deck-selector-node";
import { Easing } from "../core/interpolation";
import { GameSceneName } from "./game-scene";
import { GameState } from "../game-state";
import { Scene } from "../core/scene";
import { SceneManager } from "../core/scene-manager";
import { rand } from "../core/random";

export const DeckSelectSceneName: string = "DeckSelect";
export class DeckSelectScene extends Scene {
  private deckLimit: number;
  private occultDeck: DeckSelectorNode;
  private techDeck: DeckSelectorNode;
  private psychicDeck: DeckSelectorNode;
  private goButton: ButtonNode;

  constructor() {
    super();
    this.id = DeckSelectSceneName;

    this.occultDeck = new Builder(DeckSelectorNode)
      .with("size", { x: 270, y: 30 })
      .with("colour", 0xFF22A6F5)
      .with("label", "Occult Research")
      .with("deckId", "occult")
      .build();
    this.occultDeck.moveTo({ x: this.root.size.x / 2 - 135, y: this.root.size.y / 2 - 40 });
    this.root.add(this.occultDeck);

    this.techDeck = new Builder(DeckSelectorNode)
      .with("size", { x: 270, y: 30 })
      .with("colour", 0xFFC1E34F)
      .with("label", "Technology Research")
      .with("deckId", "tech")
      .build();
    this.techDeck.moveTo({ x: this.root.size.x / 2 - 135, y: this.root.size.y / 2 });
    this.root.add(this.techDeck);

    this.psychicDeck = new Builder(DeckSelectorNode)
      .with("size", { x: 270, y: 30 })
      .with("colour", 0xFFE00DBD)
      .with("label", "Psychic Research")
      .with("deckId", "psy")
      .build();
    this.psychicDeck.moveTo({ x: this.root.size.x / 2 - 135, y: this.root.size.y / 2 + 40 });
    this.root.add(this.psychicDeck);

    this.goButton = new Builder(ButtonNode)
      .with("size", { x: 150, y: 30 })
      .with("colour", 0xFF55cc55)
      .with("text", "let's go!")
      .with("onMouseUp", () => {
        this.generateStore();
        SceneManager.push(GameSceneName);
      })
      .build();
    this.goButton.moveTo({ x: this.root.size.x / 2 - 75, y: this.root.size.y / 2 + 80 });
    this.root.add(this.goButton);
  }

  public transitionIn(): Promise<any> {
    this.deckLimit = GameState.riftStabilityMax === 75 || GameState.riftStabilityMax === 50 ? 2 : 1;
    this.occultDeck.deckLimit = this.deckLimit;
    this.techDeck.deckLimit = this.deckLimit;
    this.psychicDeck.deckLimit = this.deckLimit;

    return this.root.moveTo({ x: 0, y: this.root.size.y }).then(() => {
      return this.root.moveTo({ x: 0, y: 0 }, 500, Easing.easeOutQuad).then(() => {
        return super.transitionIn();
      });
    });
  }

  public transitionOut(): Promise<any> {
    super.transitionOut();
    return this.root.moveTo({ x: 0, y: -this.root.size.y }, 500, Easing.easeOutQuad);
  }

  private generateStore(): void {
    const setCardsT1: PlayerCard[] = [];
    const setCardsT2: PlayerCard[] = [];
    const setCardsT3: PlayerCard[] = [];
    if (GameState.decksPicked.includes("occult")) {
      setCardsT1.push(...[
        new PlayerCard(PLAYER_CARD_CACHE.get("old one's wrath")),
        new PlayerCard(PLAYER_CARD_CACHE.get("old one's wrath")),
        new PlayerCard(PLAYER_CARD_CACHE.get("old one's wrath")),

        new PlayerCard(PLAYER_CARD_CACHE.get("dark pact")),
        new PlayerCard(PLAYER_CARD_CACHE.get("dark pact")),
        new PlayerCard(PLAYER_CARD_CACHE.get("dark pact")),
      ]);
      setCardsT2.push(...[
        new PlayerCard(PLAYER_CARD_CACHE.get("abyss take me")),
        new PlayerCard(PLAYER_CARD_CACHE.get("abyss take me")),
        new PlayerCard(PLAYER_CARD_CACHE.get("abyss take me")),

        new PlayerCard(PLAYER_CARD_CACHE.get("blood ritual")),
        new PlayerCard(PLAYER_CARD_CACHE.get("blood ritual")),
        new PlayerCard(PLAYER_CARD_CACHE.get("blood ritual")),
      ]);
      setCardsT3.push(...[
        new PlayerCard(PLAYER_CARD_CACHE.get("old one's favour")),
        new PlayerCard(PLAYER_CARD_CACHE.get("old one's favour")),
        new PlayerCard(PLAYER_CARD_CACHE.get("old one's favour")),
      ]);
    }
    if (GameState.decksPicked.includes("tech")) {
      setCardsT1.push(...[
        new PlayerCard(PLAYER_CARD_CACHE.get("experimental rifle")),
        new PlayerCard(PLAYER_CARD_CACHE.get("experimental rifle")),
        new PlayerCard(PLAYER_CARD_CACHE.get("experimental rifle")),

        new PlayerCard(PLAYER_CARD_CACHE.get("collect samples")),
        new PlayerCard(PLAYER_CARD_CACHE.get("collect samples")),
        new PlayerCard(PLAYER_CARD_CACHE.get("collect samples")),
      ]);
      setCardsT2.push(...[
        new PlayerCard(PLAYER_CARD_CACHE.get("emp bomb")),
        new PlayerCard(PLAYER_CARD_CACHE.get("emp bomb")),
        new PlayerCard(PLAYER_CARD_CACHE.get("emp bomb")),

        new PlayerCard(PLAYER_CARD_CACHE.get("live samples")),
        new PlayerCard(PLAYER_CARD_CACHE.get("live samples")),
        new PlayerCard(PLAYER_CARD_CACHE.get("live samples")),
      ]);
      setCardsT3.push(...[
        new PlayerCard(PLAYER_CARD_CACHE.get("containment field")),
        new PlayerCard(PLAYER_CARD_CACHE.get("containment field")),
        new PlayerCard(PLAYER_CARD_CACHE.get("containment field")),
      ]);
    }
    if (GameState.decksPicked.includes("psy")) {
      setCardsT1.push(...[
        new PlayerCard(PLAYER_CARD_CACHE.get("psychic offensive")),
        new PlayerCard(PLAYER_CARD_CACHE.get("psychic offensive")),
        new PlayerCard(PLAYER_CARD_CACHE.get("psychic offensive")),

        new PlayerCard(PLAYER_CARD_CACHE.get("psychic interference")),
        new PlayerCard(PLAYER_CARD_CACHE.get("psychic interference")),
        new PlayerCard(PLAYER_CARD_CACHE.get("psychic interference")),
      ]);
      setCardsT2.push(...[
        new PlayerCard(PLAYER_CARD_CACHE.get("rift stitch")),
        new PlayerCard(PLAYER_CARD_CACHE.get("rift stitch")),
        new PlayerCard(PLAYER_CARD_CACHE.get("rift stitch")),

        new PlayerCard(PLAYER_CARD_CACHE.get("will of mind")),
        new PlayerCard(PLAYER_CARD_CACHE.get("will of mind")),
        new PlayerCard(PLAYER_CARD_CACHE.get("will of mind")),
      ]);
      setCardsT3.push(...[
        new PlayerCard(PLAYER_CARD_CACHE.get("psychic destruction")),
        new PlayerCard(PLAYER_CARD_CACHE.get("psychic destruction")),
        new PlayerCard(PLAYER_CARD_CACHE.get("psychic destruction")),
      ]);
    }

    const tier0_tier1: PlayerCard[] = rand.shuffle([
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
      new PlayerCard(PLAYER_CARD_CACHE.get("recruitment"))
    ].concat(setCardsT1));

    const tier2: PlayerCard[] = rand.shuffle([
      new PlayerCard(PLAYER_CARD_CACHE.get("only the best")),
      new PlayerCard(PLAYER_CARD_CACHE.get("only the best")),

      new PlayerCard(PLAYER_CARD_CACHE.get("public funding")),
      new PlayerCard(PLAYER_CARD_CACHE.get("public funding")),
    ].concat(setCardsT2));

    const tier3: PlayerCard[] = rand.shuffle([
      new PlayerCard(PLAYER_CARD_CACHE.get("anti-matter bomb")),
      new PlayerCard(PLAYER_CARD_CACHE.get("anti-matter bomb")),
    ].concat(setCardsT3));

    GameState.storeDeck =
      (rand.shuffle(tier0_tier1)
        .concat(rand.shuffle(tier2.concat(tier3))))
        .reverse();
  }

  public draw(now: number, delta: number): void {
    drawText(`select up to ${this.deckLimit} additional card sets to bring`, this.root.topLeft.x + this.root.size.x / 2, this.root.topLeft.y + 60, { scale: 2, textAlign: Align.Center, wrap: 400 });
    super.draw(now, delta);
  }
}
