export function inBounds(x, y, size) {
  return x >= 0 && y >= 0 && x < size && y < size;
}

export function manhattanDistance(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}
