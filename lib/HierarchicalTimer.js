"use strict";

const EventEmitter = require('events'),
      Event = require('./Event');

const CHILDREN = Symbol('children'),
      CURRENT = Symbol('current');

// %i = calculated indentions
// %m = .message
// %d = .delta
// %s = .startTime
// %e = .endTime
const DEFAULT_STRING_TEMPLATE = "%i%m (%dms)";

class HierarchicalTimer extends EventEmitter {

    constructor() {
        super();
        this[CHILDREN] = [];
    }

    start(msg) {

        let ev;

        if (this.isRunning) {
            ev = this[CHILDREN][0];
        }

        else {
            ev = new Event();
            this[CHILDREN].unshift(ev);
        }

        try {
            this.emit('start', ev.start(msg));
        }
        catch (err) {
            this.emit('error', err);
        }

        return;
    }

    stop() {

        if (!this.isRunning) {
            this.emit('error', new Error("No started event to stop"));
            return;
        }

        try {
            this.emit('stop', this[CHILDREN][0].stop());
        }
        catch (err) {
            this.emit('error', err);
        }
    }

    forEach(execFN) {
        this._forEach(execFN, /* sortFN */ void(0));
    }

    sort(sortFN) {
        let self = this;
        return {
            forEach: function (execFN) {
                self._forEach(execFN, sortFN);
            }
        };
    }

    _forEach(execFN, sortFN) {
        let sorted = sortFN ? this[CHILDREN].sort(sortFN) : this[CHILDREN].reverse();
        for (let i=0; i<sorted.length; i++) {
            sorted[i].sort(sortFN).forEach(execFN, i, this, this[CHILDREN]);
        };
    }

    flatten() {
        return Array.prototype.concat.apply(
            [],
            this[CHILDREN].reverse().map(function (ev) { return ev.flatten(); })
        );
    }

    get isRunning() {
        return this[CHILDREN].length > 0 && this[CHILDREN][0].isRunning;
    }

    toJSON() {
        return this[CHILDREN].map(function (ev) { return ev.toJSON(); });
    }

    static shouldIncrement(ev, index, parent, siblings) {
        return index === 0 && siblings.length > 1;
    }

    static shouldDecrement(ev, index, parent, siblings) {
        return index === siblings.length-1;
    }

}

module.exports = HierarchicalTimer;

HierarchicalTimer.STRING_TEMPLATE = DEFAULT_STRING_TEMPLATE;

function noop () {}
