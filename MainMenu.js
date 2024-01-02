class MainMenu extends Phaser.Scene {
    constructor() {
        super("MainMenu");
    }

    preload() {
        this.load.image('menu', "./assets/Menu.jpg")
    }
    create() {
        this.add.image(480, 360, 'menu');
        // this.add.shader('fire', 400, 300, 512, 512);

        this.input.once('pointerdown', () => {

            this.scene.start('GameScene');

        });
    }
}

export default MainMenu