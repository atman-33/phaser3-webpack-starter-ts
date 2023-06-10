import * as Phaser from 'phaser';
import AnimationKeys from '../consts/animation-keys';
import TextureKeys from '../consts/texture-keys';

enum MouseState {
    Running,
    Killed,
    Dead
}

export default class RocketMouse extends Phaser.GameObjects.Container {

    private mouseState = MouseState.Running;

    private flames: Phaser.GameObjects.Sprite;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;

    private mouse: Phaser.GameObjects.Sprite;
    public emitter: Phaser.Events.EventEmitter;
    
    public isFlying: boolean = false;

    /**
     *
     */
    constructor(scene: Phaser.Scene, x: number, y: number) {

        super(scene, x, y);
        this.emitter = new Phaser.Events.EventEmitter();

        // create the mouse
        this.mouse = scene.add.sprite(0, 0, TextureKeys.RocketMouse)
            .setOrigin(0.5, 1)
            .play(AnimationKeys.RocketMouseRun).setInteractive();

        this.flames = scene.add.sprite(-63, -15, TextureKeys.RocketMouse)
            .play(AnimationKeys.RocketFlamesOn);

        this.createAnimations();

        this.enableJetpack(false);

        this.add(this.flames);
        this.add(this.mouse);

        scene.physics.add.existing(this);

        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setSize(this.mouse.width * 1.4, this.mouse.height);
        body.setOffset(this.mouse.width * -0.8, -this.mouse.height - 20);

        // create cursor keys
        this.cursors = scene.input.keyboard.createCursorKeys();
    }

    public getMouseSplite(){
        return this.mouse;
    }

    private createAnimations() {
        this.mouse.anims.create({
            key: AnimationKeys.RocketMouseRun,
            frames: this.mouse.anims.generateFrameNames(
                TextureKeys.RocketMouse,
                {
                    prefix: 'rocketmouse_run',
                    zeroPad: 2,
                    start: 1,
                    end: 4,
                    suffix: '.png'
                }),
            frameRate: 10,
            repeat: -1  // -1 to loop forever
        });

        this.mouse.anims.create({
            key: AnimationKeys.RocketFlamesFall,
            frames: [{
                key: TextureKeys.RocketMouse,
                frame: 'rocketmouse_fall01.png'
            }]
        });

        this.mouse.anims.create({
            key: AnimationKeys.RocketFlamesFly,
            frames: [{
                key: TextureKeys.RocketMouse,
                frame: 'rocketmouse_fly01.png'
            }]
        });

        this.mouse.anims.create({
            key: AnimationKeys.RocketFlamesOn,
            frames: this.mouse.anims.generateFrameNames(TextureKeys.RocketMouse,
                { start: 1, end: 2, prefix: 'flame', suffix: '.png' }),
            frameRate: 10,
            repeat: -1
        });

        this.mouse.anims.create({
            key: AnimationKeys.RocketMouseDead,
            frames: this.mouse.anims.generateFrameNames(TextureKeys.RocketMouse,
                {
                    prefix: 'rocketmouse_dead',
                    zeroPad: 2,
                    start: 1,
                    end: 2,
                    suffix: '.png'
                }),
            frameRate: 10
        });
    }

    preUpdate() {
        const body = this.body as Phaser.Physics.Arcade.Body;

        switch (this.mouseState) {

            case MouseState.Running: {
                if (this.cursors.space?.isDown || this.isFlying) {
                    body.setAccelerationY(-600);
                    this.enableJetpack(true);

                    this.mouse.play(AnimationKeys.RocketFlamesFly, true);
                }
                else {
                    body.setAccelerationY(0);
                    this.enableJetpack(false);
                }

                if (body.blocked.down) {
                    // play run when touching the ground
                    this.mouse.play(AnimationKeys.RocketMouseRun, true);
                }
                else if (body.velocity.y > 0) {
                    // play falll when longer ascending
                    this.mouse.play(AnimationKeys.RocketFlamesFall, true);
                }
                break;
            }

            case MouseState.Killed: {
                body.velocity.x *= 0.98;

                if (body.velocity.x <= 5) {
                    this.mouseState = MouseState.Dead;
                    this.emitter.emit('dead');
                    // console.log('mouse dead...');
                }
                break;
            }

            case MouseState.Dead: {
                body.setVelocity(0, 0);
                break;
            }
        }
    }

    enableJetpack(enabled: boolean) {
        this.flames.setVisible(enabled);
    }

    kill() {

        if (this.mouseState !== MouseState.Running) {
            return;
        }

        this.mouseState = MouseState.Killed;

        this.mouse.play(AnimationKeys.RocketMouseDead);

        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setAccelerationY(0);
        body.setVelocity(1000, 0);
        this.enableJetpack(false);
    }
}