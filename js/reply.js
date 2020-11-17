﻿/*
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
))

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