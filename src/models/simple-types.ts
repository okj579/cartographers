export interface Coordinates {
  x: number;
  y: number;
}

export type Direction = 'left' | 'right' | 'top' | 'bottom';

export function includesCoordinates(coordinates: Coordinates, coordinatesList: Coordinates[]): boolean {
  return coordinatesList.some((c) => c.x === coordinates.x && c.y === coordinates.y);
}

export function getNeighborCoordinates(direction: Direction, coordinates: Coordinates): Coordinates {
  const { x, y } = coordinates;

  switch (direction) {
    case 'top':
      return { x, y: y - 1 };
    case 'right':
      return { x: x + 1, y };
    case 'bottom':
      return { x, y: y + 1 };
    case 'left':
      return { x: x - 1, y };
  }
}
