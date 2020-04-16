import { Easing } from "../core/interpolation";
import { GameState } from "../game-state";
import { SceneNode } from "./scene-node";
import { SmallCardNode } from "./small-card-node";

export class PlayerHandNode extends SceneNode {
  constructor(initializer: Partial<PlayerHandNode> = {}) {
    super(initializer);
    Object.assign(this, initializer);
    for (let i: number = 0; i < 10; i++) {
      this.add(new SmallCardNode());
    }
  }

  public cards(): SmallCardNode[] {
    const result: SmallCardNode[] = [];
    for (const [id, node] of this.nodes) {
      if (node instanceof SmallCardNode) {
        result.push(node);
      }
    }
    return result;
  }

  public update(now: number, delta: number): void {
    const cardNodes: SmallCardNode[] = this.cards();
    const handSize: number = GameState.playerHand.length;
    let xOffset: number = (338 - (((handSize - 1) * 34) + 32)) / 2;

    for (let i: number = 0; i < handSize; i++) {
      cardNodes[i].card = GameState.playerHand[i];
      if (!cardNodes[i].movementAnimation) {
        cardNodes[i].moveTo({ x: xOffset, y: 0 }, 250 + (25 * i), Easing.easeOutQuad);
      }
      xOffset += 34;
    }
    for (let i: number = handSize; i < cardNodes.length; i++) {
      cardNodes[i].moveTo({ x: -34, y: 0 });
    }
    super.update(now, delta);
  }
}
