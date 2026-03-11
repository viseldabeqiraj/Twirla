/**
 * AABB collision for runner character vs obstacles.
 * Uses a slightly smaller hitbox for fairer feel.
 */
export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function checkCollision(a: Box, b: Box, padding = 4): boolean {
  const ap = {
    x: a.x + padding,
    y: a.y + padding,
    width: a.width - padding * 2,
    height: a.height - padding * 2,
  };
  return (
    ap.x < b.x + b.width &&
    ap.x + ap.width > b.x &&
    ap.y < b.y + b.height &&
    ap.y + ap.height > b.y
  );
}
