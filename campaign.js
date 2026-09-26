// ================================
// CAMPAIGN
// ================================

const STARTING_BANKROLL = 500;


// ================================
// LOAD BANKROLL
// ================================

let savedBankroll =
    localStorage.getItem("campaignBankroll");

let bankroll;

if (savedBankroll === null) {

    bankroll = STARTING_BANKROLL;

    localStorage.setItem(
        "campaignBankroll",
        bankroll
    );

}

else {

    bankroll = Number(savedBankroll);

}


// ================================
// TABLES
// ================================

const tables = [

    {
        name: "BEGINNER",
        minBet: 1,
        maxBet: 20,
        entry: 0
    },

    {
        name: "BRONZE",
        minBet: 5,
        maxBet: 100,
        entry: 2500
    },

    {
        name: "SILVER",
        minBet: 25,
        maxBet: 500,
        entry: 12500
    },

    {
        name: "GOLD",
        minBet: 100,
        maxBet: 2000,
        entry: 50000
    },

    {
        name: "PLATINUM",
        minBet: 500,
        maxBet: 10000,
        entry: 250000
    },

    {
        name: "DIAMOND",
        minBet: 2500,
        maxBet: 50000,
        entry: 1250000
    },

    {
        name: "ROYAL",
        minBet: 10000,
        maxBet: 200000,
        entry: 5000000
    },

    {
        name: "PRIVATE",
        minBet: 50000,
        maxBet: 1000000,
        entry: 25000000
    },

    {
        name: "ELITE",
        minBet: 250000,
        maxBet: 5000000,
        entry: 125000000
    },

    {
        name: "GRAND",
        minBet: 1000000,
        maxBet: 20000000,
        entry: 500000000
    },

    {
        name: "IMPERIAL",
        minBet: 5000000,
        maxBet: 100000000,
        entry: 2500000000
    },

    {
        name: "VIP",
        minBet: 25000000,
        maxBet: 500000000,
        entry: 12500000000
    }

];


// ================================
// DISPLAY BANKROLL
// ================================

const bankrollDisplay =
    document.querySelector(".bankroll strong");

bankrollDisplay.textContent =
    "$" + bankroll.toLocaleString();


// ================================
// TABLE UNLOCKING
// ================================

const tableCards =
    document.querySelectorAll(".table-card");

tableCards.forEach(function (card, index) {

    const table = tables[index];

    if (!table) {
        return;
    }


    // ================================
    // UNLOCKED
    // ================================

    if (bankroll >= table.entry) {

        card.classList.remove("locked");

        card.classList.add("unlocked");


        const lockedText =
            card.querySelector(".locked-text");


        if (lockedText) {

            lockedText.textContent = "PLAY";

            lockedText.classList.remove(
                "locked-text"
            );

            lockedText.classList.add(
                "play-button"
            );

        }


        card.addEventListener(
            "click",
            function () {

                sessionStorage.setItem(
                    "gameMode",
                    "campaign"
                );


                sessionStorage.setItem(
                    "selectedTable",
                    JSON.stringify(table)
                );


                window.location.href =
                    "game.html";

            }
        );

    }


    // ================================
    // LOCKED
    // ================================

    else {

        card.classList.remove("unlocked");

        card.classList.add("locked");


        const playButton =
            card.querySelector(".play-button");


        if (playButton) {

            playButton.textContent =
                "🔒 LOCKED";

            playButton.classList.remove(
                "play-button"
            );

            playButton.classList.add(
                "locked-text"
            );

        }

    }

});


// ================================
// RESET CAMPAIGN
// ================================

const resetButton =
    document.getElementById(
        "reset-campaign-button"
    );


resetButton.addEventListener(
    "click",
    function () {

        const confirmed =
            confirm(
                "Are you sure you want to reset your campaign to $500?"
            );


        if (!confirmed) {
            return;
        }


        localStorage.setItem(
            "campaignBankroll",
            STARTING_BANKROLL
        );


        window.location.reload();

    }
);