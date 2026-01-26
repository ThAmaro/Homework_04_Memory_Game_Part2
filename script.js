const board = document.getElementById('board');
const movesCounter = document.getElementById('moves-count');
const messageEl = document.getElementById('message');
const resetBtn = document.getElementById('reset');
const difficultySelect = document.getElementById('difficulty');
const timeEl = document.getElementById('time');

let time = 0;
let timerInterval = null;
let rows = 4;
let cols = 4;
let totalPairs = 8;
let cards = [];
let flippedCards = [];
let lockBoard = false;
let moves = 0;
let matches = 0;

const cardsSymbols = ['🍎', '🍌', '🍇', '🍓', '🍍', '🥝', '🍉', '🍒', '🍈', '🍊',
     '🍋', '🍋‍🟩', '🥭', '🍏', '🍑', '🫐', '🍅', '🥥', ];
let symbols = [];

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function createBoard() {
    
    symbols = cardsSymbols.slice(0, totalPairs);
    symbols = [...symbols, ...symbols];
    shuffle(symbols);

    board.innerHTML = '';
    cards = [];
    flippedCards = [];
    lockBoard = false;
    
    for (let i = 0; i < rows * cols; i++) {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.index = i;
        card.dataset.symbol = symbols[i];
        card.innerHTML = `
        <div class="back">?</div>
        <div class="front">${symbols[i]}</div>
        `;
        card.addEventListener('click', flipCard);
        board.appendChild(card);
        cards[i] = card;
    }
}

function flipCard(e) {
    const card = e.currentTarget;
    const index = parseInt(card.dataset.index);

    if (lockBoard || card.classList.contains('matched')) return;

card.classList.add('flipped');
flippedCards.push(card);

    if (flippedCards.length === 2) {
        lockBoard = true;
        moves++;

        updateMoves();
        checkForMatch();
    }
}

function checkForMatch() {
    const [card1, card2] = flippedCards;

    if (card1.dataset.symbol === card2.dataset.symbol) {
        disableCards();
    } else {
        unflipCards();
    }
}

function disableCards() {
    flippedCards.forEach(card => card.classList.add('matched'));
    matches += 2;
    flippedCards = [];
    lockBoard = false;
    checkWin();
}

function unflipCards() {
    setTimeout(() => {
        flippedCards.forEach(card => card.classList.remove('flipped'));
        flippedCards = [];
        lockBoard = false;
    }, 1000);
}

function updateMoves() {
    movesCounter.textContent = moves
}

function checkWin() {
    if (matches === rows * cols) {
        stopTimer();
        setTimeout(() => {
            messageEl.textContent = `Congratulations! You won in ${moves} moves and ${time} seconds!`;
            

        }, 500);
    }
}

function resetGame() {
    moves = 0;
    matches = 0;
    updateMoves();
    messageEl.textContent = '';
    setDifficulty();
    createBoard();
    startTimer();    
}

function setDifficulty() {
    const level = difficultySelect.value;

    if (level === 'easy') {
        rows = 4;
        cols = 4;
        totalPairs = 8;
    } else if (level === 'medium') {
        rows = 6;
        cols = 4;
        totalPairs = 12;
    } else if (level === 'hard') {
        rows = 6;
        cols = 6;
        totalPairs = 18;
    }

    board.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    board.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
}

function startTimer() {
    stopTimer();
    time = 0;
    timeEl.textContent = time;

    timerInterval = setInterval(() => {
        time++;
        timeEl.textContent = time;
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}


setDifficulty();
createBoard();
startTimer();

resetBtn.addEventListener('click', resetGame);
difficultySelect.addEventListener('change', resetGame);
