import Phaser from 'phaser';
import Player from './Player.js';
import Coin from './Coin.js';
import AI from './AI.js'
class GameScene extends Phaser.Scene {
    
    constructor() {
        super('GameScene');
    }
    
    preload() {
        // Asset paths are relative to the public/ directory or root in Vite
        this.load.image('tiles', 'assets/Tile.jpg');
        this.load.tilemapCSV('map', 'assets/tile1.csv');
        this.load.spritesheet('player', 'assets/Dale.png', {
            frameWidth: 16,
            frameHeight: 16
        });
        this.load.spritesheet("coin", "assets/Coin.png", {
            frameWidth: 16,
            frameHeight: 16
        });
        this.load.spritesheet('AI', 'assets/Black.png', {
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

        this.grid = [];
        for (let y = 0; y < this.map.height; y++) {
            let col = [];
            for (let x = 0; x < this.map.width; x++) {
                let tile = this.map.getTileAt(x, y);
                col.push(tile && tile.index === 1 ? 1 : 0); // 如果是障碍物，则为1，否则为0
            }
            this.grid.push(col);
        }
        
        // 地图和其他元素的创建
        // Player spawn at Top-Left (Tile 1,1) -> 60, 60
        this.player = new Player(this, 60, 60);
        // 添加物理特性
        this.player.setScale(2);
        this.physics.world.enable(this.player);
        this.player.body.setSize(16, 16, true);
        this.player.body.setGravityY(0);
        this.player.body.setCollideWorldBounds(true);

        // AI spawn at Bottom-Right (Tile 22,16) -> 900, 660
        this.ai = new AI(this, 900, 660);
        this.ai.setScale(2);
        this.physics.world.enable(this.ai);
        this.ai.body.setGravityY(0);
        this.ai.body.setCollideWorldBounds(true);

        // 设置走过的方块
        this.PLAYER_WALKED_TILE = 2; 
        this.AI_WALKED_TILE = 3; 
        this.prevPlayerPos = { x: this.player.x, y: this.player.y };
        this.prevAIPos = { x: this.ai.x, y: this.ai.y };

        this.coins = [];

        this.num = 10
        // 生成金币
        this.generateCoins(this.num); // 生成 10 个金币
        
        // 碰撞和重叠检测
        this.physics.add.collider(this.player, layer);
        this.physics.add.collider(this.ai, layer);
        
        this.coins.forEach(coin => {
            this.physics.add.overlap(this.player, coin, () => {
                if (coin.isCollected) return;
                coin.isCollected = true;
                coin.disableBody(true, true);
                this.num--;
            }, null, this);
        });

        this.scoreText = this.add.text(this.scale.width - 120, 10, 'Score: 0', { fontSize: '20px', fill: '#ffffff' });
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
        x = Phaser.Math.Between(0, this.map.width - 1) * this.map.tileWidth * 2 + this.map.tileWidth ;
        y = Phaser.Math.Between(0, this.map.height - 1) * this.map.tileHeight * 2 + this.map.tileHeight ; 

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
    
    // 可视化
    revertTile(x, y) {
        const originalIndex = 0;
       
        const tileX = Math.floor(x / this.map.tileWidth);
        const tileY = Math.floor(y / this.map.tileHeight);
        let tile = this.map.getTileAt(tileX, tileY);
        if (tile) {
            tile.index = originalIndex;
        }
    }
    
    checkAndUpdateTile(entity, prevPos, tileType) {
        if (entity.x !== prevPos.x || entity.y !== prevPos.y) {
            // 转换坐标系
            const tileX = Math.floor(prevPos.x / 40);
            const tileY = Math.floor(prevPos.y / 40);

            // 找到之前位置的砖块
            let tile = this.map.getTileAt(tileX, tileY);

            // 如果有砖块即切换
            if (tile) {
                tile.index = tileType;
                setTimeout(() => this.revertTile(prevPos.x, prevPos.y), 1000);
            }
        }
    }

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

        this.physics.add.overlap(this.player, this.ai, () => {
            this.physics.pause(); // 暂停物理引擎，停止游戏
            this.endText = this.add.text(this.scale.width - 560, 360, 'Wasted', { fontSize: '60px', fill: '#ffffff' });
        }, null, this);
        
        if (this.num == 0) {
           this.physics.pause(); // 暂停物理引擎，停止游戏
        this.endText = this.add.text(this.scale.width - 550, 360, 'Win', { fontSize: '60px', fill: '#ffffff' }); 
        }
        // if(this.score == 100) 
        // if (this.isLineOfSightClear(this.player, this.ai)) {
        //     this.ai.isJPS = true;
        // }

        this.checkAndUpdateTile(this.player, this.prevPlayerPos, this.PLAYER_WALKED_TILE);
        this.checkAndUpdateTile(this.ai, this.prevAIPos, this.AI_WALKED_TILE);

        // 更新过去位置
        this.prevPlayerPos = { x: this.player.x, y: this.player.y };
        this.prevAIPos = { x: this.ai.x, y: this.ai.y };
    }
}

export default GameScene