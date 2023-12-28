class Player extends Phaser.GameObjects.Sprite{
    constructor(scene, x, y) {
        super(scene, x, y, 'player', 1);
        this.scene = scene;
        this.scene.add.existing(this);
        this.setScale(2);
        //this.scene.physics.world.enable(this);

        this.setSize(16, 16, false);
        this.cursors = this.scene.input.keyboard.createCursorKeys();
        // 玩家控制设置
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('player', { start: 6, end: 8 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 2 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNumbers('player', { start: 9, end: 11 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'down',
            frames: this.anims.generateFrameNumbers('player', { start: 3, end: 5 }),
            frameRate: 10,
           repeat: -1
        });
        
    }

    update() {
        // 玩家移动控制
        //console.log("CNM");
        // console.log(this.x, this.y);
        this.body.setVelocity(0);
        // 水平移动
        if (this.cursors.left.isDown) {
            this.body.setVelocityX(-200);
        }
        else if (this.cursors.right.isDown) {
            this.body.setVelocityX(200);
        }

        // 垂直移动
        if (this.cursors.up.isDown) {
            this.body.setVelocityY(-200);
        }
        else if (this.cursors.down.isDown) {
            this.body.setVelocityY(200);
        }
        if (this.cursors.right.isDown) {
            this.anims.play('right', true);
        }
        else if (this.cursors.left.isDown) {
            this.anims.play('left', true);
        }
        else if (this.cursors.up.isDown) {
            this.anims.play('up', true);
        }
        else if (this.cursors.down.isDown) {
            this.anims.play('down', true);
        }
        else {
            this.anims.stop();
        }
    }
}

export default Player