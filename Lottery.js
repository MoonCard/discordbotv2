class Lottery {
	constructor(date) {
		this.fs = require('fs');
		this.scores = require("./scores.js");
		this.fs.readFile('./Lottery.json', (err, data) => {
			this.data = JSON.parse(data);
		})
		this.fs.readFile('./slotarray.json', (err, data) => {
			this.lottoArray = JSON.parse(data);
		})
	};

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
	getLottoArray() {
		return this.lottoArray
	}
	setLottoArray(string, slot) {
		switch (slot) {
			case '1':
				this.lottoArray['slot1'] = string;
				break;
			case '2':
				this.lottoArray['slot2'] = string;
				break;
			case '3':
				this.lottoArray['slot3'] = string;
				break;
			case '4':
				this.lottoArray['slot4'] = string;
				break
			case '5':
				this.lottoArray['slot5'] = string;
				break;
		}
		this.fs.writeFile('./slotarray.json', JSON.stringify(this.lottoArray), (err) => {})
	}
	spinSlots(message) {
		let roll1 = Math.floor(6 * Math.random());
		let slotroll1;
		let s1 = "";
		let roll2 = Math.floor(6 * Math.random());
		let s2 = "";
		let roll3 = Math.floor(6 * Math.random());
		let s3 = "";
		switch (roll1) {
			case 0:
				{
					s1 = "empty";
					break;
				}
			case 1:
				{
					s1 = this.lottoArray["slot4"];
					break;
				}
			case 2:
				{
					s1 = this.lottoArray["slot2"];
					break;
				}
			case 3:
				{
					s1 = this.lottoArray["slot3"];

					break;
				}
			case 4:
				{
					s1 = this.lottoArray["slot1"];
					break;
				}
			case 5:
				{
					s1 = this.lottoArray["slot5"];
					break;
				}
		}
		switch (roll2) {
			case 0:
				{
					s2 = "empty";
					break;
				}
			case 1:
				{
					s2 = this.lottoArray["slot5"];
					break;
				}
			case 2:
				{
					s2 = this.lottoArray["slot4"];
					break;
				}
			case 3:
				{
					s2 = this.lottoArray["slot3"];
					break;
				}
			case 4:
				{
					s2 = this.lottoArray["slot2"];
					break;
				}
			case 5:
				{
					s2 = this.lottoArray["slot1"];
					break;
				}
		}
		switch (roll3) {
			case 0:
				{
					s3 = "empty";
					break;
				}
			case 1:
				{
					s3 = this.lottoArray["slot1"];
					break;
				}
			case 2:
				{
					s3 = this.lottoArray["slot4"];
					break;
				}
			case 3:
				{
					s3 = this.lottoArray["slot2"];
					break;
				}
			case 4:
				{
					s3 = this.lottoArray["slot5"];
					break;
				}
			case 5:
				{
					s3 = this.lottoArray["slot3"];
					break;
				}
		}
		//output
		message.reply("You spun!: " + s1 + ", " + s2 + ", " + s3 + "\nYou spent one coin!\nYou now have " + this.scores.scoreCache.coins.users[message.author.id].coins + " coins");
		let winType;
		if (s1 == s2 && s2 == s3) {
			switch (s1) {
				case "empty":
					{
						message.reply("You get NOTHING, GOOD DAY SIR!");
						break;
					}
				case this.lottoArray["slot1"]:
					{
						message.reply("You get 10 coins!");
						this.scores.addScores("coins",message.author.id,10);
						break;
					}
				case this.lottoArray["slot2"]:
					{
						message.reply("You get 25 coins!");
						this.scores.addScores("coins",message.author.id,25);
						break;
					}
				case this.lottoArray["slot3"]:
					{
						message.reply("You get 69 coins!");
						this.scores.addScores("coins",message.author.id,69);
						break;
					}
				case this.lottoArray["slot4"]:
					{
						message.reply("You get 100 coins!");
						this.scores.addScores("coins",message.author.id,100);
						break;
					}
				case this.lottoArray["slot5"]:
					{
						message.reply("You get 250 coins!");
						this.scores.addScores("coins",message.author.id,250);
						break;
					}
			}
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
