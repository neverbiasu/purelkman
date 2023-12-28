class AI extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'AI', 1);
        this.scene = scene;
        this.scene.add.existing(this);
        this.setScale(2);
        this.setSize(16, 16, false);
        this.direction = 'right';
        this.speed = 200;
        
        this.isJPS = false;
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('AI', { start: 8, end: 9 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('AI', { start: 1, end: 2 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNumbers('AI', { start: 11, end: 13 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'down',
            frames: this.anims.generateFrameNumbers('AI', { start: 4, end: 6 }),
            frameRate: 10,
           repeat: -1
        });
    }

    isObstacleAhead() {
        let b = 0, c = 0;
        switch (this.direction) {
            case 'left':
                b = -20;
                if (this.x + b <= 0) return true;
                break;
            case 'right':
                b = 20;
                if (this.x + b >= 960) return true;
                break;
            case 'up':
                c = -20;
                if (this.y + c <= 0) return true;
                break;
            case 'down':
                c = 20;
                if (this.y + c >= 720) return true;
                break;
        }

        return this.scene.isWall({ x : this.x + b, y : this.y + c });
    }
    
    chooseDirection() {
        const directions = ['left', 'right', 'up', 'down'];
        // let d = this.direction;
        // directions.indexOf(d)
        this.direction = Phaser.Math.RND.pick(directions);

        this.body.setVelocity(0, 0);
        switch (this.direction) {
            case 'left':
                this.body.setVelocityX(-200);
                this.anims.play('left', true);
                break;
            case 'right':
                this.body.setVelocityX(200);
                this.anims.play('right', true);
                break;
            case 'up':
                this.body.setVelocityY(-200);
                this.anims.play('up', true);
                break;
            case 'down':
                this.body.setVelocityY(200);
                this.anims.play('down', true);
                break;
        }
    }

    findJumpPoint(x, y, dx, dy, parent) {
                let newX = x + dx;
                let newY = y + dy;

                if (!isValid(grid, newX, newY)) return null;
            
                let node = { x: newX, y: newY, parent: parent };

                if (newX === end.x && newY === end.y) return node;

                // ...其他JPS逻辑...

                return findJumpPoint(newX, newY, dx, dy, node);
    }
    
    moveToPlayer(player) {
        // 简化的寻路逻辑，直接朝向玩家位置移动
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const angle = Math.atan2(dy, dx);

        this.body.setVelocity(Math.cos(angle) * this.speed, Math.sin(angle) * this.speed);

        // 根据移动方向更新动画
        if (Math.abs(dx) > Math.abs(dy)) {
            this.anims.play(dx > 0 ? 'right' : 'left', true);
        } else {
            this.anims.play(dy > 0 ? 'down' : 'up', true);
        }
    }

    update() {
        // console.log(this.direction, this.x, this.y);
       
        if (this.scene.isLineOfSightClear(this, this.scene.player)) {
            // 跳点搜索
            this.moveToPlayer(this.scene.player);
        } else {
            if (this.isObstacleAhead()) {
                this.chooseDirection();
                // console.log(this.isObstacleAhead());
            }
        }
    }
}

export default AI