import {
  OBSTACLE_MIN_GAP,
  OBSTACLE_MAX_GAP,
  OBSTACLE_WIDTH,
  OBSTACLE_MIN_HEIGHT,
  OBSTACLE_MAX_HEIGHT,
} from './runnerConstants';

export type ObstacleKind = 'gift' | 'spike' | 'bag' | 'tag';

export interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  passed: boolean;
  kind: ObstacleKind;
}

const KINDS: ObstacleKind[] = ['gift', 'spike', 'bag', 'tag'];

export function createObstacle(canvasWidth: number, groundY: number): Obstacle {
  const height =
    OBSTACLE_MIN_HEIGHT +
    Math.random() * (OBSTACLE_MAX_HEIGHT - OBSTACLE_MIN_HEIGHT);
  const y = groundY - height;
  const kind = KINDS[Math.floor(Math.random() * KINDS.length)];
  return {
    x: canvasWidth + OBSTACLE_WIDTH,
    y,
    width: OBSTACLE_WIDTH,
    height,
    passed: false,
    kind,
  };
}

export function getNextSpawnX(lastObstacleX: number | null): number {
  const gap =
    OBSTACLE_MIN_GAP +
    Math.random() * (OBSTACLE_MAX_GAP - OBSTACLE_MIN_GAP);
  return lastObstacleX == null ? gap : lastObstacleX + gap;
}
