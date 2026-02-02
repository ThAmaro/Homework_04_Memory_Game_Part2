const Game_State_Key = 'memory-game-state';
const board = document.getElementById('board');
const movesCounter = document.getElementById('moves-count');
const messageEl = document.getElementById('message');
const resetBtn = document.getElementById('reset');
const difficultySelect = document.getElementById('difficulty');
const totalMovesEl = document.getElementById('total-moves');
const timeEl = document.getElementById('time');
const flipSound = new Audio('flipcard.mp3');
const matchSound = new Audio('correct.mp3');
const winSound = new Audio('victory-shouts.mp3');

flipSound.volume = 0.3;
matchSound.volume = 0.5;
winSound.volume = 0.6;

let timerStarted = false;
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

const cardsSymbols = ['🍎', '🍌', '🍇', '🍓', '🍍', '🥝', '🍉', '🍒', '🍈', '🍊','🍋', '🍋‍🟩', '🥭', '🍏', '🍑', '🫐', '🍅', '🥥', ];
let symbols = [];

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

function createBoard(useSavedSymbols = false) {

    if (!useSavedSymbols) {
        symbols = cardsSymbols.slice(0, totalPairs);
        symbols = [...symbols, ...symbols];
        shuffle(symbols);
    }

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
    
    if(lockBoard) return;
    if(card.classList.contains('flipped')) return;
    if(card.classList.contains('matched')) return;

    if (!timerStarted) {
        startTimer();
        timerStarted = true;
    }


card.classList.add('flipped');
flippedCards.push(card);


flipSound.currentTime = 0;
flipSound.play();

    if (flippedCards.length === 2) {
        lockBoard = true;
        moves++;
        incrementGlobalMoves();
        updateMoves();
        saveGameState();
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
    matchSound.play();
    saveGameState();
    checkWin();
}

function unflipCards() {
    setTimeout(() => {
        flippedCards.forEach(card => card.classList.remove('flipped'));
        flippedCards = [];
        lockBoard = false;
        saveGameState();
    }, 1000);
}

function updateMoves() {
    movesCounter.textContent = moves
}

function checkWin() {
    if (matches === rows * cols) {
        stopTimer();
        setTimeout(() => {
            messageEl.textContent = `Congratulations! You won in ${moves} moves and ${formatTime(time)}!`;
            winSound.play();

        }, 500);
    }
}

function resetGame() {
    sessionStorage.removeItem(Game_State_Key);
    setDifficulty();
    createBoard();
    moves = 0;
    matches = 0;
    updateMoves();
    messageEl.textContent = '';
    stopTimer();
    time = 0;
    timeEl.textContent = formatTime(time);
    timerStarted = false;    
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
    timeEl.textContent = formatTime(time);

    timerInterval = setInterval(() => {
        time++;
        timeEl.textContent = formatTime(time);
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function saveGameState() {
    const state = {
        symbols,
        moves,
        matches,
        time,
        difficulty: difficultySelect.value,
        cardsState: cards.map(card => ({
            flipped: card.classList.contains('flipped'),
            matched: card.classList.contains('matched')
        }))
    };

    sessionStorage.setItem(Game_State_Key, JSON.stringify(state));
}

function loadGameState() {
    const saved = sessionStorage.getItem(Game_State_Key);
    if (!saved) return false;

    const state = JSON.parse(saved);

    difficultySelect.value = state.difficulty;
    setDifficulty();

    symbols = state.symbols;
    moves = state.moves;
    time = state.time;

    createBoard(true);

    state.cardsState.forEach((cardState, index) => {
        if (cardState.flipped) cards[index].classList.add('flipped');
        if (cardState.matched) cards[index].classList.add('matched');
    });

    matches = state.cardsState.filter(c => c.matched).length;

    movesCounter.textContent = moves;
    timeEl.textContent = formatTime(time);

    stopTimer();
    timerStarted = true;

    timerInterval = setInterval(() => {
        time++;
        timeEl.textContent = formatTime(time);
    }, 1000);

    checkWin();

    return true;
}

difficultySelect.addEventListener('change', () => {
    resetGame();
});

function incrementGlobalMoves() {
    let total = Number(localStorage.getItem('totalMoves')) || 0;
    total++;
    localStorage.setItem('totalMoves', total);
}

function updateGlobalMovesDisplay() {
    totalMovesEl.textContent = localStorage.getItem('totalMoves') || 0;
}

window.addEventListener('storage', updateGlobalMovesDisplay);
updateGlobalMovesDisplay();

setDifficulty();
if (!loadGameState()) {
    createBoard();
}

resetBtn.addEventListener('click', resetGame);
