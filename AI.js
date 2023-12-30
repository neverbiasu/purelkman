class AI extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'AI', 1);
        this.scene = scene;
        this.scene.add.existing(this);
        this.setScale();
        this.setSize(8, 8, false);
        this.direction = 'right';
        this.speed = 200;
        this.easystar = new EasyStar.js();

        // 设置网格和可行走的tile
        this.easystar.setGrid(this.scene.grid);
        this.easystar.setAcceptableTiles([0]);
        
        this.isJPS = false;

        this.openSet = new Set();
        this.closedSet = new Set();
        this.cameFrom = new Map();
        this.gScore = new Map(); // 从起点到当前节点的成本
        this.fScore = new Map(); // gScore + 启发式成本

        // this.astar = new Astar(this.scene.grid);
        // this.start = new Phaser.Point(startX, startY);
        // this.goal = new Phaser.Point(goalX, goalY);
        // this.path = astarPlugin.findPath(start, goal);

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

        return this.scene.isWall({ x: this.x + b, y: this.y + c });
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

        let visited = new Set();
        const maxSteps = 1000; // 设置最大步数限制
        let steps = 0;

        while (openList.length > 0 && steps < maxSteps) {
            let current = openList.pop();
            visited.add(current.x + ',' + current.y);
            // console.log(cameFrom.size);
            if (current.x === target.x && current.y === target.y) {
                return this.reconstructPath(cameFrom, current);
            }

            let neighbors = this.getNeighbors(current);
            for (let neighbor of neighbors) {
                let key = neighbor.x + ',' + neighbor.y;
                if (!visited.has(key) && !this.scene.isWall(neighbor.x, neighbor.y)) {
                    cameFrom.set(neighbor, current);
                    openList.push(neighbor);
                    visited.add(key);
                }
            }
            steps++;
        }
        return null;
    }

    // getNeighbors(node) {
    //     return [
    //         { x: node.x + 1, y: node.y },
    //         { x: node.x - 1, y: node.y },
    //         { x: node.x, y: node.y + 1 },
    //         { x: node.x, y: node.y - 1 }
    //         // 可以添加对角方向的邻居，如果需要
    //     ];
    // }

    // reconstructPath(cameFrom, current) {
    //     let path = [];
    //     while (cameFrom.has(current)) {
    //         path.unshift(current);
    //         current = cameFrom.get(current);
    //     }
    //     return path;
    // }

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
        console.log(`angle${angle}`)
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

    getNeighbors(node) {
        let neighbors = [];
        let directions = [
            { x: 1, y: 0 },  // 右
            { x: -1, y: 0 }, // 左
            { x: 0, y: 1 },  // 上
            { x: 0, y: -1 }  // 下
        ];

        directions.forEach(dir => {
            let neighbor = { x: node.x + dir.x, y: node.y + dir.y };
            // console.log(neighbor)
            // console.log(this.isInBounds(neighbor))
            // console.log(this.scene.isWall(neighbor))
            // let x = (neighbor.x * 40) + 20; 
            // let y = (neighbor.y * 40) + 20; // 网格中心点
            if (this.isInBounds(neighbor) && !this.closedSet.has(neighbor) && !this.isWall(neighbor)) {
                neighbors.push(neighbor);
                // console.log(`neighbor.x${ neighbor.x }`);
            }
            // console.log(neighbors[1])
        });

        return neighbors;
    }

    isInBounds(node) {
        // 在边界内
        let gridWidth = Math.floor(960 / 40); 
        let gridHeight = Math.floor(720 / 40); 
        return node.x >= 0 && node.y >= 0 && node.x < gridWidth && node.y < gridHeight;
    }

    isWall(node) {
        let x = node.x * 40 ;
        let y = node.y * 40 ;
        return (this.scene.isWall(x, y));
    }

    manhattanDistance(node, goal) {
        return Math.abs(node.x - goal.x) + Math.abs(node.y - goal.y);
    }

    aStarSearch(start, goal) {
        this.openSet.add(start);
        this.gScore.set(start, 0);
        this.fScore.set(start, this.manhattanDistance(start, goal));
        
        console.log(this.fScore);
        console.log(`Searching from ${start.x},${start.y} to ${goal.x},${goal.y}`);

        while (this.openSet.size > 0) {
            let current = this.getLowestFScoreNode();
            console.log(`Current node: ${current.x},${current.y}`);
            if (current.x === goal.x && current.y === goal.y) {
                return this.reconstructPath(current);
            }
            
            this.openSet.delete(current);
            this.closedSet.add(current);

            let neighbors = this.getNeighbors(current);
            // console.log(neighbors)
            for (let neighbor of neighbors) {
                if (this.closedSet.has(neighbor)) {
                    continue;
                }

                let tentativeGScore = this.gScore.get(current) + 1; // 假设每步成本为 1
                if (!this.openSet.has(neighbor)) {
                    this.openSet.add(neighbor);
                } else if (tentativeGScore >= this.gScore.get(neighbor)) {
                    continue;
                }

                this.cameFrom.set(neighbor, current);
                this.gScore.set(neighbor, tentativeGScore);
                this.fScore.set(neighbor, tentativeGScore + this.manhattanDistance(neighbor, goal));
                // console.log(this.gScore, this.fScore)
            }
        }

        return null; // 未找到路径
    }

    getLowestFScoreNode() {
        let lowestNode = null;
        let lowestFScore = Infinity;

        for (let node of this.openSet) {
            let fScore = this.fScore.get(node) || Infinity;
            if (fScore < lowestFScore) {
                lowestFScore = fScore;
                lowestNode = node;
            }
        }

        return lowestNode;
    }

    reconstructPath(current) {
        let path = [];
        while (current) {
            path.unshift(current);
            current = this.cameFrom.get(current);
        }
        return path;
    }

    update() {
        // console.log(this.direction, this.x, this.y);
        //    1st version
        // if (this.scene.isLineOfSightClear(this, this.scene.player)) {
        //     // 跳点搜索
        //     this.moveToPlayer(this.scene.player);
        // } else {
        //     if (this.isObstacleAhead()) {
        //         this.chooseDirection();
        //         // console.log(this.isObstacleAhead());
        //     }
        // }
        // 2nd version
        // let path = this.jps({ x: this.x, y: this.y }, { x: this.scene.player.x, y: this.scene.player.y });
        // // console.log(path); array(0)
        // this.followPath(path);

        // 3rd version
        // 转换坐标为网格坐标
        // let startX = Math.floor(this.x / 40);
        // let startY = Math.floor(this.y / 40);
        // let endX = Math.floor(this.scene.player.x / 40);
        // let endY = Math.floor(this.scene.player.y / 40);

        // // console.log(startX, endX)
        // // console.log(this.scene.grid[1])
        // this.easystar.findPath(startX, startY, endX, endY, path => {
        //     if (path === null || path.length === 0) {
        //         console.log("No path found");
        //     } else {
        //         // 跟随找到的路径
        //         console.log("Path was found. The first Point is " + path[0].x + " " + path[0].y);
        //         this.followPath(path);
        //         if (path !== null && path.length > 0) {
        //             path.forEach((point, index) => {
        //                 // console.log(`Step ${index}: x=${point.x}, y=${point.y}`);
        //             });
        //         }
        //     }
        // });
        // this.easystar.calculate();
        
        // 4th version
        
        let start = { x: Math.floor(this.x / 40), y: Math.floor(this.y / 40) };
        let goal = { x: Math.floor(this.scene.player.x / 40), y: Math.floor(this.scene.player.y / 40) };
        console.log(start);

        let path = this.aStarSearch(start, goal);
        // console.log(path)
        if (path && path.length > 0) {
            this.followPath(path);
        }
        
        // 5th version
        // this.followPath(this.path);

        // 6th version 
        // prevPosition = { x: this.scene.player.x, y: this.scene.player.y };
        // let start = { x: Math.floor(this.x / 40), y: Math.floor(this.y / 40) };
        // let goal = { x: Math.floor(this.scene.player.x / 40), y: Math.floor(this.scene.player.y / 40) };
        // let path = this.astar(start, goal);
        // if (path && path.length > 0) {
        //     // Follow the path
        //     this.followPath(path);
        // }
    }
}
export default AI