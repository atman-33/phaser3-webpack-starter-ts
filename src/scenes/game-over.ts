import * as Phaser from 'phaser';
import SceneKeys from '../consts/scene-keys';

export default class GameOver extends Phaser.Scene {

    /**
     *
     */
    constructor() {
        super(SceneKeys.GameOver);
    }

    create() {
        const { width, height } = this.scale;

        const x = width * 0.5;
        const y = height * 0.5;

        this.add.text(x, y, 'Press SPACE or CLICK to Play Again', {
            fontSize: '32px',
            color: '#FFFFFF',
            backgroundColor: '#000000',
            shadow: { fill: true, blur: 0, offsetY: 0 },
            padding: { left: 15, right: 15, top: 10, bottom: 10 }
        }).setOrigin(0.5);

        this.input.keyboard.once('keydown-SPACE', () => {
            this.changeGameScene();
        });

        this.input.on('pointerdown', () => {
            this.changeGameScene();
        });
    }

    private changeGameScene() {
        // stop the GameOver scene
        this.scene.stop(SceneKeys.GameOver);

        // stop and restart the Game scene
        this.scene.stop(SceneKeys.Game);
        this.scene.start(SceneKeys.Game);
    }
} 