import GameScene from './GameScene.js';
// import Preloader from './Preloader.js';

const config = {
    type: Phaser.WEBGL,
    width: 960,
    height: 720,
    backgroundColor: '#2d2d2d',
    parent: 'phaser-example',
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }
        }
    },
    scene:
    [GameScene]
};

new Phaser.Game(config);
