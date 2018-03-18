class Scores {

	constructor() {
		this.fs = require("fs");
		this.fs.readFile('./scores.json', (err, data) => {
			this.obj = JSON.parse(data);
			this.scoreCache = this.obj;
		});
		
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

	checkUser(type, userID) {
		if (this.scoreCache[type].users[userID] && this.scoreCache) {
			return true;
		} else {
			return false;
		}
	}

	init(type, userID) {
		if (type == 'coins') {
			this.scoreCache[type].users[userID] = {
				"coins": 0,
				"lastgot": d.getTime()
			}
			this.fs.writeFileSync('./scores.json', JSON.stringify(this.scoreCache));
		}
	}
}
var s = new Scores();

module.exports = s;
