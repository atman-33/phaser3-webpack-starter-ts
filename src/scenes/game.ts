import * as Phaser from 'phaser';
import SceneKeys from '../consts/scene-keys';
import TextureKeys from '../consts/texture-keys';
import LaserObstacle from '../objects/laser-obstacle';
import RocketMouse from '../objects/rocket-mouse';

export default class Game extends Phaser.Scene {

    private background!: Phaser.GameObjects.TileSprite;
    private mouseHole!: Phaser.GameObjects.Image;
    private window1!: Phaser.GameObjects.Image;
    private window2!: Phaser.GameObjects.Image;
    private bookcase1!: Phaser.GameObjects.Image;
    private bookcase2!: Phaser.GameObjects.Image;

    private bookcases: Phaser.GameObjects.Image[] = [];
    private windows: Phaser.GameObjects.Image[] = [];

    private laserObstacle!: LaserObstacle;
    private coins!: Phaser.Physics.Arcade.StaticGroup;

    private mouse!: RocketMouse;

    private scoreLabel!: Phaser.GameObjects.Text;
    private score = 0;

    /**
     *
     */
    constructor() {
        super(SceneKeys.Game);
    }

    init() {
        this.score = 0;
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;

        // create background
        this.background = this.add.tileSprite(0, 0, width, height, TextureKeys.Background)
            .setOrigin(0, 0)
            .setScrollFactor(0, 0);

        // add mouse hole
        this.mouseHole = this.add.image(
            Phaser.Math.Between(900, 1500),
            501,
            TextureKeys.MouseHole);

        // add windows
        this.window1 = this.add.image(
            Phaser.Math.Between(900, 1300),
            200,
            TextureKeys.Window1);

        this.window2 = this.add.image(
            Phaser.Math.Between(1600, 2000),
            200,
            TextureKeys.Window2);

        this.windows = [this.window1, this.window2];

        // add bookcases
        this.bookcase1 = this.add.image(
            Phaser.Math.Between(2200, 2700),
            580,
            TextureKeys.Bookcase1)
            .setOrigin(0.5, 1);

        this.bookcase2 = this.add.image(
            Phaser.Math.Between(2900, 3200),
            580,
            TextureKeys.Bookcase2)
            .setOrigin(0.5, 1);

        this.bookcases = [this.bookcase1, this.bookcase2];

        // add laser obstacle
        this.laserObstacle = new LaserObstacle(this, 900, 100);
        this.add.existing(this.laserObstacle);

        // add coins
        this.coins = this.physics.add.staticGroup();
        this.spawnCoins();

        // add mouse
        this.mouse = new RocketMouse(this, width * 0.5, height - 30);
        this.add.existing(this.mouse);

        // if mouse is dead then run GameOver scene
        this.mouse.emitter.once('dead', () => {
            // console.log('run GameOver scene');
            this.scene.run(SceneKeys.GameOver);
        });

        // mouse can be on the ground
        const body = this.mouse.body as Phaser.Physics.Arcade.Body;
        body.setCollideWorldBounds(true);

        // mouse moves to x
        body.setVelocityX(200);

        // create the ground
        this.physics.world.setBounds(
            0, 0,
            Number.MAX_SAFE_INTEGER, height - 55
        );

        // camera
        this.cameras.main.startFollow(this.mouse);
        this.cameras.main.setBounds(0, 0, Number.MAX_SAFE_INTEGER, height);

        // overlap
        this.physics.add.overlap(
            this.laserObstacle,
            this.mouse,
            () => this.handleOverlapLaser(this.laserObstacle, this.mouse),
            undefined,
            this
        );

        this.coins.children.each(coin => {
            this.physics.add.overlap(
                coin,
                this.mouse,
                () => this.handleCollectCoin(coin, this.mouse),
                undefined,
                this
            );
            return true;
        });

        // add score
        this.scoreLabel = this.add.text(10, 10, `Score: ${this.score}`, {
            fontSize: '24px',
            color: '#080808',
            backgroundColor: '#F8E71C',
            shadow: { fill: true, blur: 0, offsetY: 0 },
            padding: { left: 15, right: 15, top: 10, bottom: 10 }
        }).setScrollFactor(0);
    }

    update(t: number, dt: number) {
        // create new objects if nesessary 
        this.wrapMouseHole();
        this.wrapWindows();
        this.wrapBookcases();
        this.wrapLaserObstacle();

        // scroll the background
        this.background.setTilePosition(this.cameras.main.scrollX);
    }

    private spawnCoins() {
        this.coins.children.each(child => {
            const coin = child as Phaser.Physics.Arcade.Sprite;
            this.coins.killAndHide(coin);
            coin.body.enable = false;
            return true;
        });

        const scrollX = this.cameras.main.scrollX;
        const rightEdge = scrollX + this.scale.width;

        let x = rightEdge + 100;

        const numCoins = Phaser.Math.Between(1, 20);

        for (let i = 0; i < numCoins; ++i) {
            const coin = this.coins.get(x, Phaser.Math.Between(100, this.scale.height - 100), TextureKeys.Coin) as Phaser.Physics.Arcade.Sprite;
            coin.setVisible(true);
            coin.setActive(true);

            const body = coin.body as Phaser.Physics.Arcade.StaticBody;
            body.setCircle(body.width * 0.5);
            body.enable = true;

            body.updateFromGameObject();

            x += coin.width * 1.5;
        }
    }

    private handleOverlapLaser(laserObstacle: LaserObstacle, mouse: RocketMouse): void {
        // console.log('overlap!');
        this.mouse.kill();
    }

    private handleCollectCoin(coin: Phaser.GameObjects.GameObject, mouse: RocketMouse): void {
        const sprite = coin as Phaser.Physics.Arcade.Sprite;
        this.coins.killAndHide(sprite);
        sprite.body.enable = false;

        this.score += 1;
        this.scoreLabel.text = `Score: ${this.score}`;
    }

    private wrapMouseHole() {
        const scrollX = this.cameras.main.scrollX;
        const rightEdge = scrollX + this.scale.width;

        if (this.mouseHole.x + this.mouseHole.width < scrollX) {

            this.mouseHole.x = Phaser.Math.Between(
                rightEdge + 100,
                rightEdge + 1000
            );
        }
    }

    private wrapWindows() {
        const scrollX = this.cameras.main.scrollX;
        const rightEdge = scrollX + this.scale.width;

        let width = this.window1.width * 2;
        if (this.window1.x + width < scrollX) {
            this.window1.x = Phaser.Math.Between(
                rightEdge + width,
                rightEdge + width + 800
            );
            const overlap = this.bookcases.find(bc => {
                return Math.abs(this.window1.x - bc.x) <= this.window1.width;
            });

            this.window1.visible = !overlap;
        }

        width = this.window2.width;
        if (this.window2.x + width < scrollX) {
            this.window2.x = Phaser.Math.Between(
                this.window1.x + width,
                this.window1.x + width + 800
            );
            const overlap = this.bookcases.find(bc => {
                return Math.abs(this.window2.x - bc.x) <= this.window2.width;
            });

            this.window2.visible = !overlap;
        }
    }

    private wrapBookcases() {
        const scrollX = this.cameras.main.scrollX;
        const rightEdge = scrollX + this.scale.width;

        let width = this.bookcase1.width * 2;
        if (this.bookcase1.x + width < scrollX) {
            this.bookcase1.x = Phaser.Math.Between(
                rightEdge + width,
                rightEdge + width + 800
            );
            const overlap = this.windows.find(win => {
                return Math.abs(this.bookcase1.x - win.x) <= win.width;
            });

            this.bookcase1.visible = !overlap;
        }

        width = this.bookcase2.width;
        if (this.bookcase2.x + width < scrollX) {
            this.bookcase2.x = Phaser.Math.Between(
                this.bookcase1.x + width,
                this.bookcase1.x + width + 800
            );
            const overlap = this.windows.find(win => {
                return Math.abs(this.bookcase2.x - win.x) <= win.width;
            });

            this.bookcase2.visible = !overlap;

            // spawn coins
            this.spawnCoins();
        }
    }

    private wrapLaserObstacle() {
        const scrollX = this.cameras.main.scrollX;
        const rightEdge = scrollX + this.scale.width;

        const body = this.laserObstacle.body as Phaser.Physics.Arcade.StaticBody;

        const width = body.width;
        if (this.laserObstacle.x + width < scrollX) {
            this.laserObstacle.x = Phaser.Math.Between(
                rightEdge + width,
                rightEdge + width + 1000
            );
            this.laserObstacle.y = Phaser.Math.Between(0, 300);

            body.position.x = this.laserObstacle.x + body.offset.x;
            body.position.y = this.laserObstacle.y;
        }
    }
}