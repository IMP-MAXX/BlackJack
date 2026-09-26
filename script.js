// ================================
// BLACKJACK GAME
// ================================

const gameMode =
    sessionStorage.getItem("gameMode") || "quickplay";


// ================================
// GAME SETTINGS
// ================================

const QUICK_PLAY_BANKROLL = 500;

let bankroll;
let minBet;
let maxBet;
let tableName;


// ================================
// LOAD GAME MODE
// ================================

if (gameMode === "campaign") {

    const savedBankroll =
        localStorage.getItem("campaignBankroll");

    bankroll = Number(savedBankroll);

    const savedTable =
        sessionStorage.getItem("selectedTable");

    const selectedTable = savedTable
        ? JSON.parse(savedTable)
        : {
            name: "BEGINNER",
            minBet: 1,
            maxBet: 20
        };

    minBet = selectedTable.minBet;
    maxBet = selectedTable.maxBet;
    tableName = selectedTable.name;

} else {

    bankroll = QUICK_PLAY_BANKROLL;

    minBet = 1;
    maxBet = 20;

    tableName = "QUICK PLAY";
}


// ================================
// DOM ELEMENTS
// ================================

const dealerCards =
    document.getElementById("dealer-cards");

const playerCards =
    document.getElementById("player-cards");

const hitButton =
    document.getElementById("hit-button");

const standButton =
    document.getElementById("stand-button");

const newHandButton =
    document.getElementById("new-hand-button");

const dealButton =
    document.getElementById("deal-button");

const clearBetButton =
    document.getElementById("clear-bet-button");

const betInput =
    document.getElementById("bet-input");

const quickBetButtons =
    document.querySelectorAll(".quick-bet-button");

const gameMessage =
    document.getElementById("game-message");

const autoNextHand =
    document.getElementById("auto-next-hand");

const bankrollDisplay =
    document.getElementById("bankroll");

const tableNameDisplay =
    document.getElementById("table-name");

const minBetDisplay =
    document.getElementById("min-bet");

const maxBetDisplay =
    document.getElementById("max-bet");


// ================================
// GAME STATE
// ================================

let deck = [];
let playerHand = [];
let dealerHand = [];

let currentBet = 0;

let handInProgress = false;
let gameOver = false;


// ================================
// MONEY FORMAT
// ================================

function formatMoney(amount) {

    return "$" + amount.toLocaleString("en-US", {
        maximumFractionDigits: 0
    });

}


// ================================
// MONEY DISPLAY
// ================================

function updateMoneyDisplay() {

    bankrollDisplay.textContent =
        formatMoney(bankroll);

    minBetDisplay.textContent =
        formatMoney(minBet);

    maxBetDisplay.textContent =
        formatMoney(maxBet);

    tableNameDisplay.textContent =
        tableName;
}


// ================================
// GET BET
// ================================

function getEnteredBet() {

    const rawValue =
        betInput.value.replace(/[$,\s]/g, "");

    if (rawValue === "") {
        return 0;
    }

    const amount = Number(rawValue);

    if (!Number.isFinite(amount)) {
        return 0;
    }

    return Math.floor(amount);
}


// ================================
// SET BET
// ================================

function setBet(amount) {

    if (handInProgress) {
        return;
    }

    amount = Math.floor(Number(amount));

    if (!Number.isFinite(amount)) {
        amount = 0;
    }

    if (amount < 0) {
        amount = 0;
    }

    if (amount > maxBet) {
        amount = maxBet;
    }

    if (amount > bankroll) {
        amount = bankroll;
    }

    currentBet = amount;

    if (amount === 0) {
        betInput.value = "";
    } else {
        betInput.value =
            amount.toLocaleString("en-US");
    }

    updateButtonState();
}


// ================================
// VALIDATE BET
// ================================

function validateBet() {

    const amount =
        getEnteredBet();

    if (amount === 0) {

        gameMessage.textContent =
            "Enter a bet amount.";

        return false;
    }

    if (amount < minBet) {

        gameMessage.textContent =
            `Minimum bet is ${formatMoney(minBet)}.`;

        return false;
    }

    if (amount > maxBet) {

        gameMessage.textContent =
            `Maximum bet is ${formatMoney(maxBet)}.`;

        return false;
    }

    if (amount > bankroll) {

        gameMessage.textContent =
            "You don't have enough money for that bet.";

        return false;
    }

    currentBet = amount;

    return true;
}


// ================================
// BUTTON STATE
// ================================

function updateButtonState() {

    const amount =
        getEnteredBet();

    dealButton.disabled =
        handInProgress ||
        amount < minBet ||
        amount > maxBet ||
        amount > bankroll;

    hitButton.disabled =
        !handInProgress ||
        gameOver;

    standButton.disabled =
        !handInProgress ||
        gameOver;

    clearBetButton.disabled =
        handInProgress;

    quickBetButtons.forEach(function (button) {

        button.disabled =
            handInProgress;

    });
}


// ================================
// CREATE DECK
// ================================

function createDeck() {

    const suits = [
        "♠",
        "♥",
        "♦",
        "♣"
    ];

    const ranks = [
        "A",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "J",
        "Q",
        "K"
    ];

    const newDeck = [];

    for (const suit of suits) {

        for (const rank of ranks) {

            newDeck.push({
                suit: suit,
                rank: rank
            });

        }

    }

    return newDeck;
}


// ================================
// SHUFFLE
// ================================

function shuffle(cards) {

    for (
        let i = cards.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(Math.random() * (i + 1));

        [
            cards[i],
            cards[j]
        ] = [
            cards[j],
            cards[i]
        ];
    }
}


// ================================
// DRAW CARD
// ================================

function drawCard() {

    if (deck.length === 0) {

        deck = createDeck();

        shuffle(deck);
    }

    return deck.pop();
}


// ================================
// CARD VALUE
// ================================

function getCardValue(card) {

    if (card.rank === "A") {
        return 11;
    }

    if (
        card.rank === "K" ||
        card.rank === "Q" ||
        card.rank === "J"
    ) {
        return 10;
    }

    return Number(card.rank);
}


// ================================
// HAND VALUE
// ================================

function getHandValue(hand) {

    let total = 0;
    let aces = 0;

    for (const card of hand) {

        total += getCardValue(card);

        if (card.rank === "A") {
            aces++;
        }
    }

    while (
        total > 21 &&
        aces > 0
    ) {

        total -= 10;
        aces--;
    }

    return total;
}


// ================================
// SOFT HAND
// ================================

function isSoftHand(hand) {

    let total = 0;
    let aces = 0;

    for (const card of hand) {

        total += getCardValue(card);

        if (card.rank === "A") {
            aces++;
        }
    }

    while (
        total > 21 &&
        aces > 0
    ) {

        total -= 10;
        aces--;
    }

    return aces > 0;
}


// ================================
// BLACKJACK
// ================================

function isBlackjack(hand) {

    return (
        hand.length === 2 &&
        getHandValue(hand) === 21
    );
}


// ================================
// CREATE CARD ELEMENT
// ================================

function createCardElement(card) {

    const cardElement =
        document.createElement("div");

    cardElement.className = "card";

    const cardInner =
        document.createElement("div");

    cardInner.className = "card-inner";

    const front =
        document.createElement("div");

    front.className =
        "card-face card-front";

    const back =
        document.createElement("div");

    back.className =
        "card-face card-back";

    front.textContent =
        card.rank + card.suit;

    if (
        card.suit === "♥" ||
        card.suit === "♦"
    ) {

        front.style.color = "#c62828";
    }

    cardInner.appendChild(front);
    cardInner.appendChild(back);

    cardElement.appendChild(cardInner);

    return cardElement;
}


// ================================
// DISPLAY HANDS
// ================================

function displayHands(hideDealerCard) {

    dealerCards.innerHTML = "";
    playerCards.innerHTML = "";

    dealerHand.forEach(function (card, index) {

        if (
            hideDealerCard &&
            index === 0
        ) {

            const hiddenCard =
                document.createElement("div");

            hiddenCard.className = "card";

            const inner =
                document.createElement("div");

            inner.className =
                "card-inner";

            const back =
                document.createElement("div");

            back.className =
                "card-face card-back";

            inner.appendChild(back);
            hiddenCard.appendChild(inner);

            dealerCards.appendChild(hiddenCard);

        } else {

            dealerCards.appendChild(
                createCardElement(card)
            );

        }

    });

    playerHand.forEach(function (card) {

        playerCards.appendChild(
            createCardElement(card)
        );

    });
}


// ================================
// REVEAL DEALER
// ================================

function revealDealer() {

    dealerCards.innerHTML = "";

    dealerHand.forEach(function (card) {

        dealerCards.appendChild(
            createCardElement(card)
        );

    });
}


// ================================
// SAVE CAMPAIGN BANKROLL
// ================================

function saveCampaignBankroll() {

    if (gameMode !== "campaign") {
        return;
    }

    localStorage.setItem(
        "campaignBankroll",
        bankroll
    );
}


// ================================
// END HAND
// ================================

function endHand(message) {

    handInProgress = false;
    gameOver = true;

    gameMessage.textContent =
        message;

    saveCampaignBankroll();

    updateMoneyDisplay();
    updateButtonState();

    if (
        autoNextHand.checked &&
        bankroll >= minBet
    ) {

        setTimeout(function () {

            currentBet = 0;

            betInput.value = "";

            gameOver = false;

            gameMessage.textContent =
                "Place your next bet.";

            updateButtonState();

        }, 1200);
    }
}


// ================================
// DEAL
// ================================

function startGame() {

    if (!validateBet()) {
        updateButtonState();
        return;
    }

    currentBet =
        getEnteredBet();

    bankroll -= currentBet;

    saveCampaignBankroll();

    updateMoneyDisplay();

    deck = createDeck();

    shuffle(deck);

    playerHand = [];
    dealerHand = [];

    playerHand.push(drawCard());
    dealerHand.push(drawCard());

    playerHand.push(drawCard());
    dealerHand.push(drawCard());

    handInProgress = true;
    gameOver = false;

    displayHands(true);

    gameMessage.textContent =
        "Your move.";

    updateButtonState();

    const playerBlackjack =
        isBlackjack(playerHand);

    const dealerBlackjack =
        isBlackjack(dealerHand);

    if (
        playerBlackjack ||
        dealerBlackjack
    ) {

        revealDealer();

        if (
            playerBlackjack &&
            dealerBlackjack
        ) {

            bankroll += currentBet;

            endHand(
                "Both have Blackjack — Push."
            );

            return;
        }

        if (playerBlackjack) {

            bankroll +=
                currentBet * 2.5;

            endHand(
                "Blackjack! You win 3:2."
            );

            return;
        }

        if (dealerBlackjack) {

            endHand(
                "Dealer has Blackjack."
            );

            return;
        }
    }
}


// ================================
// HIT
// ================================

function hit() {

    if (
        !handInProgress ||
        gameOver
    ) {
        return;
    }

    playerHand.push(
        drawCard()
    );

    displayHands(true);

    const playerValue =
        getHandValue(playerHand);

    if (playerValue > 21) {

        revealDealer();

        endHand(
            `Bust! You lose ${formatMoney(currentBet)}.`
        );

        return;
    }

    if (playerValue === 21) {

        stand();

        return;
    }

    gameMessage.textContent =
        `Your total: ${playerValue}`;
}


// ================================
// DEALER TURN
// ================================

async function dealerTurn() {

    while (true) {

        const dealerValue =
            getHandValue(dealerHand);

        const soft =
            isSoftHand(dealerHand);

        if (
            dealerValue < 17 ||
            (
                dealerValue === 17 &&
                soft
            )
        ) {

            await new Promise(function (resolve) {

                setTimeout(
                    resolve,
                    500
                );

            });

            dealerHand.push(
                drawCard()
            );

            revealDealer();

        } else {

            break;
        }
    }
}


// ================================
// STAND
// ================================

async function stand() {

    if (
        !handInProgress ||
        gameOver
    ) {
        return;
    }

    gameOver = true;

    hitButton.disabled = true;
    standButton.disabled = true;

    revealDealer();

    await dealerTurn();

    const playerValue =
        getHandValue(playerHand);

    const dealerValue =
        getHandValue(dealerHand);

    if (dealerValue > 21) {

        bankroll +=
            currentBet * 2;

        endHand(
            `Dealer busts! You win ${formatMoney(currentBet)}.`
        );

        return;
    }

    if (playerValue > dealerValue) {

        bankroll +=
            currentBet * 2;

        endHand(
            `You win ${formatMoney(currentBet)}!`
        );

        return;
    }

    if (playerValue < dealerValue) {

        endHand(
            `Dealer wins. You lose ${formatMoney(currentBet)}.`
        );

        return;
    }

    bankroll += currentBet;

    endHand(
        "Push — your bet is returned."
    );
}


// ================================
// NEW HAND
// ================================

function newHand() {

    if (handInProgress) {
        return;
    }

    currentBet = 0;

    betInput.value = "";

    playerHand = [];
    dealerHand = [];

    dealerCards.innerHTML = "";
    playerCards.innerHTML = "";

    gameOver = false;

    if (bankroll < minBet) {

        gameMessage.textContent =
            "You don't have enough money to play this table.";

    } else {

        gameMessage.textContent =
            "Place your bet.";
    }

    updateMoneyDisplay();
    updateButtonState();
}


// ================================
// QUICK BET BUTTONS
// ================================

quickBetButtons.forEach(function (button) {

    button.addEventListener(
        "click",
        function () {

            if (handInProgress) {
                return;
            }

            const type =
                button.dataset.betType;

            let amount = 0;

            if (type === "min") {

                amount = minBet;

            } else if (type === "quarter") {

                amount =
                    Math.floor(maxBet * 0.25);

            } else if (type === "half") {

                amount =
                    Math.floor(maxBet * 0.50);

            } else if (type === "three-quarter") {

                amount =
                    Math.floor(maxBet * 0.75);

            } else if (type === "max") {

                amount = maxBet;

            } else {

                return;
            }

            amount =
                Math.max(amount, minBet);

            amount =
                Math.min(amount, bankroll);

            setBet(amount);

        }
    );

});


// ================================
// CLEAR BET
// ================================

clearBetButton.addEventListener(
    "click",
    function () {

        setBet(0);

        gameMessage.textContent =
            "Place your bet.";

    }
);


// ================================
// BET INPUT
// ================================

betInput.addEventListener(
    "input",
    function () {

        const cleaned =
            betInput.value.replace(
                /[^\d]/g,
                ""
            );

        if (cleaned === "") {

            currentBet = 0;

            updateButtonState();

            return;
        }

        let amount =
            Number(cleaned);

        if (!Number.isFinite(amount)) {

            betInput.value = "";

            currentBet = 0;

            updateButtonState();

            return;
        }

        amount =
            Math.min(
                amount,
                maxBet
            );

        betInput.value =
            amount.toLocaleString("en-US");

        currentBet = amount;

        updateButtonState();

    }
);


// ================================
// ENTER TO DEAL
// ================================

betInput.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Enter" &&
            !dealButton.disabled
        ) {

            startGame();
        }

    }
);


// ================================
// BUTTON EVENTS
// ================================

dealButton.addEventListener(
    "click",
    startGame
);

hitButton.addEventListener(
    "click",
    hit
);

standButton.addEventListener(
    "click",
    stand
);

newHandButton.addEventListener(
    "click",
    newHand
);


// ================================
// KEYBOARD SHORTCUTS
// ================================

document.addEventListener(
    "keydown",
    function (event) {

        if (
            document.activeElement === betInput
        ) {
            return;
        }

        if (event.key === "1") {

            hit();

        } else if (event.key === "2") {

            stand();

        } else if (event.key === "3") {

            newHand();

        }

    }
);


// ================================
// INITIALIZE
// ================================

updateMoneyDisplay();
updateButtonState();

if (bankroll < minBet) {

    gameMessage.textContent =
        "You don't have enough money to play this table.";

} else {

    gameMessage.textContent =
        "Place your bet.";
}