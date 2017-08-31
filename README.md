# spring2017project31
Card Game 31 - Spring 2017 Project (Kansas State Polytechnic)

To play the game, have multiple users connect to the IP address of the hosting machine of the node server. 
They will need to connect to port 9000. Do this by typing in the Ip.Add.re.ss:9000
Once you have multiple users connected to this port click start game
The machine will deal 3 cards to each user.
The objective is to get 31 points in the same suit.
Aces - 11 Facecards - 10 numbers - Their value
You can either choose a card from the deck or the top one on discard pile
You must discard to keep 3 cards.
The computer will tell you when it is your turn.
Gameplay will continue until one of the players wins.
The machine will then display to the winner that they have won and to the losers that they have lost.

I used express to create a node server. The connections to the server were handled with socket.io
A socket connection was added everytime a user joined the server. This is how communications took place.

I do believe I can improve this game. In true 31, you can "knock" to see if you have the highest card count.
If you do, you win just the same as if you got 31. 
I could add a chat communication feature which would be fairly simple. 
This would allow the users to have a discussion and speak for when connections were made.

The main resources I used in writing this project were Shiffman's YouTube channel and his Git Repository
https://github.com/CodingTrain/Rainbow-Code
