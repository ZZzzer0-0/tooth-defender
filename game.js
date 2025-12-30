const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  backgroundColor: '#e0f7fa',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 400 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let player;
let cursors;
let spaceKey;
let teeth;
let enemies;

function preload() {
  // 使用纯色方块作为占位（无需外部图片）
  this.textures.addRectangle('player', 32, 32, 0x4fc3f7);     // 牙膏战士：蓝色
  this.textures.addRectangle('enemy', 24, 24, 0xf44336);       // 细菌：红色
  this.textures.addRectangle('tooth', 40, 50, 0x4caf50);       // 健康牙齿：绿色
  this.textures.addRectangle('tooth-damaged', 40, 50, 0xf57c00); // 受损牙齿：橙色
}

function create() {
  // 玩家
  player = this.physics.add.sprite(100, 450, 'player');
  player.setBounce(0.2);
  player.setCollideWorldBounds(true);

  // 平台（牙龈地形）
  const platforms = this.physics.add.staticGroup();
  platforms.create(400, 580, 'tooth').setScale(4, 0.5).refreshBody(); // 地面
  platforms.create(600, 400, 'tooth').setScale(1.5, 1);
  platforms.create(150, 300, 'tooth');
  platforms.create(700, 250, 'tooth');

  // 健康牙齿塔（友军）
  teeth = this.physics.add.staticGroup();
  teeth.create(300, 530, 'tooth').setData('health', 100).setOrigin(0.5, 1);
  teeth.create(500, 350, 'tooth-damaged').setData('health', 30).setOrigin(0.5, 1);

  // 敌人：甜食孢子
  enemies = this.physics.add.group({
    key: 'enemy',
    repeat: 6,
    setXY: { x: 200, y: 0, stepX: 120 }
  });
  enemies.children.iterate(child => {
    child.setVelocity(Phaser.Math.Between(-80, 80), 20);
    child.allowGravity = false;
    child.setBounce(1, 1);
    child.setCollideWorldBounds(true);
  });

  // 碰撞
  this.physics.add.collider(player, platforms);
  this.physics.add.collider(enemies, platforms);
  this.physics.add.overlap(player, teeth, repairTooth, null, this);

  // 输入
  cursors = this.input.keyboard.createCursorKeys();
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
}

function repairTooth(player, tooth) {
  if (spaceKey.isDown && tooth.texture.key === 'tooth-damaged') {
    tooth.setTexture('tooth'); // 修复为健康状态
    tooth.setData('health', 100);
    
    // 显示文字反馈
    const text = this.add.text(tooth.x, tooth.y - 40, '🦷 修复成功！', {
      fontSize: '18px',
      fill: '#00695c',
      fontStyle: 'bold'
    });
    this.tweens.add({
      targets: text,
      y: tooth.y - 80,
      alpha: 0,
      duration: 1500,
      onComplete: () => text.destroy()
    });
  }
}

function update() {
  player.setVelocityX(0);
  if (cursors.left.isDown) player.setVelocityX(-180);
  else if (cursors.right.isDown) player.setVelocityX(180);
  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-350);
  }
}

// 启动游戏
new Phaser.Game(config);
