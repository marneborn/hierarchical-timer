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

    forEach(fn, cleanup) {
        let children = this[CHILDREN].reverse();

        for (let i=0; i<children.length; i++) {
            children[i]._forEach(fn, cleanup, i, this, this[CHILDREN]);
        };
    }

    show(fn) {
        if (!fn) fn = console.log;

        fn(Array.prototype.concat.apply(
            [],
            this[CHILDREN].reverse().map(function (ev) {
                return ev.makeStrings(
                    { /* indent */
                        sofar: '',
                        inc: '  '
                    },
                    HierarchicalTimer.STRING_TEMPLATE
                );
            })
        ).join("\n"));

    }

    get isRunning() {
        return this[CHILDREN].length > 0 && this[CHILDREN][0].isRunning;
    }

    toJSON() {
        return this[CHILDREN];
    }
}

module.exports = HierarchicalTimer;

HierarchicalTimer.STRING_TEMPLATE = DEFAULT_STRING_TEMPLATE;
