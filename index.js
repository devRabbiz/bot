/* jslint node: true, esversion: 6 */
'use strict';
var Discordie = require('discordie');
var config = require('./config.json');
var Bot = require('./obj/Bot.js');

var discord = new Discordie();
var bot = new Bot(discord, config);

bot.start();
