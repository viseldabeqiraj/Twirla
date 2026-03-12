/**
 * Game tuning constants. Adjust for feel and difficulty.
 */
export const GRAVITY = 0.58;
export const JUMP_VELOCITY = -13.2;
export const INITIAL_SPEED = 3.8;
export const MAX_SPEED = 14;
/** Speed stays at INITIAL_SPEED for this many seconds before ramping. */
export const WARMUP_SECONDS = 12;
export const SPEED_INCREASE_PER_SCORE = 0.014;
export const SPEED_INCREASE_PER_SECOND = 0.28;
export const OBSTACLE_MIN_GAP = 280;
export const OBSTACLE_MAX_GAP = 420;
export const OBSTACLE_WIDTH = 28;
export const OBSTACLE_MIN_HEIGHT = 36;
export const OBSTACLE_MAX_HEIGHT = 56;
export const GROUND_Y_RATIO = 0.82; // fraction of canvas height where ground is
export const CHARACTER_WIDTH = 36;
export const CHARACTER_HEIGHT = 40;
export const CHARACTER_GROUND_OFFSET = 4;
export const SCORE_PER_FRAME = 0.4; // score per 60fps frame while playing
