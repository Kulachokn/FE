let leftRange;
let rightRange;
let attempts;
let randomNumber;
let programGuess = document.querySelector('.programGuess');

let guessesCount = document.querySelector('.guessesCount');

function initGame() {
    if (this.textContent === `Угадал!`) {
        guessesCount.textContent = `Понадобилось ${attempts} попыток`;
        this.textContent = `Загадал!`;

    } else {
        leftRange = 1;
        rightRange = 100;
        attempts = 1;
        guessesCount.textContent = '';
        randomNumber = Math.floor(Math.random() * (rightRange - leftRange)) + leftRange;
        programGuess.textContent = randomNumber;
        this.textContent = `Угадал!`;
    }
}

function giveHint() {
    attempts++;

    if (this.textContent === 'Меньше') {
        rightRange = randomNumber - 1;
    } else {
        leftRange = randomNumber + 1;
    }

    randomNumber = Math.floor(Math.random() * (rightRange - leftRange)) + leftRange;
    programGuess.textContent = randomNumber;
}

let buttonLess = document.querySelector('.button-less');
buttonLess.onclick = giveHint;

let buttonGreater = document.querySelector('.button-greater');
buttonGreater.onclick = giveHint;

let buttonGuess = document.querySelector('.button-guess');
buttonGuess.onclick = initGame;