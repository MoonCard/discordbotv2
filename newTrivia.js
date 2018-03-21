var unirest = require('unirest');
var scores = require('./scores.js');
var auth = require('./auth.json');

module.exports = class Trivia {
	constructor(homeChannel, bot) {
		this.setUp(homeChannel, bot);
	}

	setUp(homeChannel, bot) {
		this.getResult().then(res => {
			console.log(res.body.result);
			this.triviaManager(homeChannel, bot, res.body.result[0]);
		}).catch(() => {})
	}

	getResult() {
		return new Promise(async (resolve, reject) => {
			await unirest.get("https://apifort-trivia-database-v1.p.mashape.com/v1/query/trivia?count=1")
				.header("X-Mashape-Key", auth.mashKey)
				.header("Accept", "application/json")
				.end(function (result) {
					//console.log(result.status, result.headers, result.body);
					//console.log(result.body);
					if (result) {
						resolve(result);
					} else {
						reject("invalid server response");
					}
				});
		});
	}

	triviaManager(homeChannel, bot, res) {
		homeChannel.send("TRIVIA TIME!\n");
		var choices = "";
		for (let k in res.chooices) {
			choices = choices + res.chooices[k] + "\n";
		}
		setTimeout(function () {
			homeChannel.send(res.question + "\n\nChoices:\n" + choices);
			let userEntry = [];
			const filter = function (m) {
				let test = true;
				if(userEntry.includes(m.author.id)){
					test = false;
				}
				userEntry.push(m.author.id);
				return !m.author.bot && m.content == res.answer && test
			};
			homeChannel.awaitMessages(filter, {
				max: 1,
				time: 30000,
				errors: ['time']
			}).then(collected => {
				let ary = collected.keyArray();
				for (let j in ary) {
					let uid = collected.get(ary[j]).author.id;
					let uname = collected.get(ary[j]).author.username;
					homeChannel.send(uname + " has guessed correctly!");
					if (!scores.scoreCache.trivia.users[uid]) {
						scores.init("trivia", uid);
					}else{
						scores.addScores('trivia', uid, 1);
						homeChannel.send(uname + " now has " + scores.scoreCache.trivia.users[uid].correct + " correct answers!")
					}
				}
				homeChannel.send("The correct answer was: " + res.answer);
			}).catch((collected) => {
				console.log(collected);
				homeChannel.send("Nobody got it!");
				homeChannel.send("The correct answer was: " + res.answer);
			});

		}, 3000);



	}

}
