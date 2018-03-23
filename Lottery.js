class Lottery {
	constructor(date) {
		this.fs = require('fs');
		this.scores = require("./scores.js");
		this.fs.readFile('./Lottery.json', (err, data) => {
			this.data = JSON.parse(data);
		})
	}
	startLottery(homeChannel) {
		if (this.data.startDate == "") {
			this.data.startDate = new Date();
			this.fs.writeFile("./Lottery.json", JSON.stringify(this.data), (err) => {});
		} else {
			homeChannel.send("Lottery already started");
		}
	}
	addEntry(homeChannel, message) {
		if (this.data.startDate != "" && this.scores.scoreCache.coins.users[message.author.id].coins > 0) {
			this.data.entrys.push(message.author.id);
			this.scores.decScores("coins", message.author.id, 1);
			message.reply("You have entered the lottery\nThere are " + this.data.entrys.length + " entrys\nYou now have " + this.scores.scoreCache.coins.users[message.author.id].coins + " coins");
			this.fs.writeFile("./Lottery.json", JSON.stringify(this.data), (err) => {});
		} else {
			if (this.data.startDate == "") homeChannel.send("Wait for a lottery to start");
			if (this.scores.scoreCache.coins.users[message.author.id].coins == 0) homeChannel.send("You need a coin to enter!");
		}
	}
	getEntrys() {
		return this.data.entrys.length;
	}
	myEntrys(id) {
		var count = 0;
		for (var i = 0; i < this.data.entrys.length; ++i) {
			if (this.data.entrys[i] == id)
				count++;
		}
		return count;
	}
	drawWinner(homeChannel, bot) {
		//console.log("length:" + this.data.entrys.length)
		if (this.data.entrys[0] != undefined) {
			let rand = Math.floor(Math.random() * this.data.entrys.length);
			//console.log(rand);
			let id = this.data.entrys[rand];
			bot.fetchUser(id).then(name => {
				homeChannel.send(name + " has won!");
				homeChannel.send("You have won " + this.data.entrys.length + " coins!");
				this.scores.addScores("coins", id, this.data.entrys.length)
				this.closeLottery();
			}).catch(err => console.log("name not found!"));
		} else {
			homeChannel.send("There were no entries!");
			this.closeLottery();
		}
	}
	closeLottery() {
		console.log("closing lottery");
		this.data.startDate = "";
		this.data.entrys = [];
		this.fs.writeFile("./Lottery.json", JSON.stringify(this.data), (err) => {
			console.log(err)
		});
	}
	openLottery() {
		if (this.data.startDate != "") return true;
		else return false;
	}
}
var lot = new Lottery();
module.exports = lot;
