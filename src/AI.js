import Phaser from 'phaser';
import EasyStar from 'easystarjs';

class AI extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'AI', 1);
        this.scene = scene;
        this.scene.add.existing(this);
        this.setScale(2);
        this.scene.physics.world.enable(this);
        this.body.setSize(16, 16, true); // Match player logic: 16x16 centered

        this.speed = 100; // Reduced speed slightly to be manageable
        this.lastPathSearchTime = 0;
        this.path = [];
        this.pathIndex = 1;

        this.easystar = new EasyStar.js();
        this.easystar.setGrid(this.scene.grid);
        this.easystar.setAcceptableTiles([0, 2, 3]);
        this.easystar.enableDiagonals(); // Enable diagonals for smoother movement if grid allows
        this.easystar.disableCornerCutting(); // Prevent getting stuck on corners

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('AI', { start: 2, end: 2 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('AI', { start: 3, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNumbers('AI', { start: 1, end: 1 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'down',
            frames: this.anims.generateFrameNumbers('AI', { start: 0, end: 0 }),
            frameRate: 10,
            repeat: -1
        });
    }

    update() {
        const now = this.scene.time.now;

        // Recalculate path every 500ms
        if (now > this.lastPathSearchTime + 500) {
            this.lastPathSearchTime = now;
            
            const startX = Math.floor(this.x / 40);
            const startY = Math.floor(this.y / 40);
            const endX = Math.floor(this.scene.player.x / 40);
            const endY = Math.floor(this.scene.player.y / 40);

            this.easystar.findPath(startX, startY, endX, endY, (path) => {
                if (path && path.length > 0) {
                    this.path = path;
                    this.pathIndex = 1; // Target the next step (index 0 is current)
                }
            });
        }

        this.easystar.calculate();
        this.moveAlongPath();
    }

    moveAlongPath() {
        if (!this.path || this.path.length === 0 || this.pathIndex >= this.path.length) {
            this.body.setVelocity(0, 0);
            return;
        }

        let node = this.path[this.pathIndex];
        let targetX = node.x * 40 + 20; // Center of tile
        let targetY = node.y * 40 + 20;

        const distance = Phaser.Math.Distance.Between(this.x, this.y, targetX, targetY);

        // If reached the target (within tolerance), move to next point
        if (distance < 5) {
            this.pathIndex++;
            if (this.pathIndex < this.path.length) {
                node = this.path[this.pathIndex];
                targetX = node.x * 40 + 20;
                targetY = node.y * 40 + 20;
            } else {
                this.body.setVelocity(0, 0);
                return;
            }
        }

        // Move towards target
        const angle = Math.atan2(targetY - this.y, targetX - this.x);
        this.body.setVelocity(Math.cos(angle) * this.speed, Math.sin(angle) * this.speed);

        // Update animations
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        if (Math.abs(dx) > Math.abs(dy)) {
            this.anims.play(dx > 0 ? 'right' : 'left', true);
        } else {
            this.anims.play(dy > 0 ? 'down' : 'up', true);
        }
    }
}

export default AI;
