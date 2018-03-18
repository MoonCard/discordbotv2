const Discord = require('discord.js');
const osrs = require('osrs-wrapper');
const osbw = require('osbuddy-api-wrapper');
const api = new osbw({
	cache: {
		'max-age': 15
	}
});
var d = new Date();
var glob = require('glob');
var path = require('path');
var auth = require('./auth.json');
var scores = require('./scores.json');
var items = require('./items.json');
var fails = require('./fails.json');
var http = require('http');
var fs = require('fs');
var manager = require('./OSRS.js');
var cmand = require('./commands.js');


// Initialize Discord Bot
var bot = new Discord.Client({
	token: auth.token,
	autorun: true
});

glob.sync('./ge_items/*.json').forEach(function (file) {
	require(path.resolve(file));
});

var vc;
var homeChannel;

bot.login(auth.token)

bot.on('ready', () => {
	console.log("Engaged");
	d = new Date();
	console.log(d.getTime());
	bot.guilds.find("id", "154249297842536448").channels.find("id", "154249298358304770").join().then(connection => {
		vc = connection;
	});
	homeChannel = bot.guilds.find("id", "154249297842536448").channels.find("id", "154249297842536448");
});

bot.on('voiceStateUpdate', (oldMember, newMember) => {
	if (newMember.id == '418609664008257558') {
		newMember.voiceChannel.join().then(voiceConnection => vc = voiceConnection);
	}
})

bot.on("guildMemberSpeaking", (member, speaking) => {
	if (vc != null) {
		let rand = Math.random();
		if (rand < .0005)
			vc.playFile('C:/Users/quinc/Downloads/Soundboard/donttalk.wav');
	}
});

bot.on('message', (message) => {
	cmand.commands(message, vc, message.channel, bot);
});


async function item(args) {
	let itemID = await getItemID(args);
	let itemObj = await getItemObj(itemID);
	saveItem(itemObj, itemID);
}

async function getGrid(itmid, itmname) {
	console.log("ITEM ID: " + itmid);
	const sixHoursAgo = new Date();
	sixHoursAgo.setHours(sixHoursAgo.getHours() - 6);
	let obj = {
		id: itmid,
		interval: 30,
		start: sixHoursAgo.getTime()
	}
	api.graph({
		id: itmid,
		interval: 30,
		start: sixHoursAgo.getTime()
	}).then(thing => {
		let string = "Item: " + itmname;
		for (d in thing) {
			string = string + "\nBuying Complete: " + thing[d].buyingCompleted + "";
		}
		homeChannel.send(string);
	});

}

function queryAll() {
	api.names().then(names => {
		saveQuery(names);
	});
}

async function saveItem(itemObj, itemID) {
	let itemName = await getItemName(itemID);
	itemObj.name = itemName;
	itemObj.qTime = d.getTime();
	if (!fs.existsSync("./ge_items/" + itemName + ".json")) {
		fs.writeFile("./ge_items/" + itemName + ".json", "[" + JSON.stringify(itemObj) + "]", err => {});
	} else {
		console.log("already exists");
		let file = require("./ge_items/" + itemName + ".json");
		file.push(itemObj);
		file = removeDuplicates(file);
		fs.writeFile("./ge_items/" + itemName + ".json", JSON.stringify(file), err => {
			if (err != null) console.log(err);
		});
	}
}

async function saveQuery(names) {
	for (j in names) {
		try {
			let itemID = names[j].id;
			let itemName = await getItemName(itemID);
			let itemObj = await getItemObj(itemID);
			let date = new Date();
			itemObj.name = itemName;
			itemObj.qTime = date.getTime();
			if (itemObj['buying-quantity'] == 0 || itemObj['selling-quantity'] == 0) {
				ge.push(itemObj);
			}
			console.log(itemObj.name);
		} catch (error) {
			console.error(error);
			fails.push({
				ID: names[j].id,
				Error: error
			});
			fs.writeFile("fails.json", JSON.stringify(fails), err => {})
		}
	}
	console.log("writing final");
	fs.writeFile("ge.json", JSON.stringify(ge), err => {
		if (err != null) console.log(err);
	});
}

async function getItemName(itemID) {
	let itemName;
	items.forEach(obj => {
		if (obj.id == itemID) {
			itemName = obj.name;
		}
	});
	return itemName;
}

async function getItemID(itemName) {
	let id;
	items.forEach(obj => {
		if (obj.name == itemName) {
			id = obj.id;
		}
	});
	return id;
}

async function getItemObj(itemID) {
	let itemObj;
	await api.item(itemID).then(Obj => itemObj = Obj);
	return itemObj;
}

function compareMargin(a, b) {
	if (a.margin < b.margin) return -1;
	if (a.margin > b.margin) return 1;
	else return 0;
}

function compareQtyMargin(a, b) {
	if ((a['buying-quantity'] - a['selling-quantity']) < (b['buying-quantity'] - b['selling-quantity'])) return -1;
	if ((a['buying-quantity'] - a['selling-quantity']) > (b['buying-quantity'] - b['selling-quantity'])) return 1;
	else return 0;
}
