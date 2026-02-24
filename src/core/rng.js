export function createRng(randomFn = Math.random) {
  return {
    d20() {
      return Math.floor(randomFn() * 20) + 1;
    }
  };
}
