var glob = require('glob');
var fs = require('fs');
var items = require('./items.json');
const osrs = require('osrs-wrapper');
const osbw = require('osbuddy-api-wrapper');
const api = new osbw({
	cache: {
		// The cache will expire in 15 minutes
		'max-age': 15
	}
});

module.exports = {
	Item: function (id, name) {
		this.name = name;
		this.id = id;
		this.hist = [];
		this.fetchData = async function () {
			let obj = await api.item(this.id)
			this.updateHist();
			this.stashData(obj);
			this.writeData(obj);
		}
		this.stashData = function (data) {
			this.hist.push(data)
		}
		this.writeData = function (obj) {
			if (fs.existsSync("./ge_items/" + this.name + ".json")) {
				let itf = require("./ge_items/" + this.name + ".json");
				itf.push(obj);
			} else {
				fs.writeFile("./ge_items/" + itemName + ".json", this.hist, err => {});
			}
		}
		this.getData = function () {
			this.updateHist();
			return this.hist;
		}
		this.updateHist = function () {
			if (fs.existsSync("./ge_items/" + this.name + ".json")) {
				let itf = require("./ge_items/" + this.name + ".json");
				this.hist = itf;
			} else {
				fs.writeFile("./ge_items/" + itemName + ".json", "[]", err => {});
				this.hist = [];
			}
		}
	},
	getItemName: async function (itemID) {
		let itemName;
		items.forEach(obj => {
			if (obj.id == itemID) {
				itemName = obj.name;
			}
		});
		return itemName;
	},

	getItemID: function (itemName) {
		let id;
		console.log(itemName);
		items.forEach(obj => {
			console.log(obj);
			if (obj.name.toUpperCase == itemName.toUpperCase) {
				id = obj.id;
				return id;
			}
		});
		if (id != undefined) {
			return id;
		} else {
			throw "item not found";
		}
		return;

	},

	getItemObj: async function (itemID) {
		if (Number(itemID) == NaN) {
		    return this
		} else {
			let itemObj = await api.item(itemID);
			return itemObj;
		}
	}

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

async function sortData(args) {
	if (args == "margin") {
		ge.sort(compareMargin);
		await fs.writeFile("randoms.json", JSON.stringify(ge), err => console.log(err));
	}
	if (args == "qtymargin") {
		ge.sort(compareQtyMargin);
		await fs.writeFile("randoms.json", JSON.stringify(ge), err => console.log(err));
	}
}

async function wipe() {
	glob.sync('./ge_items/*.json').forEach(function (file) {
		fs.unlink(path.resolve(file), () => {});
	});
}
