import { GameConfig } from '../../config/GameConfig';

export class HUD {
  private scene: Phaser.Scene;
  private balanceLabel!: Phaser.GameObjects.Text;
  private playButton!: Phaser.GameObjects.Rectangle;
  private playButtonLabel!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, onPlay: () => void) {
    this.scene = scene;
    this.createHUD(onPlay);
  }

  private createHUD(onPlay: () => void) {
    this.balanceLabel = this.scene.add.text(100, 100, `Balance: $${GameConfig.GAME.INITIAL_BALANCE}`, {
      fontSize: '45px',
      color: '#000000',
    });

    this.scene.add.text(100, 150, `Cost to play: $${GameConfig.GAME.COST_PER_PLAY}`, {
      fontSize: '38px',
      color: '#f44336',
    });

    this.playButton = this.scene.add.rectangle(150, 300, 200, 150, 0x4a4848);
    this.playButtonLabel = this.scene.add.text(250, 300, 'Play', {
      fontSize: '32px',
      color: '#ffffff',
    });
    this.playButtonLabel.setOrigin(0.5, 0.5);
    this.playButton.setInteractive();
    this.playButton.setOrigin(0, 0.5);
    this.playButton.on('pointerdown', onPlay);

    this.playButton.on('pointerover', () => {
      this.playButton.setFillStyle(0x666666);
    });
    this.playButton.on('pointerout', () => {
      this.playButton.setFillStyle(0x4a4848);
    });
  }

  updateBalance(balance: number) {
    this.balanceLabel.setText(`Balance: $${balance}`);
  }

  destroy() {
    this.balanceLabel.destroy();
    this.playButton.destroy();
    this.playButtonLabel.destroy();
  }
} 