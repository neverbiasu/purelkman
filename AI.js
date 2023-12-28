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

    jps(start, target) {
        let openList = [start];
        let cameFrom = new Map();

        while (openList.length > 0) {
            // console.log(cameFrom.length);
            let current = openList.pop();

            if (current.x === target.x && current.y === target.y) {
                return this.reconstructPath(cameFrom, current);
            }

            // 获取当前节点的所有邻居
            let neighbors = this.getNeighbors(current);
            for (let neighbor of neighbors) {
                if (!cameFrom.has(neighbor) && !this.scene.isWall(neighbor.x, neighbor.y)) {
                    cameFrom.set(neighbor, current);
                    openList.push(neighbor);
                }
            }
        }

        return null;
    }

    getNeighbors(node) {
        return [
            { x: node.x + 1, y: node.y },
            { x: node.x - 1, y: node.y },
            { x: node.x, y: node.y + 1 },
            { x: node.x, y: node.y - 1 }
            // 可以添加对角方向的邻居，如果需要
        ];
    }

    reconstructPath(cameFrom, current) {
        let path = [];
        while (cameFrom.has(current)) {
            path.unshift(current);
            current = cameFrom.get(current);
        }
        return path;
    }

    followPath(path) {
        if (path && path.length > 0) {
            let nextPoint = path[0];
            this.moveToPoint(nextPoint);
        }
    }

    moveToPoint(point) {
        // 计算方向
        const dx = point.x - this.x;
        const dy = point.y - this.y;
        const angle = Math.atan2(dy, dx);

        // 根据方向设置速度
        const speed = 200; // 假设AI的速度为200
        this.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
        // console.log(Math.cos(angle) * speed, Math.sin(angle) * speed);
        // 更新动画和朝向
        this.updateAnimationAndOrientation(dx, dy);
    }

    updateAnimationAndOrientation(dx, dy) {
        // 根据移动方向更新动画
        if (Math.abs(dx) > Math.abs(dy)) {
            this.anims.play(dx > 0 ? 'right' : 'left', true);
        } else {
            this.anims.play(dy > 0 ? 'down' : 'up', true);
        }
    }

    update() {
        // console.log(this.direction, this.x, this.y);
       
        // if (this.scene.isLineOfSightClear(this, this.scene.player)) {
        //     // 跳点搜索
        //     this.moveToPlayer(this.scene.player);
        // } else {
        //     if (this.isObstacleAhead()) {
        //         this.chooseDirection();
        //         // console.log(this.isObstacleAhead());
        //     }
        // }

        let path = this.jps({ x: this.x, y: this.y }, { x: this.scene.player.x, y: this.scene.player.y });
        // console.log(path); array(0)
        // this.followPath(path);
    }
}

export default AI