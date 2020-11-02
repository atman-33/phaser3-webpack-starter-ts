import MarioInputs from "./MarioInputs";

enum States {
  STANDING = 0,
  FALLING = 1,
  CROUCHING = 2,
  JUMPING = 3,
  WALKING = 4,
}

export default class Mario extends Phaser.Physics.Arcade.Sprite {
  public body: Phaser.Physics.Arcade.Body;
  public inputs: MarioInputs;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "player");

    this.setData({ jumpVelocity: -260, walkVelocity: 128 });

    this.scene.add.existing(this);
    this.scene.physics.world.enable(this);

    this.body.setSize(16, 24).setOffset(0, 8).setCollideWorldBounds(true);

    this.inputs = new MarioInputs(this.scene);

    this.scene.anims.create({
      key: "stand",
      frameRate: 0,
      frames: this.scene.anims.generateFrameNumbers("player", {
        start: 0,
      }),
      repeat: 0,
    });

    this.scene.anims.create({
      key: "walk",
      frameRate: 12,
      frames: this.scene.anims.generateFrameNumbers("player", {
        start: 0,
        end: 2,
      }),
      repeat: -1,
    });

    this.scene.anims.create({
      key: "jump",
      frameRate: 0,
      frames: this.scene.anims.generateFrameNumbers("player", {
        start: 2,
      }),
    });

    this.scene.anims.create({
      key: "crouch",
      frameRate: 0,
      frames: this.scene.anims.generateFrameNumbers("player", {
        start: 3,
      }),
    });
  }

  public setState(value: number): this {
    switch (value) {
      case States.JUMPING:
        this.body
          .setSize(16, 24)
          .setOffset(0, 8)
          .setVelocityY(this.getData("jumpVelocity"));
        this.play("jump");
        break;
      case States.WALKING:
        this.body.setSize(16, 24).setOffset(0, 8);
        this.play("walk");
        break;
      case States.CROUCHING:
        this.body.setSize(16, 16).setOffset(0, 16).setVelocityX(0);
        this.play("crouch");
        break;
      case States.FALLING:
        this.body.setSize(16, 24).setOffset(0, 8);
        this.play("jump");
        break;
      case States.STANDING:
        this.body.setSize(16, 24).setOffset(0, 8).setVelocityX(0);
        this.play("stand");
        break;
    }

    return super.setState(value);
  }

  public preUpdate(time: number, delta: number): void {
    const { left, right, down, jump } = this.inputs;
    const flipX = left ? true : right ? false : this.flipX;
    const velocityX =
      (right ? 1 : left ? -1 : 0) * this.getData("walkVelocity");

    switch (this.state) {
      case States.STANDING:
        if (this.body.onFloor() && jump) {
          this.setState(States.JUMPING);
        } else if (this.body.onFloor() && (left || right)) {
          this.setState(States.WALKING);
        } else if (this.body.onFloor() && down) {
          this.setState(States.CROUCHING);
        } else if (!this.body.onFloor()) {
          this.setState(States.FALLING);
        }
        break;

      case States.WALKING:
        this.setFlipX(flipX);
        this.body.setVelocity(velocityX, 0);

        if (this.body.onFloor() && jump) {
          this.setState(States.JUMPING);
        } else if (!this.body.onFloor()) {
          this.setState(States.FALLING);
        } else if (!(this.body.onFloor() && (left || right))) {
          this.setState(States.STANDING);
        }
        break;

      case States.CROUCHING:
        if (!(this.body.onFloor() && down)) {
          this.setState(States.STANDING);
        }
        break;

      case States.JUMPING:
        if (this.body.velocity.y > 0) {
          this.setState(States.FALLING);
        } else if (!jump) {
          this.setVelocityY(this.body.velocity.y * 0.9);
        }

      case States.FALLING:
        this.setFlipX(flipX);
        this.body.setVelocityX(velocityX);

        if (this.body.onFloor()) {
          this.setState(States.STANDING);
        }
        break;
    }

    super.preUpdate(time, delta);
  }
}