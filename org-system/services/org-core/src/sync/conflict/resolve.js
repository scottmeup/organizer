export function resolveConflict(input) {
  const leftTime = new Date(input.leftUpdatedAt || 0).getTime();
  const rightTime = new Date(input.rightUpdatedAt || 0).getTime();
  return leftTime >= rightTime ? 'left' : 'right';
}
