"use strict";

const EventEmitter = require('events'),
      Event = require('./Event');

const CHILDREN = Symbol('children'),
      CURRENT = Symbol('current');

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

    get isRunning() {
        return this[CHILDREN].length > 0 && this[CHILDREN][0].isRunning;
    }

    toJSON() {
        return this[CHILDREN];
    }

}

module.exports = HierarchicalTimer;
