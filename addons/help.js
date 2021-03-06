const Discord = require('discord.js');

const ScriptAddon = require('../bot/ScriptAddon.js');
const Command = require('../bot/Command.js');
const {Override} = require('../bot/Input.js');
const Result = require('../bot/Result.js');
const ReAction = Result.ReAction;

const package = require('../package.json');

const defaultHelp = {
  text: [
    'secret_bot *help*',
    `secret_bot v${package.version} - ${package.versionName}`,
    '',
    'for a list of available commands, use `~commands` in the server you want a list for',
    'help for individual commands can be found by using `~help <command>`',
    '',
    'secret_bot is written by secret_online'
  ],
  actions: [
    {emoji: 'mag_right', desc: 'view the source code for secret_bot', action: '~source'},
    {emoji: 'closed_book', desc: 'view a list of help topics', action: '~help topic'},
    {emoji: 'robot_face', desc: 'add secret_bot to your server', action: '~bot-invite'}
  ]
};
const helpHelp = [
  'syntax: `~help [command]`',
  'finds help for the given command',
  'extra info about bot is available through the help topics `~help topic`',
  'for a list of all commands, use `~commands`',
  'for all commands in an addon, use `~commands <group>`',
  'to find out which addon a command is in, use `~which <command>`'
];
const whichHelp = [
  'syntax: `~which <command>`',
  'alows you to find out which addon a command belongs to',
  'for more information about addons, use `~help topic addons`',
  'example usage:',
  '`~which which`'
];

const topics = {
  help: [
    'secret_bot has support for commands to provide help and usage information',
    '',
    'help is accessed by using `~help [command]`',
    'e.g. `~help help`, `~help topic help`',
    '',
    'in example commands, the angled `<>` brackets mean that this argument is required, while square `[]` brackets mean it\'s optional',
    'for example `~help` can take an argument (the name of a command), but doesn\'t need one, so is written like `~help [command]`',
    '`~which` requires an argument, so is written as `~which <command>` in the help'
  ],
  addons: {
    text: [
      'addons are groups of commands',
      'the main benefit of this is for server admins, who can enable and disable addons, instead of having to enable/disable individual commands',
      'you can get a list of all commands in an addon by using `~commands <addon>`',
      'to find out which addon adds a particular command, use `~which <command>`. e.g. `~which source` will reply with `core`, because `~source` is addec by the "core" addon',
      '',
      'it is possible for two different commands to have the same name, but come from different addons',
      'this generally only happens if the server owner uses `~add-command` to greate a command with the same name as an existing command',
      'in this situation, you need to add the name of the addon followed by a dot (`.`)',
      'e.g.: `~faces.lenny`, `~this.lenny`',
      '',
      'each server has a hidden addon (the server\'s ID) which can be used with the `this` keyword',
      'it is mainly used by the `custom` addon, which allows custom commands',
      'this ensures that custom commands will always work on the server they were created on'
    ],
    actions: [
      {emoji: 'pencil', desc: 'see `commands` help topic', action: '~help topic commands'}
    ]
  },
  commands: {
    text: [
      'commands form the base of secret_bot',
      'if you wanted a list of all commands available, use `~commands`. note that the result may be different depending on which server you type it in',
      '',
      'the first \'word\' of a message must be a valid command in order for secret_bot to process it',
      '',
      'commands are made of three parts: the prefix, the trigger, and arguments',
      'prefixes and triggers are explained in thir own topics: `prefixes` and `triggers`',
      'the arguments for a command are any text that follows',
      'for example `~flip upside down` has the arguments `upside` and `down`',
      'what a command does with the arguments it is given is up to that command',
      '',
      'many commands feature recursive processing. more can be read on that in the `recursive` topic'
    ],
    actions: [
      {emoji: 'page_facing_up', desc: 'view a list of commands avaialable in secret_bot', action: '~commands'},
      {emoji: 'arrows_counterclockwise', desc: 'see `recursive` help topic', action: '~help topic recursive'},
      {emoji: 'abc', desc: 'see `addons` help topic', action: '~help topic addons'}
    ]
  },
  triggers: {
    text: [
      'no, not that type of triggers',
      'in secret_bot, the trigger is the part of a command that says which command this is',
      'as an example, in `~help` the trigger is `help`',
      'some commands ask you to give a trigger. `~help`, for example, will give more specific help if you give it a trigger'
    ],
    actions: [
      {emoji: 'page_facing_up', desc: 'view a list of commands avaialable in secret_bot', action: '~commands'},
      {emoji: 'pencil', desc: 'see `commands` help topic', action: '~help topic commands'}
    ]
  },
  prefixes: {
    text: [
      'the prefix is the part of a command before the trigger. usually it is a single character',
      'by default it is a tilde `~`, but it can be changed per server with `~change-prefix`',
      'throughout the help, the tilde is used to denote a command, for example `~help topic prefixes`'
    ],
    actions: [
      {emoji: 'pencil', desc: 'see `commands` help topic', action: '~help topic commands'}
    ]
  },
  recursive: [
    'secret_bot features recursive command processing',
    'that means the output from one command can be used as the arguments for another',
    'for example, `~flip ~fliptable`',
    '`~fliptable` returns a unicode emote. this is then given to `~flip` to turn upside down',
    'as shown in that example, commands work from right to left, processing the \'last\' command in a message, finally making its way down to the first'
  ],
  using: {
    text: [
      'this section is about using secret_bot on your own servers',
      '',
      '**Discord**',
      'adding secret_bot to a Discord server is extremely easy',
      'first, you must have the \'Manage Server\' permission on the server',
      'then type `~bot-invite` to get the invite link',
      'follow the link, and select the server in the dropdown box',
      'done! secret_bot should now appear in you server\'s user list. it doesn\'t require any further setup, it will work right away',
      'more information can be found on GitHub. use `~source` to go there'
    ],
    actions: [
      {emoji: 'robot_face', desc: 'get the invite link for secret_bot', action: '~bot-invite'},
      {emoji: 'mag_right', desc: 'view the source code for secret_bot', action: '~source'}
    ]
  }
};
const noTopic = {
  text: [
    'secret_bot *help topic*',
    '',
    'topic not found'
  ],
  actions: [
    {emoji: 'closed_book', desc: 'view a list of help topics', action: '~help topic'}
  ]
};
const noCommand = {
  text: [
    'secret_bot *help*',
    '',
    'command not found'
  ],
  actions: [
    {emoji: 'closed_book', desc: 'view a list of commands', action: '~commands'}
  ]
};

const splitWordsLengthRegex = /(?:(.{1,500})(?:, |$))/g;

class Help extends ScriptAddon {
  constructor(bot) {
    super(bot, 'help');

    this.desc = 'An essential addon that provides a way to access the help for each command';
  }

  init() {
    this.addCommand('commands', this.getCommands, this.getCommands);
    this.addCommand('help', this.getHelp, helpHelp);
    this.addCommand('which', this.getWhich, whichHelp);
  }

  getWhich(input) {
    let prefix = this.bot.getConfig('default').prefix;
    let channel = input.message.channel;

    if (channel instanceof Discord.TextChannel) {
      let serverConf = this.bot.getConfig(input.message.guild);
      if (serverConf.prefix) {
        prefix = serverConf.prefix;
      }
    }

    let escapedPrefix = prefix.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
    let match = input.text.match(new RegExp(`^${escapedPrefix}(.+)`));
    let unprefixed = input.text;
    if (match) {
      unprefixed = match[1];
    }

    match = unprefixed.match(/^this\.(.*)/);
    let secretGroup = '';
    if (match) {
      secretGroup = channel.guild.id;
      unprefixed = match[1];
    }

    let comm = this.bot.getCommand(`${prefix}${secretGroup}${unprefixed}`, input.message);
    if (comm) {
      let group = comm.addon.namespace;

      if (group === channel.guild.id) {
        group = 'this';
      }

      return `\`${prefix}${unprefixed}\` is from \`${group}\``;
    } else {
      return `unknown or disallowed command: ${unprefixed}`;
    }
  }

  getCommands(input) {
    let guild = input.message.guild || 'default';
    let groups = this.bot.listAddons(guild);
    let serverConf = this.bot.getConfig(guild);
    let prefix = serverConf.prefix;
    let serverName = serverConf.name;

    if (input.message.guild) {
      let index = groups.indexOf(input.message.guild.id);
      if (index > -1) {
        groups[index] = 'this';
      }
    }

    let available = [];
    let embed = new Discord.RichEmbed();
    if (input.text) {
      available = this.bot.listCommands(input.message, input.text, true);
      embed.setTitle(`secret_bot *help* -> *commands* -> *${input.text}*`)
        .setDescription(`config for server: *${serverName}*\ncommands (${available.length}):`);
    } else {
      available = this.bot.listCommands(input.message, null, true);
      embed.setTitle('secret_bot *help* -> *commands*')
        .setDescription(`config for server: *${serverName}*\ncommand groups enabled: ${groups.sort().join(', ')}\ncommands (${available.length}): `);
    }

    // Send commands by group
    let groupMap = new Map();
    available.forEach((pair) => {
      let group = pair[1].addon.namespace;
      if (input.message.channel instanceof Discord.TextChannel) {
        if (group === input.message.guild.id) {
          group = 'this';
        }
      }

      if (!groupMap.has(group)) {
        groupMap.set(group, []);
      }

      groupMap.get(group).push(pair);
    });

    Array.from(groupMap.entries())
      .sort((set1, set2) => {
        if (set1[0] > set2[0]) {
          return 1;
        } else if (set1[0] < set2[0]) {
          return -1;
        }
        return 0;
      })
      .forEach((set) => {
        let list = set[1].sort().map(item => `\`${prefix}${item[0]}\``).join(', ');
        let parts = list.match(splitWordsLengthRegex);
        parts.forEach((item, index) => {
          embed.addField(
            `**${set[0]}${index?' (cont.)':''}**`,
            item
          );
        });

      });

    let result = new Result();
    result.setPrivate();
    result.add(embed);
    return result;
  }

  createResult(input, obj) {
    if (!obj) {
      return '';
    }

    let result = new Result();
    result.setPrivate();

    if (Array.isArray(obj)) {
      result.add(obj.join('\n'));
    } else if (typeof obj === 'string') {
      result.add(obj);
    } else {
      if (Array.isArray(obj.text)) {
        result.add(obj.text.join('\n'));
      } else {
        result.add(obj.text);
      }

      if (obj.actions) {
        obj.actions.forEach((action) => {
          result.add(new ReAction(action.emoji, action.desc, input, action.action));
        });
      }
    }

    return result;
  }

  getHelp(input) {
    return input.process()
      .then((res) => {
        if (res.args.length) {
          // Help topics
          if (res.args[0] === 'topic') {
            let content;

            let topic = res.args.slice(1).join(' ');

            if (topic) {
              if (topics[topic]) {
                content = topics[topic];
                if (Array.isArray(content)) {
                  content = {
                    text: content
                  };
                }
              } else {
                return noTopic;
              }
            } else {
              content = {
                text:[
                  'use `~help topic <name>` to view a help topic',
                  Object.keys(topics)
                    .map(k => `\`${k}\``)
                    .join(', ')
                ]
              };
            }

            content.text = [
              `secret_bot *help topic*${topic?` -> *${topic}*`:''}`,
              '',
              ...content.text
            ];
            return content;
          }

          let prefix = this.bot.getConfig(input.message.guild || 'default').prefix;
          let escapedPrefix = prefix.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
          let match = input.text.match(new RegExp(`^${escapedPrefix}(.+)`));
          let unprefixed = input.text;
          if (match) {
            unprefixed = match[1];
          }

          let header = [
            `secret_bot *help* -> *${unprefixed}*`
          ];
          let help = '';

          // Get command
          let comm = this.bot.getCommand(`${prefix}${unprefixed}`, input.message);
          if (comm) {
            header.push(`addon: ${comm.addon.namespace}`);

            let over = new Override('');
            help = comm.help(input.from(over, new Result(true))); // Give a fresh result to avoid mutation
            // Return on empty string. Allows for a no-response
            if (help === '') {
              return '';
            }
            if (!help) {
              help = `no help for \`${unprefixed}\` can be found`;
            }

            // Add permission info
            if (comm.permission) {
              switch (comm.permission) {
                case Command.PermissionLevels.ADMIN:
                  header.push('permission required: Admin');
                  break;
                case Command.PermissionLevels.OVERLORD:
                  header.push('permission required: Overlord');
                  break;
                case Command.PermissionLevels.SUPERUSER:
                  header.push('permission required: SuperUser');
                  break;
              }
            }

            return [
              ...header,
              '',
              help
            ];
          } else {
            return noCommand;
          }
        } else {
          return defaultHelp;
        }
      })
      .catch((err) => {
        this.error(err);
        throw `unable to find help for ${input.text}`;
      })
      .then((obj) => {
        return this.createResult(input, obj);
      });
  }
}

module.exports = Help;
