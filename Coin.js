class Coin extends Phaser.GameObjects.Sprite{
    constructor(scene, x, y) {
        super(scene, x, y, 'coin', 1);
        this.scene = scene;
        this.scene.add.existing(this);
        this.scene.physics.world.enable(this);

        this.setSize(10, 10, false);

        // 设置金币动画
        this.anims.create({
            key: 'rotate',
            frames: this.anims.generateFrameNumbers('coin', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.play('rotate');

        this.isCollected = false;
    }

    update() {
        // console.log(this.x, this.y);
        if (this.isCollected) {
            // 执行收集操作，例如销毁金币
            
            this.destroy();
        }
    }
}
export default Coin
