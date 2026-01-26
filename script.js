const board = document.getElementById('board');

function createBoard() {
    for (let i = 0; i < 16; i++) {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.index = i;
        card.textContent = '?';
        card.addEventListener('click', () => {
            alert('Card ${i}');
        });

        board.appendChild(card);
    }
}

createBoard();