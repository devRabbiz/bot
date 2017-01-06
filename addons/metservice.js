const Discord = require('discord.js');
const ScriptAddon = require('../bot/ScriptAddon.js');
const Command = require('../bot/Command.js');

const request = require('../util').request;

class MetService extends ScriptAddon {
  constructor(bot) {
    super(bot, 'metservice');

    this.weatherCache = new Map();
  }

  init() {
    this.bot.addCommand('metservice', new Command(this.getWeatherData.bind(this), 'nz'));
  }

  deinit() {
    // Do nothing
  }

  getWeatherData(input) {
    input.process()
      // Get the neame of the place
      .then((res) => {
        if (!res) {
          throw 'you must give a place to get the weather of';
        }

        let message = input.message;
        let defConf = this.getConfig('default');
        let servConf;
        if (message.guild) {
          servConf = this.getConfig(message.guild);
        }

        let aliases = new Map();
        if (defConf.aliases) {
          Object.keys(defConf.aliases)
            .forEach((key) => {
              aliases.set(key, defConf.aliases[key]);
            });
        }
        if (servConf && servConf.aliases) {
          Object.keys(defConf.aliases)
            .forEach((key) => {
              aliases.set(key, defConf.aliases[key]);
            });
        }

        // Get the proper place name that the MetService API actually understands
        let name = res;

        if (message.mentions.users && message.mentions.users.length) {
          name = message.mentions.users[0].id;
        }

        if (aliases.has(name)) {
          name = aliases.get(name);
        }

        name = name.toLowerCase().replace(' ', '-');

        return name;
      })
      // Get the weather data
      .then((name) => {
        // Get stuff from the cache if it exists
        if (this.weatherCache.has(name)) {
          return this.weatherCache.get(name);
        }

        return Promise.resolve(`${urlBase}${name}`)
          // .then(request)
          // .then(JSON.parse)
          // .then((res) => {
          //   // Add to cache, so request isn't made for another hour
          //   this.weatherCache.set(name, res);
          //   setTimeout(() => {
          //     this.weatherCache.delete(name);
          //   }, 2*60*60*1000);
          //   return res;
          // });
          // While testing, use a local copy of a request, instead of getting fresh data ll the time
          .then(() => {
            return require('../example-metservice-data.conf.json');
          });
      })
      .then((data) => {
        let today = data.days.shift();
        let name = today.riseSet.location.replace(/ AWS/g, '');

        let embed = new Discord.RichEmbed()
          .setTitle(name)
          .setAuthor('Metservice', 'https://pbs.twimg.com/profile_images/585643069799804928/tSRlnatP.png')
          .setDescription(`**${today.dow}, ${today.date}**\n${today.forecast}\nMax: ${today.max} Min: ${today.min}`);

        this.bot.send(input.message.channel, embed);
        return '';
      });
  }
}

module.exports = MetService;