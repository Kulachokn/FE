let randomNumber;
let leftRange;
let rightRange;
let guessesCount;
let guessField = document.querySelector('.guessField');

let hint = document.querySelector('.hint');

function initGame() {
    randomNumber = Math.floor(Math.random() * 100) + 1;
    leftRange = 1;
    rightRange = 100;
    guessesCount = 0;
    guessField.value = '';
}

initGame();

function guessNum() {
    let userGuess = Number(guessField.value);
    guessesCount++;
    if (userGuess === randomNumber) {
        hint.textContent = `Поздравляем! Вы за ${guessesCount} попыток угадали число`;
        initGame();
        return;
    }

    if (userGuess > randomNumber) {
        rightRange = userGuess - 1;
    } else {
        leftRange = userGuess + 1;
    }
    hint.textContent = `Угадайте число в диапазоне от ${leftRange} до ${rightRange}`;
}

let button = document.querySelector('.guessSubmit');
button.onclick = guessNum;