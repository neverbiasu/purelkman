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

        this.speed = 200;
        this.lastPathSearchTime = 0;
        this.path = [];
        this.currentPathIndex = 0;

        this.easystar = new EasyStar.js();
        this.easystar.setGrid(this.scene.grid);
        this.easystar.setAcceptableTiles([0, 2, 3]);
        this.easystar.enableDiagonals();
        this.easystar.disableCornerCutting();

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
                    // If we have an existing path, try to find where we are in the new path
                    // to avoid backtracking
                    if (this.path && this.currentPathIndex < this.path.length) {
                        // Find the closest point in the new path to our current target
                        let currentTarget = this.path[this.currentPathIndex];
                        let closestIndex = 0;
                        let minDist = Infinity;
                        
                        for (let i = 0; i < path.length; i++) {
                            let dx = path[i].x - currentTarget.x;
                            let dy = path[i].y - currentTarget.y;
                            let dist = Math.sqrt(dx * dx + dy * dy);
                            if (dist < minDist) {
                                minDist = dist;
                                closestIndex = i;
                            }
                        }
                        
                        this.path = path;
                        this.currentPathIndex = closestIndex;
                    } else {
                        this.path = path;
                        this.currentPathIndex = 0;
                    }
                }
            });
        }

        this.easystar.calculate();
        this.followPath();
    }

    followPath() {
        if (!this.path || this.path.length === 0) {
            this.body.setVelocity(0, 0);
            return;
        }

        if (this.currentPathIndex < this.path.length) {
            let nextPoint = { 
                x: this.path[this.currentPathIndex].x * 40, 
                y: this.path[this.currentPathIndex].y * 40 
            };

            this.moveToPoint(nextPoint);

            // Check if reached current target point
            if (Phaser.Math.Distance.Between(this.x, this.y, nextPoint.x + 20, nextPoint.y + 20) < 10) {
                this.currentPathIndex++;
            }
        } else {
            // Reset path index and velocity
            this.currentPathIndex = 0;
            this.body.setVelocity(0, 0);
        }
    }

    moveToPoint(point) {
        const dx = point.x + 20 - this.x; 
        const dy = point.y + 20 - this.y;
        const angle = Math.atan2(dy, dx);
        
        this.body.setVelocity(Math.cos(angle) * this.speed, Math.sin(angle) * this.speed);
        
        // Update animation based on movement direction
        if (Math.abs(dx) > Math.abs(dy)) {
            this.anims.play(dx > 0 ? 'right' : 'left', true);
        } else {
            this.anims.play(dy > 0 ? 'down' : 'up', true);
        }
    }
}

export default AI;
