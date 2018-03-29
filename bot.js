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
var scores = require('./scores.js');
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

//var vc;
var homeChannel;

bot.login(auth.token)

bot.on('ready', () => {
	console.log("Engaged");
	d = new Date();
	console.log(d.getTime());
//	bot.guilds.find("id", "154249297842536448").channels.find("id", "154249298358304770").join().then(connection => {
//		vc = connection;
//	});
	homeChannel = bot.guilds.find("id", "154249297842536448").channels.find("id", "154249297842536448");
});

bot.on("guildMemberSpeaking", (member, speaking) => {
	member.voiceChannel.join().then(voiceConnection => {
		if (voiceConnection != null) {
		let rand = Math.random();
		if (rand < .0005)
			voiceConnection.playFile('./wav/donttalk.wav');
	}});
});

bot.on('message', (message) => {
	cmand.commands(message, message.channel, bot);
});









