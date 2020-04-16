export type V2 = {
  x: number;
  y: number;
};

export namespace V2 {
  export function copy(v2: V2): V2 {
    return { x: v2.x, y: v2.y };
  }
  export function set(a: V2, b: V2): void {
    a.x = b.x;
    a.y = b.y;
  }
  export function add(a: V2, b: V2): V2 {
    const result: V2 = copy(a);
    result.x += b.x;
    result.y += b.y;
    return result;
  }
}

export function inside(pt: V2, topleft: V2, size: V2): boolean {
  return (pt.x >= topleft.x && pt.x < topleft.x + size.x && pt.y >= topleft.y && pt.y < topleft.y + size.y);
}
