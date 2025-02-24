export const GameConfig = {
  PHYSICS: {
    GRAVITY: 0.4,
    BOUNCE_ENERGY_LOSS: 0.6,
    FRICTION: 0.98,
    MAX_SPEED: 15,
    RANDOM_BOUNCE_FACTOR: 0.3,
    INITIAL_VELOCITY: {
      X_RANGE: 2,
      Y: 3
    }
  },
  GAME: {
    COST_PER_PLAY: 10,
    INITIAL_BALANCE: 1000,
    BALL_RADIUS: 10,
    PEG_RADIUS: 6 * 1.4,
    PEG_SPACING: 50 * 1.4,
    INITIAL_DROP_HEIGHT: 50,
    DROP_POSITION_VARIANCE: 20
  },
  PAYOUT: {
    MULTIPLIERS: [3, 2, 1.5, 1, 0, 1, 1.5, 2, 3],
    BOX_WIDTH: 42 * 1.4,
    BOX_HEIGHT: 42 * 1.4,
    BOX_SPACING: 8.5 * 1.4
  },
  COLORS: {
    BACKGROUND: 0xa2d2df,
    PEGS: 0xffffff,
    BALL: 0x000000,
    BALL_STROKE: 0x333333,
    PAYOUT_BOX: 0xff0000
  }
}; 