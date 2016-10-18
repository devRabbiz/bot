const Channel = require('./Channel.js');

/**
 * A server. Ever connection should have at least one
 */
class Server {
  constructor(connection, name, id = name) {
    this.conn = connection;
    this.n = name;
    this.i = id;

    this.channels = [];
  }

  //region Properties

  get connection() {
    return this.conn;
  }

  get name() {
    return this.n;
  }

  get id() {
    return this.i;
  }

  get botId() {
    return this.ii;
  }

  //endregion

  //region Functions

  addChannel(channel) {
    if (channel instanceof Channel) {
      this.channels.push(channel);
    } else {
      throw new Error('Tried to add a non-channel object');
    }
  }

  getConfig() {
    return this.conn.getConfig(this);
  }

  setConfig(val) {
    this.conn.setConfig(this, val);
  }

  //endregion
}

module.exports = Server;