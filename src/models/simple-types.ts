export interface Coordinates {
  x: number;
  y: number;
}

export function includesCoordinates(coordinates: Coordinates, coordinatesList: Coordinates[]): boolean {
  return coordinatesList.some((c) => c.x === coordinates.x && c.y === coordinates.y);
}
