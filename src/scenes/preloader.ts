import * as Phaser from 'phaser';
import SceneKeys from '../consts/scene-keys';
import TextureKeys from '../consts/texture-keys';

export default class Preloader extends Phaser.Scene {
    /**
     *
     */
    constructor() {
        super(SceneKeys.Preloader);
    }

    preload() {
        // load background
        this.load.image(
            TextureKeys.Background,
            './assets/images/house/bg_repeat_340x640.png');

        // load mouse hole
        this.load.image(
            TextureKeys.MouseHole,
            './assets/images/house/object_mousehole.png'
        );

        // load windows
        this.load.image(TextureKeys.Window1, './assets/images/house/object_window1.png');
        this.load.image(TextureKeys.Window2, './assets/images/house/object_window2.png');

        // load bookcases
        this.load.image(TextureKeys.Bookcase1, './assets/images/house/object_bookcase1.png');
        this.load.image(TextureKeys.Bookcase2, './assets/images/house/object_bookcase2.png');

        // load mouse
        this.load.atlas(
            TextureKeys.RocketMouse,
            './assets/images/characters/rocket-mouse.png',
            './assets/images/characters/rocket-mouse.json');

        // load laser
        this.load.image(TextureKeys.LaserEnd, './assets/images/house/object_laser_end.png');
        this.load.image(TextureKeys.LaserMiddle, './assets/images/house/object_laser.png');

        // load coin
        this.load.image(TextureKeys.Coin, './assets/images/house/object_coin.png');
    }

    create() {
        // go to game scene
        this.scene.start(SceneKeys.Game);
    }
}