/*let config = {
    type: Phaser.WEBGL,
    parent: 'phaser-example',
    width: 640,
    height: 480,
    backgroundColor: '#4682B4',
    scene: {
        preload,
        create,
        update
    }
};*/
const UP = 0;
const DOWN = 1; 
const LEFT = 2;
const RIGHT = 3;
let score = 0;
let scoreTest;

let Menu = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function Menu () {

        Phaser.Scene.call(this, { key: 'menu' });
        this.menu;
    },

    preload: function() {
      
        this.load.image('menu', 'static/games/snake/menu.png');
    },

    create: function() {
      
        this.menu = this.add.image(0, 0, 'menu').setOrigin(0);

        this.input.once('pointerdown', function() {
           this.scene.transition({
                target: 'maingame',
                onUpdate: this.transitionOut,
                date: {x: 640, y: 480},
            //game.scene.start('maingame');
            });
        }, this);
    },

    transitionOut: function(progress) {
        this.menu.y = (6000 * progress);
    }

});

let MainGame = new Phaser.Class({

Extends: Phaser.Scene,

initialize:

function MainGame() {
    Phaser.Scene.call(this, { key: 'maingame'});

    let snake,
    food,
    cursors;

    
},

preload: function () {

    this.load.image('food', '/static/games/snake/food.png');
    this.load.image('body', '/static/games/snake/body.png');
    this.load.spritesheet('spritesheet', '/static/games/snake/sprites32.png', {frameWidth: 32, frameHeight: 32});
},

create: function () {

    let Food = new Phaser.Class({
        Extends: Phaser.GameObjects.Image,

        initialize:

        function Food (scene, x, y) {
            Phaser.GameObjects.Image.call(this, scene)

            this.setTexture ('food');
            this.setTint('#F0F8FF');
            this.setPosition(x * 16, y * 16);
            this.setOrigin(0);

            this.total = 0;

            scene.children.add(this);
        },

        eat: function() {
            score++;
            scoreText.setText('Score: '+ score);
            this.total++;
        }
           
    });

    let Snake = new Phaser.Class({

        initialize: 

        function Snake (scene, x, y) {
            this.headPosition = new Phaser.Geom.Point(x, y);
            
            // explain what the heck body is -- because it is nothing but some kind of group() invocation
            this.body = scene.add.group();
            //this.body.setTint('	#F0F8FF');

            //this.head = this.body.create(x * 16, y * 16, 'body');
            this.head = this.body.create(x * 16, y * 16, 'body')
            this.head.setOrigin(0);

            this.alive = true;

            //Smaller is faster
            this.speed = 100;

            this.moveTime = 0;

            this.tail = new Phaser.Geom.Point(x, y);

            this.heading = RIGHT;
            this.direction = RIGHT;
        },

        update: function (time) {

            if (time >= this.moveTime) {
                return this.move(time);
            }
        },

        faceLeft: function () {
            if (this.direction === UP || this.direction === DOWN) {
                this.heading = LEFT;
            }
        },
        
        faceRight: function () {
            if (this.direction === UP || this.direction === DOWN) {
                this.heading = RIGHT;
            }
        },
        
        faceUp: function () {
            if (this.direction === LEFT || this.direction === RIGHT) {
                this.heading = UP;
            }
        },

        faceDown: function () {
            if (this.direction === LEFT || this.direction === RIGHT) {
                this.heading = DOWN;
            }
        },

        move: function (time) {

            switch (this.heading) {
                case LEFT:
                    this.headPosition.x = Phaser.Math.Wrap(this.headPosition.x - 1, 0, 40);
                    break;

                case RIGHT:
                    this.headPosition.x = Phaser.Math.Wrap(this.headPosition.x + 1, 0, 40);
                    break;

                case UP:
                    this.headPosition.y = Phaser.Math.Wrap(this.headPosition.y - 1, 0, 30);
                    break;

                case DOWN:
                    this.headPosition.y = Phaser.Math.Wrap(this.headPosition.y + 1, 0, 30);
                    break;
            }
            this.direction = this.heading;

            Phaser.Actions.ShiftPosition(this.body.getChildren(), this.headPosition.x * 16, this.headPosition.y * 16, 1, this.tail);

            let hitBody = Phaser.Actions.GetFirst(this.body.getChildren(), {x: this.head.x, y: this.head.y}, 1);

            if (hitBody) {
                console.log('dead');

                this.alive = false;


                return false;
            }
            this.moveTime = time + this.speed;

            return true;
        },

        grow: function () {
            let newPart = this.body.create(this.tail.x, this.tail.y, 'body');
            newPart.setOrigin(0);
        },

        collideWithFood: function (food) {
            if (this.head.x === food.x && this.head.y === food.y) {
                this.grow();

                food.eat();

                if (this.speed > 20 && food.total % 5 === 0) {
                    this.speed -= 5;
                }

                return true;

            } else {

                return false;
            }
        },

        updateGrid: function (grid) {
            this.body.children.each(function (segment) {
                let bx = segment.x / 16;
                let by = segment.y / 16;

                grid[by][bx] = false;
            });

            return grid;
        }

        
    });

    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '16px', fill: '#000' });

    food = new Food (this, 3, 4);

    snake = new Snake (this, 8, 8);

    cursors = this.input.keyboard.createCursorKeys();
},

update: function (time, delta) {

    if (!snake.alive) {
        this.game_over();
        return;
    }

    if (cursors.left.isDown) {
        snake.faceLeft();
    } else if (cursors.right.isDown) {
        snake.faceRight();
    } else if (cursors.up.isDown) {
        snake.faceUp();
    } else if (cursors.down.isDown) {
        snake.faceDown();
    }

    if (snake.update(time)) {
        if (snake.collideWithFood(food)) {
            this.repositionFood();
        }
    }
},

repositionFood: function () {
    let testGrid = [];

    for (let y = 0; y < 30; y++) {
        testGrid[y] = [];
        for (let x = 0; x < 40; x++) {
            testGrid[y][x] = true;
        }
    }

    snake.updateGrid(testGrid);

    let validLocations = [];

    for (let y = 0; y < 30; y++) {
        for (let x = 0; x < 40; x++) {
            if (testGrid[y][x] === true) {
                validLocations.push({x, y});
            }
        }
    }

    if (validLocations.length > 0) {
        let pos = Phaser.Math.RND.pick(validLocations);

        food.setPosition(pos.x * 16, pos.y * 16);

        return true;
    }

    else {
        return false;
    }
},

game_over: function() {
    game.scene.start('game_over');
}

});

let GameOver = new Phaser.Class({
    Extends: Phaser.Scene,

    initialize:

    function() {
        Phaser.Scene.call(this, {key: 'game_over'});
    },

    preload: function () {
        this.load.image('gameover', '/static/games/snake/gameover.png');
        this.endScreen;
    },

    create: function () {
        this.endScreen = this.add.image(0, 0, 'gameover').setOrigin(0);
        let finalScoreText = this.add.text(200, 380, `Score: ${score}`, { fontSize: '32px', fill: '#ffffff' });
        this.input.on('pointerdown', function() {
            this.scene.transition({
                 target: 'menu',
                 onUpdate: this.transitionOut,
                 date: {x: 640, y: 480},
             //game.scene.start('maingame');
             });
             game.add.scene(['menu', 'maingame']);
         }, this);
    }
});

let config = {
    type: Phaser.WebGL,
    width: 640,
    height: 480,
    backgroundColor: '#4682B4', //#061f27',
    parent: 'phaser-example',
    scene: [ Menu, MainGame, GameOver ]
};

let game = new Phaser.Game(config);