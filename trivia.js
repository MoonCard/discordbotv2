var auth = require('./auth.json');
var scores = require('./scores.js');
var fs = require('fs');

function Trivia() {
	Trivia.prototype.request = function (callback) {
		unirest.get("https://apifort-trivia-database-v1.p.mashape.com/v1/query/trivia?count=1")
			.header("X-Mashape-Key", auth.mashKey)
			.header("Accept", "application/json")
			.end(function (result) {
				//console.log( result.status, result.headers, result.body);
				callback(result);
			});
	}

	Trivia.prototype.getQ = function (result) {
		let qinfo = result.body.result[0];
		return qinfo.question;
	}
}

function triviaManager(result, homeChannel, bot) {
	let data = result.body.result[0];
	//console.log(result);
	let choices = "";
	for (k in data.chooices) {
		choices = choices + data.chooices[k] + "\n";
	}
	homeChannel.send("TRIVIA TIME!\n" + data.question + "\n\nChoices:\n" + choices);
	var entryUserID = [];
	const filter = function (m){
		return!m.author.bot && m.content == data.answer
	};
	/*{
		if(!m.author.bot){
			console.log(entryUserID + " " + entryUserID.includes(m.author.id));
			7!m.author.bot && m.content == data.answer && !entryUserID.includes(m.author.id);
			   entryUserID.push(m.author.id);
		}
	};*/
	homeChannel.awaitMessages(filter, {
		max: 1,
		time: 30000,
		errors: ['time']
	}).then(collected => {
		//console.log(collected);
		let ary = collected.keyArray()
		for (j in ary) {
			let uid = collected.get(ary[j]).author.id;
			let uname = collected.get(ary[j]).author.username;
			if (data.answer == collected.get(ary[j]).content) {
				homeChannel.send(uname + " has guessed correctly!");
				if (!scores.scoreCache.trivia.users[uid]) {
					scores.scoreCache.trivia.users[uid] = {
						"correct": 1
					}
					fs.writeFile("scores.json", JSON.stringify(scores), err => {});
				} else {
					scores.addScores('trivia',uid,1)//scores.trivia.users[uid].correct = scores.trivia.users[uid].correct + 1;
					homeChannel.send(uname + " now has " + scores.scoreCache.trivia.users[uid].correct + " correct answers!")
					fs.writeFile("scores.json", JSON.stringify(scores), err => {});
				}
			}
			homeChannel.send("The correct answer was: " + data.answer);
		}
	}).catch(collected => {
		homeChannel.send("Nobody got it!");
		homeChannel.send("The correct answer was: " + data.answer);
	});

}

module.exports = {
	"Trivia": Trivia,
	"triviaManager": triviaManager
}
