class Scores {

	constructor() {
		this.fs = require("fs");
		this.fs.readFile('./scores.json', (err, data) => {
			this.obj = JSON.parse(data);
			this.scoreCache = this.obj;
		});

	}

	init(type, userID) {
		if (type == 'coins') {
			this.scoreCache[type].users[userID] = {
				"coins": 1,
				"lastgot": d.getTime()
			}
			this.fs.writeFileSync('./scores.json', JSON.stringify(this.scoreCache));
		}
		if (type == 'trivia') {
			this.scoreCache[type].users[userID] = {
				"correct": 0
			}
			this.fs.writeFileSync('./scores.json', JSON.stringify(this.scoreCache));
		}
		if (type == 'dice') {
			this.scoreCache[type].users[userID] = {
				"dubs": 1
			}
			this.fs.writeFileSync('./scores.json', JSON.stringify(this.scoreCache));
		}
	}

	addScores(type, userID, increment) {
		if (this.scoreCache[type]) {
			if (this.scoreCache[type].users[userID]) {
				if (type == "dice") {
					this.scoreCache[type].users[userID].dubs = this.scoreCache[type].users[userID].dubs + increment;
					this.fs.writeFileSync('./scores.json', JSON.stringify(this.scoreCache));
				}
				if (type == "trivia") {
					this.scoreCache[type].users[userID].correct = this.scoreCache[type].users[userID].correct + increment;
					this.fs.writeFileSync('./scores.json', JSON.stringify(this.scoreCache));
				}
				if (type == "coins") {
					this.scoreCache[type].users[userID].coins = this.scoreCache[type].users[userID].coins + increment;
					this.scoreCache[type].users[userID].lastgot = new Date().getTime();
					this.fs.writeFileSync('./scores.json', JSON.stringify(this.scoreCache));
					//console.log(this.scoreCache[type].users[userID]);
				}
			}

		}
	}

	decScores(type, userID, decrement) {
		if (this.scoreCache[type]) {
			if (this.scoreCache[type].users[userID]) {
				if (type == "dice") {
					this.scoreCache[type].users[userID].dubs = this.scoreCache[type].users[userID].dubs - decrement;
					this.fs.writeFileSync('./scores.json', JSON.stringify(this.scoreCache));
				}
				if (type == "trivia") {
					this.scoreCache[type].users[userID].correct = this.scoreCache[type].users[userID].correct - decrement;
					this.fs.writeFileSync('./scores.json', JSON.stringify(this.scoreCache));
				}
				if (type == "coins") {
					this.scoreCache[type].users[userID].coins = this.scoreCache[type].users[userID].coins - decrement;
					this.fs.writeFileSync('./scores.json', JSON.stringify(this.scoreCache));
					//console.log(this.scoreCache[type].users[userID]);
				}
			}

		}
	}

	getScores(type, userID) {
		if (this.checkUser(type, userID)) {
			if (type == "coins") {
				return this.scoreCache[type].users[userID].coins
			} else {
				return 0;
			}
		}
	}

	checkUser(type, userID) {
		if (this.scoreCache[type].users[userID] && this.scoreCache) {
			return true;
		} else {
			return false;
		}
	}
}

var s = new Scores();

module.exports = s;
