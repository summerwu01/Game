const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BLOCK_SIZE = 30;
const COLORS = [
    '#FF0000', // 红色
    '#00FF00', // 绿色
    '#0000FF', // 蓝色
    '#FFFF00', // 黄色
    '#FF00FF', // 品红
    '#00FFFF', // 青色
    '#FFA500'  // 橙色
];

const SHAPES = [
    [[1, 1, 1, 1]], // I型
    [[1, 1], [1, 1]], // O型
    [[1, 1, 1], [0, 1, 0]], // T型
    [[1, 1, 1], [1, 0, 0]], // L型
    [[1, 1, 1], [0, 0, 1]], // J型
    [[1, 1, 0], [0, 1, 1]], // S型
    [[0, 1, 1], [1, 1, 0]]  // Z型
];

let canvas = document.getElementById('game-board');
let ctx = canvas.getContext('2d');
let board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
let currentPiece = null;
let score = 0;
let gameLoop = null;
let gameSpeed = 1000;
let isGameOver = false;

class Piece {
    constructor(shape, color) {
        this.shape = shape;
        this.color = color;
        this.x = Math.floor(BOARD_WIDTH/2) - Math.floor(shape[0].length/2);
        this.y = 0;
    }
}

function createNewPiece() {
    let randomIndex = Math.floor(Math.random() * SHAPES.length);
    return new Piece(SHAPES[randomIndex], COLORS[randomIndex]);
}

function drawBoard() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for(let y = 0; y < BOARD_HEIGHT; y++) {
        for(let x = 0; x < BOARD_WIDTH; x++) {
            if(board[y][x]) {
                ctx.fillStyle = board[y][x];
                ctx.fillRect(x*BLOCK_SIZE, y*BLOCK_SIZE, BLOCK_SIZE-1, BLOCK_SIZE-1);
                
                // 添加方块光泽效果
                ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.fillRect(x*BLOCK_SIZE+2, y*BLOCK_SIZE+2, BLOCK_SIZE-5, BLOCK_SIZE-5);
            }
        }
    }
}

function drawPiece() {
    ctx.fillStyle = currentPiece.color;
    currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if(value) {
                ctx.fillRect(
                    (currentPiece.x + x) * BLOCK_SIZE,
                    (currentPiece.y + y) * BLOCK_SIZE,
                    BLOCK_SIZE-1, 
                    BLOCK_SIZE-1
                );
                
                // 添加下落残影效果
                ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                for(let i = currentPiece.y + y; i < BOARD_HEIGHT; i++) {
                    ctx.fillRect(
                        (currentPiece.x + x) * BLOCK_SIZE,
                        i * BLOCK_SIZE,
                        BLOCK_SIZE-1, 
                        BLOCK_SIZE-1
                    );
                }
                ctx.fillStyle = currentPiece.color;
            }
        });
    });
}

function checkCollision(offsetX, offsetY, shape) {
    return shape.some((row, y) =>
        row.some((value, x) => {
            let newX = currentPiece.x + x + offsetX;
            let newY = currentPiece.y + y + offsetY;
            return value && (
                newX < 0 ||
                newX >= BOARD_WIDTH ||
                newY >= BOARD_HEIGHT ||
                (newY >= 0 && board[newY][newX])
            );
        })
    );
}

function rotatePiece() {
    let newShape = currentPiece.shape[0].map((_, i) =>
        currentPiece.shape.map(row => row[i]).reverse()
    );
    if(!checkCollision(0, 0, newShape)) {
        currentPiece.shape = newShape;
    }
}

function mergePiece() {
    currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if(value) {
                board[currentPiece.y + y][currentPiece.x + x] = currentPiece.color;
            }
        });
    });
}

function clearLines() {
    let linesCleared = 0;
    for(let y = BOARD_HEIGHT - 1; y >= 0; y--) {
        if(board[y].every(cell => cell)) {
            board.splice(y, 1);
            board.unshift(Array(BOARD_WIDTH).fill(0));
            linesCleared++;
            y++;
        }
    }
    if(linesCleared > 0) {
        score += linesCleared * 100;
        document.getElementById('score').textContent = score;
        gameSpeed = Math.max(100, 1000 - score * 0.8);
    }
}

function gameOver() {
    isGameOver = true;
    clearInterval(gameLoop);
    alert(`游戏结束！得分：${score}`);
}

function update() {
    if(!isGameOver) {
        if(!checkCollision(0, 1, currentPiece.shape)) {
            currentPiece.y++;
        } else {
            mergePiece();
            clearLines();
            currentPiece = createNewPiece();
            if(checkCollision(0, 0, currentPiece.shape)) {
                gameOver();
            }
        }
        drawBoard();
        drawPiece();
    }
}

document.getElementById('start-btn').addEventListener('click', () => {
    isGameOver = false;
    score = 0;
    board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
    document.getElementById('score').textContent = '0';
    gameSpeed = 1000;
    currentPiece = createNewPiece();
    if(gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(update, gameSpeed);
});

document.addEventListener('keydown', (e) => {
    if(!isGameOver) {
        switch(e.key) {
            case 'ArrowLeft':
                if(!checkCollision(-1, 0, currentPiece.shape)) currentPiece.x--;
                break;
            case 'ArrowRight':
                if(!checkCollision(1, 0, currentPiece.shape)) currentPiece.x++;
                break;
            case 'ArrowUp':
                rotatePiece();
                break;
            case 'ArrowDown':
                if(!checkCollision(0, 1, currentPiece.shape)) currentPiece.y++;
                break;
        }
        drawBoard();
        drawPiece();
    }
});

// 初始化游戏
currentPiece = createNewPiece();
drawBoard();
drawPiece();