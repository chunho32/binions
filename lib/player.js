// Generated by CoffeeScript 1.12.5
(function() {
  var EventEmitter, Hand, Player,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Hand = require("hoyle").Hand;

  EventEmitter = require('events').EventEmitter;

  Player = exports.Player = (function(superClass) {
    extend(Player, superClass);

    Player.STATUS = {
      PUBLIC: 0,
      FINAL: 1,
      PRIVILEGED: 2
    };

    function Player(bot, chips, name) {
      this.bot = bot;
      this.chips = chips;
      this.name = name;
      this.reset();
    }

    Player.prototype.reset = function() {
      this.wagered = 0;
      this.payout = 0;
      this.ante = 0;
      this.blind = 0;
      this.state = 'active';
      this.hand = null;
      this.cards = [];
      return this._actions = {};
    };

    Player.prototype.active = function() {
      return this.state === 'active' || this.state === 'allIn';
    };

    Player.prototype.inPlay = function() {
      return this.wagered > 0 && this.active();
    };

    Player.prototype.canBet = function() {
      return this.chips > 0 && this.active();
    };

    Player.prototype.bet = function(amount) {
      if (amount > this.chips) {
        amount = this.chips;
      }
      this.wagered = this.wagered + amount;
      this.chips = this.chips - amount;
      return amount;
    };

    Player.prototype.takeBlind = function(amount) {
      this.blind = this.bet(amount);
      return this.blind;
    };

    Player.prototype.actions = function(round) {
      return this._actions[round] || [];
    };

    Player.prototype.act = function(round, action, amount, err) {
      var _action, base;
      amount || (amount = 0);
      this.emit('bet', {
        state: this.state,
        amount: amount,
        type: action
      });
      _action = {
        type: action
      };
      if (err) {
        _action.error = err;
      }
      if (amount) {
        _action['bet'] = amount;
      }
      (base = this._actions)[round] || (base[round] = []);
      this._actions[round].push(_action);
      if (action === 'fold') {
        this.state = 'folded';
      } else if (action === 'allIn') {
        this.state = 'allIn';
      } else if (amount === this.chips) {
        this.state = 'allIn';
      }
      if (amount) {
        this.bet(amount);
      }
      this.emit('betAction', action, amount, err);
      return _action;
    };

    Player.prototype.update = function(gameStatus, cb) {
      if (this.bot.update.length > 1) {
        return this.bot.update(gameStatus, function(err, res) {
          return cb(err, res);
        });
      } else {
        return process.nextTick((function(_this) {
          return function() {
            return cb(null, _this.bot.update(gameStatus));
          };
        })(this));
      }
    };

    Player.prototype.lastBet = function(state) {
      var lastAct;
      lastAct = this.actions(state)[this.actions(state).length - 1];
      if (lastAct && lastAct['bet']) {
        return lastAct['bet'];
      } else {
        return 0;
      }
    };

    Player.prototype.makeHand = function(community) {
      var c;
      c = [];
      c = c.concat(community);
      c = c.concat(this.cards);
      this.hand = Hand.make(c);
      return this.hand;
    };

    Player.prototype.status = function(level) {
      var s;
      s = {
        name: this.name,
        blind: this.blind,
        ante: this.ante,
        wagered: this.wagered,
        state: this.state,
        chips: this.chips,
        actions: this._actions || []
      };
      if (this.payout) {
        s.payout = this.payout;
      }
      if ((level === Player.STATUS.FINAL && this.active()) || level === Player.STATUS.PRIVILEGED) {
        s.cards = this.cards.map(function(c) {
          return c.toString();
        });
        if (this.hand) {
          s.handName = this.hand.name;
          s.hand = this.hand.cards.map(function(c) {
            return c.toString();
          });
        }
      }
      return s;
    };

    return Player;

  })(EventEmitter);

}).call(this);
