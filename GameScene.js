import Player from './Player.js';
import Coin from './Coin.js';
import AI from './AI.js'

class GameScene extends Phaser.Scene {
    
    constructor() {
        super('GameScene');
    }
    
    preload() {
        this.load.image('tiles', 'assets/tilemap.jpg');
        this.load.tilemapCSV('map', 'assets/game_map.csv');
        this.load.spritesheet('player', 'assets/Dale.png', {
            frameWidth: 16,
            frameHeight: 16
        });
        this.load.spritesheet("coin", "assets/coin-16x16x4.png", {
            frameWidth: 16,
            frameHeight: 16
        });
        this.load.spritesheet('AI', 'assets/spaceman.png', {
            frameWidth: 16,
            frameHeight: 16
        });
    }

    create() {
        this.map = this.make.tilemap({ key: 'map', tileWidth: 20, tileHeight: 20 });
        const tileset = this.map.addTilesetImage('tiles');

        const layer = this.map.createLayer(0, tileset, 0, 0);
        layer.setScale(2);
        
        
        this.map.setCollisionBetween(1, 1);    

        // 地图和其他元素的创建
        this.player = new Player(this, 100, 100);
        // 添加物理特性
        this.physics.world.enable(this.player);
        this.player.body.setSize(16, 16, false);
        this.player.body.setGravityY(0);
        this.player.body.setCollideWorldBounds(true);

        
        this.ai = new AI(this, 940, 60);
        this.physics.world.enable(this.ai);
        this.ai.body.setSize(16, 16, false);
        this.ai.body.setGravityY(0);
        this.ai.body.setCollideWorldBounds(true);


        this.coins = [];

        this.num = 10
        // 生成金币
        this.generateCoins(this.num); // 生成 10 个金币
        
        // 碰撞和重叠检测
        this.physics.add.collider(this.player, layer);
        this.physics.add.collider(this.ai, layer);
        // this.physics.add.collider(this.coin, layer);

        // this.physics.add.overlap(this.player, this.coin, this.coin.collect, null, this);
        
        this.coins.forEach(coin => {
            this.physics.add.overlap(this.player, coin, () => {
                coin.isCollected = true;
                this.num--;
            }, null, this);
        });

        this.scoreText = this.add.text(this.scale.width - 120, 10, 'Score: 0', { fontSize: '20px', fill: '#ffffff' });
        /**
         * this.physics.add.overlap(this.player, this.coins, () => {
            this.coins.isCollected = true;
        }, null, this);
         * if (this.player.x == this.coin.x && this.player.y == this.coin.y) {
            console.log('Overlap detected');
            this.coin.isCollected = true;
        }**/
    }

    generateCoins(numberOfCoins) {
        for (let i = 0; i < numberOfCoins; i++) {
            let coin;
            let position = this.getRandomPosition();

            while (this.isWall(position)) {
                position = this.getRandomPosition();
            }

            coin = new Coin(this, position.x, position.y);
            this.coins.push(coin);
        }
    }

    getRandomPosition() {
        // 获取随机位置，且在tile的内部
        let x, y
        x = Phaser.Math.Between(0, this.map.width - 1) * this.map.tileWidth + this.map.tileWidth / 2;
        y = Phaser.Math.Between(0, this.map.height - 1) * this.map.tileHeight + this.map.tileHeight / 2; 

        return { x: x, y: y };
    }

    isWall(position) {
        // 检查位置是否与墙重叠
        const tile = this.map.getTileAtWorldXY(position.x, position.y, true);
        return tile && tile.index == 1; // 如果 tile 存在且不是空的，则表示重叠
    }

    isLineOfSightClear(ai, player) {
        let dx = player.x - ai.x;
        let dy = player.y - ai.y;
        let nx = Math.abs(dx);
        let ny = Math.abs(dy);
        let sign_x = dx > 0 ? 1 : -1;
        let sign_y = dy > 0 ? 1 : -1;

        let x = ai.x;
        let y = ai.y;

        for (let ix = 0, iy = 0; ix < nx || iy < ny;) {
            if ((0.5 + ix) / nx === (0.5 + iy) / ny) {
                // 对角线移动
                x += sign_x;
                y += sign_y;
                ix++;
                iy++;
            } else if ((0.5 + ix) / nx < (0.5 + iy) / ny) {
                // 水平移动
                x += sign_x;
                ix++;
            } else {
                // 垂直移动
                y += sign_y;
                iy++;
            }
            if (this.isWall({x : x, y : y})) { // 假设1表示障碍物
                return false; // 视线被阻挡
            }
        }
        return true;
    }
    
    // isLineOfSightClear(grid, ai, player) {
    //     // 计算方向
    //     let dx = Math.sign(player.x - ai.x);
    //     let dy = Math.sign(player.y - ai.y);

    //     let x = ai.x, y = ai.y;
    //     while (x !== player.x || y !== player.y) {
    //         x += dx;
    //         y += dy;

    //         // 检查是否是障碍物
    //         if (grid[y][x] === 1) {
    //             return false;
    //         }
    //     }
    //     return true;
    // }

    update() {
        this.player.update();
        
        this.coins.forEach(coin => {
            if (coin.active) {
                coin.update();
            }
            if (this.num < 10) {
                // console.log(this.num)
                this.score = (10 - this.num) * 10;
                this.scoreText.setText('Score: ' + this.score);
            }
        });

        this.ai.update();

        // if (this.isLineOfSightClear(this.player, this.ai)) {
        //     this.ai.isJPS = true;
        // }
    }
}

export default GameScene