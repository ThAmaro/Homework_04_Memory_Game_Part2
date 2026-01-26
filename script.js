const board = document.getElementById('board');
const movesCounter = document.getElementById('moves-count');
const messageEl = document.getElementById('message');
const resetBtn = document.getElementById('reset');

let cards = [];
let flippedCards = [];
let lockBoard = false;
let moves = 0;
let matches = 0;

const cardsSymbols = ['🍎', '🍌', '🍇', '🍓', '🍍', '🥝', '🍉', '🍒'];
let symbols = [];

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function createBoard() {
    
    symbols = [...cardsSymbols, ...cardsSymbols];
    shuffle(symbols);

    board.innerHTML = '';
    cards = [];
    flippedCards = [];
    lockBoard = false;
    
    for (let i = 0; i < 16; i++) {
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
    if (matches === 16) {
        setTimeout(() => {
            messageEl.textContent = `Congratulations! You won in ${moves} moves!`;
        }, 500);
    }
}

function resetGame() {
    moves = 0;
    matches = 0;
    updateMoves();
    messageEl.textContent = '';
    createBoard();
}

resetBtn.addEventListener('click', resetGame);

createBoard();