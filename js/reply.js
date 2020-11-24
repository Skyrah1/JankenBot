/*
MIT License

Copyright (c) 2020 Skyrah1

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
*/

const commandLib = require("./command");

var botClient;
var message;
var messageString = "";

// This list is meant to contain any and all Commands that give
// your Discord bot functionality.
// Push your Commands into this list.
const validCommands = [];


const rock = `🪨`
const paper = `📰`
const scissors = `✂️`
const activeGames = {};
const queue = {};
const winners = [];
let tournamentActive = false;

//-----------Commands-----------//

validCommands.push(new commandLib.Command(
    "helloWorld",
    "A simple 'Hello World' command.",
    () => {
        messageString = "Hello World!\n";
        message.channel.send(messageString);
        return true;
    }
));

validCommands.push(new commandLib.Command(
    "testPingReply",
    "Do I see you?",
    () => {
        messageString = `I see you, ${message.author.toString()}.`;
        message.channel.send(messageString);
        return true;
    }
));

validCommands.push(new commandLib.Command(
    "cat",
    "Displays an image of a cat",
    () => {
        sendImage("Have a cute public domain cat.\n"
        + "Image source: https://www.publicdomainpictures.net/en/view-image.php?image=161619&picture=cat-in-suitcase",
        "https://www.publicdomainpictures.net/pictures/170000/velka/cat-in-suitcase.jpg");
        return true;
    }
));

validCommands.push(new commandLib.Command(
    "startGame",
    "",
    async () => {
        let players = message.mentions.users.array();
        if (players.length != 2){
            console.log(players);
            message.channel.send("Please start a game mentioning only 2 players (that's how Rock Paper Scissors works!)");
        } else {
            //TSUNOMAKI TSUNOMAKI TSUNOMAKI TSUNOMAKI
            //TSU-NO-MA-KI-JAN-KEN-PON!!!!
            await startGame(players).then(winner => {
                if (winner != null){
                    message.channel.send(`${players[0]} and ${players[1]} have competed. The winner is ${winner}!`);
                } else {
                    message.channel.send(`${players[0]} and ${players[1]} have drawed!`);
                }
            });
            
        }
        return true;
    }
));

validCommands.push(new commandLib.Command(
    "queue",
    "",
    () => {
        let players = message.mentions.users.array();
        let str = "Adding players...\n\n";
        for (let i = 0; i < players.length; i++){
            let added = addToQueue(players[i]);
            if (added){
                str += `Added ${players[i]}!\n`;
            }
        }
        if (players.length == 0){
            str += "No players to be added to the queue."
        }
        message.channel.send(str);
        return true;
    }
));

validCommands.push(new commandLib.Command(
    "startTournament",
    "",
    async () => {
        winner = await startTournament(message.channel);
        queue[winner] = false;
        message.channel.send(`The winner is ${message.channel.members.get(winner)}! Congratulations!!!!`);
        return true;
    }
));

function addToQueue(player){
    if (!tournamentActive && (!queue.hasOwnProperty(player.id) || !queue[player.id])){
        queue[player.id] = true;
        player.send("You have been added to the queue.");
        return true;
    } else if (tournamentActive){
        player.send("Sorry, but the tournament is already active.");
        return false;
    } else {
        player.send("You're already registered, so sit back and relax!");
        return false;
    }
    
}

async function startRound(players, isTournament, gameId){
    console.log("ROUND START");
    let points = [0, 0];
    let round = 1;
    let winMessage = `You win Round ${round}!`
    let loseMessage = `You lose Round ${round}!`
    let winIndex;
    let loseIndex;
    while (points[0] < 2 && points[1] < 2){
        console.log(`Round ${round}\n`);
        let winner = await startGame(players);
        if (winner != null){
            winIndex = players.indexOf(winner);
            loseIndex = 1 - winIndex;
            points[winIndex]++;
            await players[winIndex].send(winMessage + `\n\nYou have ${points[winIndex]} points, while ${players[loseIndex]} has ${points[loseIndex]} points.`);
            await players[loseIndex].send(loseMessage + `\n\nYou have ${points[loseIndex]} points, while ${players[winIndex]} has ${points[winIndex]} points.`);
        } else {
            for (let i = 0; i < players.length; i++){
                await players[i].send("You have both drawn this round!");
            }
        }
        

        round++;
    }

    finalWinMessage = `You have won this round!!!!`;
    finalLoseMessage = `Sorry, but it looks like you've lost...`;
    players[winIndex].send(finalWinMessage);
    players[loseIndex].send(finalLoseMessage);

    if (isTournament){
        activeGames[gameId] = true;
    }

    return players[winIndex];
}

function waitFor(conditionFunc){
    const poll = resolve => {
        if (conditionFunc()) {
            resolve();
            console.log("yay");
        } else {
            //console.log(Object.values(activeGames).filter(v => v !== true));
            console.log("waiting");
            setTimeout(_ => poll(resolve), 1000);
        }
    }
    return new Promise(poll);
}

async function startTournament(channel){
    let gameId = 0;
    tournamentActive = true;
    while (Object.keys(queue).filter(player => queue[player]).length > 1){
        let remaining = Object.keys(queue).filter(player => queue[player]);
        messageStr = "Remaining players:\n";
        for(let i = 0; i < remaining.length; i++){
            messageStr += `${remaining[i]}\n`
        }
        channel.send(messageStr);

        
        // handle the case if the queue length is odd here
        if (remaining.length % 2 != 0){
            let waiting = Object.keys(queue).filter(player => queue[player]);
            let rand = Math.floor(Math.random() * waiting.length);
            winners.push(waiting[rand]);
            console.log(waiting[rand]);
            channel.members.get(waiting[rand]).send("You got lucky this round and don't need to compete! Use this time to get ready for the next round!");
            queue[waiting[rand]] = false;
        }

        // move everyone in queue to activeGames
        let waiting = Object.keys(queue).filter(player => queue[player]);
        console.log("Waiting players: \n");
        console.log(waiting);
        while (waiting.length > 0){
            let players = [];
            console.log(channel.members);
            players.push(channel.members.get(waiting.pop())["user"]);
            players.push(channel.members.get(waiting.pop())["user"]);
            console.log(players);
            queue[players[0].id] = false;
            queue[players[1].id] = false;
            console.log(queue);
            activeGames[gameId] = players;
            gameId++;
        }

        // start games and move people who win the games to winners
        //let keys = Object.keys(activeGames);
        for (let i = Object.keys(activeGames).length - 1; i >= 0; i--){
            console.log(`${i}, ${activeGames[i]}\n`);
            if (activeGames[i] !== true){
                startRound(activeGames[i], true, i).then(winner => {
                   winners.push(winner.id);
                   console.log(`${winner.id} won a game.`);
                });
            }
            
        }
        gameId = 0;
        
        console.log("Waiting for games to finish...");
        console.log(activeGames);
        // once activeGames is empty, move winners to queue
        await waitFor(_ => Object.values(activeGames).filter(v => v !== true).length == 0);
        console.log("Done!");
        while (winners.length > 0){
            queue[winners.pop()] = true;
        }
    }

    // return the final winner
    tournamentActive = false;
    return Object.keys(queue).filter(player => queue[player]).pop();
}

async function startGame(players){
    var winner;
    promise1 = getResult(players[0], players[1]);
    promise2 = getResult(players[1], players[0]);
    await Promise.all([promise1, promise2]).then((results) => {
        winner = decideWinner(players[0], players[1], results[0], results[1]);
    });
    return winner;
}

function decideWinner(player1, player2, result1, result2){
    if ((result1 == rock && result2 == paper)
    || (result1 == paper && result2 == scissors)
    || (result1 == scissors && result2 == rock)){
        return player2;
    } else if ((result1 == rock && result2 == scissors)
    || (result1 == paper && result2 == rock)
    || (result1 == scissors && result2 == paper)){
        return player1;
    } else {
        return null;
    }
}

async function getResult(player, opponent){
    
    result = "";
    
    try {
        await player.send(`You're playing against ${opponent.tag}! Choose something to play by reacting to this message!`)
        .then(async function (message) {
            try {
                const filter = (reaction, user) => {
	                return [rock, paper, scissors].includes(reaction.emoji.name) && user.id != message.author.id;
                };
                await message.react(rock);
                await message.react(paper);
                await message.react(scissors);
                await message.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
	            .then(collected => {
                    try {
                        result = collected.first().emoji.name;
                    } catch (e){
                        console.log("lol");
                    }
		            
	            })
            } catch (e){
                console.log("help");
            }
            
        })
    } catch (e){
        console.log(rock + ", " + paper + ", " + scissors);
    }
    return result;
}

validCommands.push(new commandLib.Command(
    "help",
    "I mean...you're using it right now, so...",
    () => {
        let pm = "Here's the list of commands:\n";
        //pm += "```";
        for (let i in validCommands){
            pm += `\n**${validCommands[i].getKeyword()}** - ${validCommands[i].getDescription()}`;
        }
        //pm += "\n```";
        message.author.send(pm);
        messageString = "Alright, I've sent you the list of my commands.";
        message.channel.send(messageString);
        return true;
    }
));

//-----------End of commands-----------//

// This is the function used to execute commands, which is called by
// client.on("message") in bot.js
function reply(prefix, client, msg) {
    message = msg;
    messageString = "";
    botClient = client;
    var validMessage = false;
    var commandKeyword = msg.content.replace(prefix, "")
        .split(" ")[0];
    var args = msg.content.replace(prefix, "")
        .replace(commandKeyword + " ", "")
        .split(" ");

    console.log(`Arguments: ${args}`);
    console.log(commandKeyword);
    console.log(args.toString());

    for (i = 0; i < validCommands.length && !validMessage; i++) {
        validMessage = validCommands[i].execute(commandKeyword, args);
    }

    if (validMessage) {
        console.log("----------------------------------------");
        console.log(messageString);
        console.log("----------------------------------------");
    }
    return validMessage;
}

// This function is used to send an image to the Discord server,
// along with a message string.
function sendImage(string, image){
    message.channel.send(`${string}\n`, {
        files: [image]
    });
}



module.exports = {
    reply
};