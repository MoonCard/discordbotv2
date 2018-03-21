var glob = require('glob');
var manager = require('./OSRS.js');
var scores = require('./scores.js');
var fs = require('fs');
var download = require('url-download');
var Trivia = require('./newTrivia.js');
var unirest = require('unirest');
var auth = require('./auth.json');
const osrs = require('osrs-wrapper');
var ge = require('./ge.json');
var lottery = require("./Lottery.js");

module.exports = {
	commands: async function (message, homeChannel, bot) {

		if (message.attachments.array().length > 0) {
			if (scores.checkUser("coins", message.author.id)) {
				if (scores.scoreCache.coins.users[message.author.id].coins > 0) {
					dlFile(message.attachments.array()[0], message.author.id, message);
				} else {
					message.reply("You have 0 coins to spend");
				}
			}
		}
		if (message.content.substring(0, 1) == '!') {

			let args = message.content.substring(1).split(' ');
			let cmd = args[0];
			args = args.splice(1)

			switch (cmd) {
				case 'startLot':
					{
						lottery.startLottery(homeChannel);
						homeChannel.send("Starting Lottery!\nType !enter to win big!");
						break;
					}
				case 'enter':
					{
						lottery.addEntry(homeChannel, message);
						break;
					}
				case 'draw':
					{
						if (message.member.id == "147441910154264576") {
							lottery.drawWinner(homeChannel, bot);
						}
						break;
					}
				case 'loot':
					{
						homeChannel.send(lottery.getEntrys(homeChannel) + " coins in the pot")
						break;
					}
					case 'reset':
					{
						message.member.voiceChannel.join().then(vc => {
							vc.disconnect();
							message.member.voiceChannel.join();
						});
						break;
					}
				case 'getcoin':
					{
						let ID = message.author.id;
						d = new Date();
						if (!scores.checkUser('coins', ID)) {
							scores.init('coins', message.author.id);
							message.reply('You now have 1 coin');
						} else if (d.getTime() > Number(scores.scoreCache.coins.users[message.author.id].lastgot + 3600000)) {
							console.log("giving coin");
							scores.addScores('coins', ID, 1);
							message.reply('You got a coin!\nYou now have ' + scores.scoreCache.coins.users[ID].coins + " coins");
						} else {
							var last = scores.scoreCache.coins.users[ID].lastgot;
							message.reply('You must wait an hour between getting coins.\nTime left: ' + (60 - Math.floor(((d.getTime() - Number(last)) / 60000))) + " minutes");
						}
						break;
					}
				case 'trivtime':
					{
						if (message.member.id == "147441910154264576") {
							message.member.voiceChannel.join().then(vc => {
								vc.playFile('./wav/wah.wav');
								new Trivia(homeChannel, bot);
							})
						}
						break;
					}
				case 'checkem':
					{
						let d1 = Math.floor(Math.random() * 20) + 1;
						let d2 = Math.floor(Math.random() * 20) + 1;
						message.reply('You rolled: ' + d1 + ', ' + d2);
						if (d1 == d2 && scores.scoreCache.dice.users[message.member.id]) {
							scores.addScores("dice", message.author.id, 1)
							message.reply('You have rolled ' + scores.scoreCache.dice.users[message.member.id].dubs + ' dubs')
							message.member.voiceChannel.join().then(vc => {
								vc.playFile('./wav/impressive.wav');
								if (d1 == 1) {
									vc.playFile('./wav/snakeeyes.wav');
								}
							});
						} else if (d1 == d2) {
							scores.init("dice", message.author.id)
							message.member.voiceChannel.join.then(vc => {
								vc.playFile('./wav/impressive.wav');
								message.reply('You have rolled ' + scores.dice.users[message.member.id].dubs + ' dubs')
								if (d1 == 1) {
									vc.playFile('./wav/snakeeyes.wav');
								}
							});
						}
						break;
					}
				case 'kick':
					{
						console.log(bot.voiceConnections);
						if (bot.voiceConnections[message.member.voiceChannelID]) {
							message.member.voiceChannel.disconnect();
						}
						break;
					}
				case 'sb':
					{
						if (message.member.voiceChannel) {
							message.member.voiceChannel.join().then(vc => {
								if (vc != null)
									try {
										vc.playFile('./wav/' + args[0] + '.wav');
									} catch (err) {
										console.log(err);
										homeChannel.send("Couldn't play file");
									}
							});
							break;
						}
					}
				case 'help':
					{
						let mess = "Current SB Commands: \n";
						let temp;
						glob.sync('./wav/*.wav').forEach(function (file) {
							temp = file.split("/");
							temp = temp[temp.length - 1].split(".");
							temp = temp[0];
							mess = mess + temp + "\n";
						});
						message.member.createDM().then(channel => channel.send(mess));
						break;
					}
				case 'qall':
					{
						queryAll();
						break;
					}
				case 'hist':
					{
						let string = args.join(' ');
						osrs.ge.getItem(string).then(itm => {
							getGrid(JSON.parse(itm).item.id, JSON.parse(itm).item.name);
						});
						break;
					}
				case 'cleardata':
					{
						wipe();
						break;
					}
				case 'sortData':
					{
						if (args[0] == "margin") {
							ge.sort(compareMargin);
							fs.writeFile("randoms.json", JSON.stringify(ge), err => console.log(err));
						}
					}
				case 'getData':
					{
						if (args[0] == "high_margin") {
							sortData("margin");
							let mess = "";
							for (t = 0; t < 10; t++) {
								mess = mess + "Name: " + ge[t].name + "\nMargin: " + ge[t].margin + "\n";
							}
							message.reply(mess);
						}
						if (args[0] == "low_margin") {
							sortData("margin");
							let mess = "";
							for (t = ge.length - 1; t > ge.length - 11; t--) {
								mess = mess + "Name: " + ge[t].name + "\nMargin: " + ge[t].margin + "\n";
							}
							message.reply(mess);
						}
						if (args[0] == "low_qtymargin") {
							sortData("qtymargin");
							let mess = "";
							for (t = ge.length - 1; t > ge.length - 11; t--) {
								mess = mess + "\nName: " + ge[t].name + "\nQtyMargin: " + (ge[t]["buying-quantity"] - ge[t]["selling-quantity"]) + "\nMargin: " + ge[t].margin;
							}
							message.reply(mess);
						}
						if (args[0] == "high_qtymargin") {
							sortData("qtymargin");
							let mess = "";
							for (t = 0; t < 10; t++) {
								mess = mess + "\nName: " + ge[t].name + "\nQtyMargin: " + (ge[t]["buying-quantity"] - ge[t]["selling-quantity"]) + "\nMargin: " + ge[t].margin;
							}
							message.reply(mess);
						}
					}
				case 'scores':
					{
						if (args[0] == 'dice') {
							let stri = "";
							for (let i in scores.scoreCache.dice.users) {
								let user = await bot.fetchUser(i);
								stri = stri + "User: " + user.username + " rolled " + scores.scoreCache.dice.users[i].dubs + " dubs\n"
							}
							homeChannel.send(stri);
						}
						if (args[0] == 'trivia') {
							let stri = "";
							for (let i in scores.scoreCache.trivia.users) {
								let user = await bot.fetchUser(i);
								stri = stri + "User: " + user.username + " guessed " + scores.scoreCache.trivia.users[i].correct + " correct\n"
							}
							homeChannel.send(stri);
						}
						if (args[0] == 'coins') {
							let stri = "";
							for (let i in scores.scoreCache.coins.users) {
								let user = await bot.fetchUser(i);
								stri = stri + "User: " + user.username + " has " + scores.scoreCache.coins.users[i].coins + " coins\n"
							}
							homeChannel.send(stri);
						}
						break;
					}
			}
		}
	}
}


function dlFile(messageAttachment, uid, message) {
	console.log('downloading file... ' + messageAttachment.filename);
	let filen = messageAttachment.filename;
	let filet = messageAttachment.filename.split(".");
	filet = filet.splice(1);
	console.log(filet);
	let fileurl = messageAttachment.url;
	if (filet == "wav" || filet == "WAV") {
		download(fileurl, './wav/').on('close', () => {
			scores.decScores("coins", uid, 1);
			message.reply("using coin to upload soundboard file...\nYou now have " + scores.getScores("coins", uid));
			console.log("download complete");
		});
	}
	if (filet == "mp3" || filet == "MP3") {
		download(fileurl, './mp3/').on('close', () => {
			console.log("download complete");
		});
	}
}
