import * as Phaser from 'phaser';
import AnimationKeys from '../consts/animation-keys';
import TextureKeys from '../consts/texture-keys';

export default class RocketMouse extends Phaser.GameObjects.Container {

    private flames: Phaser.GameObjects.Sprite;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;

    /**
     *
     */
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);

        // create the mouse
        const mouse = scene.add.sprite(0, 0, TextureKeys.RocketMouse)
            .setOrigin(0.5, 1)
            .play(AnimationKeys.RocketMouseRun);

        this.flames = scene.add.sprite(-63, -15, TextureKeys.RocketMouse)
            .play(AnimationKeys.RocketFlamesOn);

        this.enableJetpack(false);

        this.add(this.flames);
        this.add(mouse);

        scene.physics.add.existing(this);

        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setSize(mouse.width, mouse.height);
        body.setOffset(mouse.width * -0.5, -mouse.height);

        // create cursor keys
        this.cursors = scene.input.keyboard.createCursorKeys();
    }

    preUpdate() {
        const body = this.body as Phaser.Physics.Arcade.Body;

        if (this.cursors.space?.isDown) {
            body.setAccelerationY(-600);
            this.enableJetpack(true);
        }
        else {
            body.setAccelerationY(0);
            this.enableJetpack(false);
        }
    }

    enableJetpack(enabled: boolean) {
        this.flames.setVisible(enabled);
    }
}