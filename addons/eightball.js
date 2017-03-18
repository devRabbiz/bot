const ScriptAddon = require('../bot/ScriptAddon.js');
const Result = require('../bot/Result.js');

const {arrayRandom, promiseChain, embedify, delay} = require('../util');

const eightBallHelp = [
  'syntax: `~eightball <yes/no question>`',
  ''
];

const eightBall = [
  'It is certain',
  'It is decidedly so',
  'Without a doubt',
  'Yes definitely',
  'You may rely on it',
  'As I see it, yes',
  'Most likely',
  'Outlook good',
  'Yes',
  'Signs point to yes',
  'Reply hazy, try again',
  'Ask again later',
  'Better not tell you now',
  'Cannot predict now',
  'Concentrate and ask again',
  'Don\'t count on it',
  'My reply is no',
  'My sources say no',
  'Outlook not so good',
  'Very doubtful'
];

const initial = '🎱⚫⚫';
const stageEmbeds = [
  '⚫🎱⚫',
  '⚫⚫🎱',
  '⚫🎱⚫',
  initial
].map(embedify);
const STAGE_DELAY = 1000;

class Eightball extends ScriptAddon {
  constructor(bot) {
    super(bot, 'eightball');
  }

  get description() {
    return 'Adds a magic eight ball for your entertainment';
  }

  init() {
    this.addCommand('eightball', this.getEightball, eightBallHelp);
  }

  getEightball(input) {
    return input.process()
      .then((res) => {
        let messageProm = Promise.all([
          input.channel.send({embed: embedify(initial)}),
          delay(STAGE_DELAY)
        ]);

        return messageProm
          .then((message) => {
            let answer = arrayRandom(eightBall);

            let stageFunctions = stageEmbeds.map((stage) => {
              return () => Promise.all([
                message.edit({embed: stage}),
                delay(STAGE_DELAY)
              ]);
            });
            let startFunction = () => messageProm;
            let finalFunction = () => message.edit({embed: embedify(`${initial} ${answer}`)});

            return promiseChain([
              startFunction, // Really only here for tidyness
              ...stageFunctions,
              finalFunction
            ]);
          });
      })
      .then(() => {
        return '';
      });
  }
}

module.exports = Eightball;