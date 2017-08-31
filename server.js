//Austin Kuhlman
//Spring 2017
//31
//Server.js

//Set up framework
var express = require("express");
var app = express();
var server = app.listen(9000);
app.use(express.static("public"));
console.log("My socket server is running");
var socket = require("socket.io");
var io = socket(server);

var players = []; //Array of players socket ids
var foundCard = false; //Break Loop
var deck = []; //Deck of cards
var turn = 0; //Index of Players array to show whos turn it is
var turnID; //Active player's socket id
var flippedCard; //Top card of discard

//Call newConnection
io.sockets.on("connection", newConnection);

//Where all the events happen
function newConnection(socket) {
    console.log("new connection: " + socket.id);
    players.push(socket.id);
    turnID = players[turn];
    
    //Call startGame
    socket.on("startGame", startGame);
    
    //Flips over top card on deck
    socket.on("flipTopCard", function () {
        console.log("before loop");
        for (var i = 0; i < deck.length; i++) {
            if (foundCard === false && deck[i].holder === "deck") {
                foundCard = true;
                deck[i].holder = "topFlip";
                flippedCard = deck[i];
                io.sockets.emit("returnFlip", flippedCard);
                //console.log("this is the flip:" + flipCard.number + flipCard.suit);
            }
        }
        console.log("after loop");
    foundCard = false;
    });
    
    //Send flipped card to players hand
    socket.on("choseDiscard", function (playerID) {
        flippedCard.holder = playerID;
        for (var i = 0; i < deck.length; i++) {
            if (deck[i].number === flippedCard.number && deck[i].suit === flippedCard.suit) {
                io.sockets.emit("yourChosenDiscard", playerID, deck[i]);
            }
        }
    });
    
    //Send deck card to players hand
    socket.on("choseDeck", function (playerID) {
        for (var i = 0; i < deck.length; i++) {
            if (foundCard === false && deck[i].holder === "deck") {
                foundCard = true;
                deck[i].holder = playerID;
                io.sockets.emit("yourChosenDeckCard", playerID, deck[i]);
                //console.log("this is the flip:" + flipCard.number + flipCard.suit);
            }
        }
        foundCard = false;
    });
    
    //Makes the discard flippedCard
    socket.on("thisIsMyDiscard", function (playerID, card) {
        for (var i = 0; i < deck.length; i++) {
            if (deck[i].number === card.number && deck[i].suit === card.suit) {
                deck[i].holder = "discard";
                flippedCard = deck[i];
                io.sockets.emit("hereIsTheDiscard", playerID, flippedCard);
            }
        }
    });
    
    //Checks hand and if end then completes program
    //If not 31, then next player's turn
    socket.on("nextTurnOrEnd", function (playerID) {
        console.log("nextOrEnd");
        var playersCards = [];
        var playerTotal;
        var turnID;
        for (var i = 0; i < deck.length; i++) {
            if (playerID === deck[i].holder) {
                playersCards.push(deck[i]);
            }
        }
        console.log(playersCards);
        if (playersCards[0].suit === playersCards[1].suit && playersCards[1].suit === playersCards[2].suit) {
            playerTotal = playersCards[0].cardValue + playersCards[1].cardValue + playersCards[2].cardValue;
            console.log(playerTotal);
            if (playerTotal === 31) {
                io.sockets.emit("endGame", playerID);
            } else if (playerTotal != 31){
                turn = turn + 1;
                if (turn === players.length) {
                    turn = 0;
                }
                turnID = players[turn];
                console.log(turnID);
                io.sockets.emit("nextTurn", playerID, turnID);
            }
        } else {
           turn = turn + 1;
            if (turn === players.length) {
                turn = 0;
            }
            turnID = players[turn];
            io.sockets.emit("nextTurn", playerID, turnID); 
        }
    });

} //END OF SOCKET CONNECTION


//Functions for making deck
function createDeck () {
    var suits = ["s", "d", "h", "c"];
    var numbers = ["Ace", "King", "Queen", "Jack", 10, 9, 8, 7, 6, 5, 4, 3, 2];
    
    for (var i = 0; i < suits.length; i++) {
        for (var j = 0; j<numbers.length; j++) {
            var card = {suit: suits[i], number: numbers[j], holder: "deck", cardValue: 0}
            deck.push(card);
        }
    }
    for (var i = 0; i < deck.length; i++) {
        if (deck[i].number <= 10) {
            deck[i].cardValue = deck[i].number;
        } else if (deck[i].number == "Jack" || deck[i].number == "Queen" || deck[i].number == "King") {
            deck[i].cardValue = 10;
        } else if (deck[i].number == "Ace") {
            deck[i].cardValue = 11;
        }
    }
    shuffle(deck);
    deal(deck)
    return deck;
}
function shuffle(a) {
    for (let i = a.length; i; i--) {
        let j = Math.floor(Math.random() * i);
        [a[i - 1], a[j]] = [a[j], a[i - 1]];
    }
}
function deal (a) {
    for (var k = 0; k < players.length; k++) {
        a[k*3].holder = players[k];
        a[k*3+1].holder = players[k];
        a[k*3+2].holder = players[k];
    }
}

//Starts the game
function startGame () {
    var deck = createDeck();
    //console.log(deck);
    io.sockets.emit("sendDeck", deck);
    io.sockets.emit("goesFirst", turnID);
}