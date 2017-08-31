//Austin Kuhlman
//Spring 2017
//31
//Sketch.js

// Keep track of socket connection
var socket; //Socket connection
var myID; //Socket ID

var counter = 0; //Controls Image Spacing
var playerHand = []; //Array of Clients cards
var flipCardImg; //Image to display suit of flipped card
var s, d, h, c, powercat; //Images that can be displayed

var startedGame = false; //Tracks if game has been started
var myPlay = false; //Tells the client if it is their turn
var discard = "notActive"; //Keeps track of if the user has discarded yet


//Load in the images
function preload() {
    s = loadImage("images/s.jpg");
    d = loadImage("images/d.jpg");
    h = loadImage("images/h.jpg");
    c = loadImage("images/c.jpg");
    powercat = loadImage("images/powercat.gif");
}

function setup() {
    //Create Canvas
    createCanvas(750, 500);
    background(0);
    //Settings we want to use
    imageMode(CENTER);
    rectMode(CENTER);
    textAlign(CENTER, CENTER);
    textSize(18);
    //Start game button
    fill(255);
    rect(50, 25, 100, 50);
    fill(0);
    text("Start Game", 50, 25);
    
    // Start a socket connection to the server
    socket = io.connect('http://' + location.host);
    
    //Imediately give myID a value on connection
    socket.on("connect", function () {
        myID = socket.id;
        console.log(myID);
    });
    
    //Recieve initial deck from server
    socket.on("sendDeck", function (deckServer) {
        startedGame = true;
        for (var i = 0; i < deckServer.length; i++) {
            if (deckServer[i].holder === myID) {
                playerHand.push(deckServer[i]);
            }
        }
        //console.log(deck);
        displayCards();
        //console.log(deck);
        socket.emit("flipTopCard");
    });
    
    //Find flipped card after deck has been created
    socket.on("returnFlip", function (flippedCard) {
        //Display flipped card
        if (flippedCard.suit === "s") {
                flipCardImg = s;
            } else if (flippedCard.suit === "d") {
                flipCardImg = d;
            } else if (flippedCard.suit === "h") {
                flipCardImg = h;
            } else if (flippedCard.suit === "c") {
                flipCardImg = c;
            }
        image(flipCardImg, 500, 300, 100, 100);
        fill(150);
        text(flippedCard.number, 500, 300);
        image(powercat, 625, 300, 100, 100);
        //console.log(flipCard);
    });
    
    // Tells the first client in server players array that they are first
    socket.on("goesFirst", function(turnID) {
        //console.log("made it");
        if (turnID === myID) {
            myPlay = true;
            //console.log("Im first");
        }
    });  
    
    // Checks the next players turn after a discard
    socket.on("whoseTurn", function(turnID) {
        if (turnID === myID) {
            myPlay = true;
        }
    });
    
    // Add discard to hand
    socket.on("yourChosenDiscard", function (playerID, card) {
        if (playerID === myID) {
            discard = "active";
            playerHand.push(card);
            displayCards();
        }
    });
    
    // Add deck card to hand
    socket.on("yourChosenDeckCard", function (playerID, card) {
        if (playerID === myID) {
            discard = "active";
            playerHand.push(card);
            displayCards();
        }
    });
    
    // Display the discard
    socket.on("hereIsTheDiscard", function (playerID, discardedCard) {
        var imgFlip;
        if (discardedCard.suit === "s") {
            imgFlip = s;
        } else if (discardedCard.suit === "d") {
            imgFlip = d;
        } else if (discardedCard.suit === "h") {
            imgFlip = h;
        } else if (discardedCard.suit === "c") {
            imgFlip = c;
        }
        
        image(imgFlip, 500, 300, 100, 100);
        //console.log(dsuit + " " + dnumber);
        fill(150);
        text(discardedCard.number, 500, 300);
        
        if (playerID === myID) {
            displayCards();
            socket.emit("nextTurnOrEnd", myID);
        }
    });
    
    //Handle End of Game
    socket.on("endGame", function (playerID) {
        fill(0);
        rect(400, 50, 300, 50);
       if (playerID === myID) {
           fill(83, 20, 147);
           text("You Win!", 350, 350);
           myPlay = false;
       } else {
           fill(83, 20, 147);
           text("You Lost", 350, 350);
       }
    });
    
    // Change who can click buttons
    socket.on("nextTurn", function (playerID, activeID) {
        if (playerID === myID) {
            myPlay = false;
        } else if (activeID === myID) {
            myPlay = true;
        }
    });
    
}//SOCKET.ON MUST BE IN SETUP


function draw() {
    //Cover Start button
    if (startedGame === true) {
        fill(0);
        rect(50, 25, 100, 50);
    }
    //Display if it is your turn
    if (myPlay === true) {
        fill(0);
        rect(400, 50, 300, 50);
        fill(83, 20, 147);
        text("It's Your Turn", 400, 50);
    } else {
        fill(0);
        rect(400, 50, 300, 50);
        fill(83, 20, 147);
        text("Wait for your turn", 400, 50);
    }
}

//Refresh images in player's hand
function displayCards () {
    counter = 0;
    for (var j = 0; j < playerHand.length; j++) {
        if (playerHand.length === 3) {
            fill(0)
            rect(450, 150, 100, 100);
        }
        textSize(24);
        fill(0, 102, 153);
        var playerHandImg;
        if (playerHand[j].suit === "s") {
            playerHandImg = s;
        } else if (playerHand[j].suit === "d") {
            playerHandImg = d;
        } else if (playerHand[j].suit === "h") {
            playerHandImg = h;
        } else if (playerHand[j].suit === "c") {
            playerHandImg = c;
        }
        image(playerHandImg, counter * 100 + 75 + 25 * counter, 150, 100, 100);
        fill(150);
        text(playerHand[j].number, counter * 100 + 75 + 25 * counter, 150);
        counter ++;
    }
}

// Determine what to emit based on where the mouse is pressed
function mousePressed () {
    //Start Game
    if (startedGame === false && mouseX < 100 && mouseY < 50) {
        sendStartGame();
    }
    //On players turn
    if (myPlay === true) {
        //console.log("in mouse pressed");
        //Chooses discard
        if (mouseX < 550 && mouseX > 450 && mouseY < 350 && mouseY > 250) {
            console.log("mousePressed on discard");
            //chosenCard = "discard";
            socket.emit("choseDiscard", myID);
            //playGame(chosenCard);
            //Chooses Deck
        } else if (mouseX < 675 && mouseX > 575 && mouseY < 350 && mouseY > 250) {
            console.log("mousePressed on deck");
            socket.emit("choseDeck", myID);
            //chosenCard = "deck";
            //playGame(chosenCard);
        }
        
        
        //Select which card to discard
        if (discard === "active") {
            if (mouseX < 125 && mouseX > 25 && mouseY < 200 && mouseY > 100) {
                //console.log("inside mP when discard = active");
                socket.emit("thisIsMyDiscard", myID, playerHand[0]);
                discard = "notActive";
                playerHand.splice(0, 1);
            } else if (mouseX < 250 && mouseX > 150 && mouseY < 200 && mouseY > 100) {
                //console.log("inside mP when discard = active");
                socket.emit("thisIsMyDiscard", myID, playerHand[1]);
                discard = "notActive";
                playerHand.splice(1, 1);
            } else if (mouseX < 375 && mouseX > 275 && mouseY < 200 && mouseY > 100) {
                //console.log("inside mP when discard = active");
                socket.emit("thisIsMyDiscard", myID, playerHand[2]);
                discard = "notActive";
                playerHand.splice(2, 1);
            } else if (mouseX < 500 && mouseX > 400 && mouseY < 200 && mouseY > 100) {
                //console.log("inside mP when discard = active");
                socket.emit("thisIsMyDiscard", myID, playerHand[3]);
                discard = "notActive";
                playerHand.splice(3, 1);
            }
        }
    }
}

//Tells the server to start game
function sendStartGame () {
    socket.emit('startGame');
}