const Discord = require('discord.js');
const Command = require('../bot/Command.js');
const Connection = require('../bot/Connection.js');
const Channel = require('../bot/Channel.js');
const Message = require('../bot/Message.js');
const User = require('../bot/User.js');
const Server = require('../bot/Server.js');

class DiscordJSConnection extends Connection {
  constructor(bot) {
    super(bot, 'discord.js', 'djs');

    this.discord = new Discord.Client();

    if (!this.conf.token) {
      throw new Error('No login token given to discord.js');
    }
  }

  open() {
    this.discord.on('message', this._onMessage.bind(this));
    this.discord.once('ready', () => {
      console.log('[djs] sucessfully logged in'); // eslint-disable-line no-console
    });

    this.discord.login(this.conf.token);
  }

  close() {
    this.discord.off('message', this._onMessage.bind(this));
  }

  mention(target) {
    if (target instanceof User) {
      return `<@${target.id}>`;
    } else if (target instanceof Channel) {
      return `<#${target.id}>`;
    }
  }

  send(target, message) {
    let to;
    if (target instanceof User) {
      to = this.discord.users.find('id', target.id);
    } else if (target instanceof Channel) {
      to = this.discord.channels.find('id', target.id);
    }
    if (!to) {
      throw new Error('[DJS] Unable to find target in caches');
    }

    to.sendMessage(message);
  }

  getPermissionLevel(user, channel) {
    // DM channels always have default perms, even for overlords
    if (channel instanceof User) {
      return Command.PermissionLevels.DEFAULT;
    }

    if (this.conf.overlords) {
      if (this.conf.overlords.includes(user.id)) {
        return Command.PermissionLevels.OVERLORD;
      }
    }

    let guild = this.discord.guilds.find('id', channel.server.id);
    if (!guild) {
      throw new Error('Unable to find guild');
    }
    let member = guild.members.find('id', user.id);
    if (!member) {
      throw new Error('Unable to find user in guild');
    }
    let textChannel = guild.channels.find('id', channel.id);
    if (!textChannel) {
      throw new Error('Unable to find channel in guild');
    }

    let perms = textChannel.permissionsFor(member);
    if (perms && perms.hasPermission('MANAGE_GUILD')) {
      return Command.PermissionLevels.ADMIN;
    }

    return Command.PermissionLevels.DEFAULT;
  }

  _onMessage(message) {
    // Find or create User
    let user = this.userCache.get(message.author.id);
    if (!user) {
      user = new User(this, message.author.username, message.author.id);
      this.userCache.set(user.id, user);
    }

    let channel;
    // Is a standard channel
    if (message.channel instanceof Discord.TextChannel) {
      channel = this.channelCache.get(message.channel.id);
      if (!channel) {
        // Find or create Server
        let server = this.serverCache.get(message.guild.id);
        if (!server) {
          server = new Server(this, message.guild.name, message.guild.id);
          this.serverCache.set(server.id, server);

          // Add a friendly name to the object
          let sConf = server.getConfig();
          sConf.name = message.guild.name;
          server.setConfig(sConf);
        }
        // Create channel now that we have the server
        channel = new Channel(this, server, message.channel.name, message.channel.id);
        this.channelCache.set(channel.id, channel);
      }
    }
    // Message was a DM, do DM things
    else {
      channel = user;

    }

    let isBot = false;
    if (user.id === this.discord.user.id) {
      isBot = true;
    }

    let m = new Message(user, channel, message.content, isBot);
    this.emit('message', m);
  }
}

module.exports = DiscordJSConnection;