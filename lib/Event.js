"use strict";

// Define keys for properties
const START = Symbol('start'),
      END = Symbol('end'),
      MSG = Symbol('message'),
      EVENTS = Symbol('events');

class Event {

    constructor() {
        this[START] = void(0);
        this[END] = void(0);
        this[MSG] = void(0);
        this[EVENTS] = [];
    }

    get startTime() {
        return this[START];
    }

    get endTime() {
        return this[END];
    }

    get message() {
        return this[MSG];
    }

    get isRunning() {
        return this[START] !== void(0) && this[END] === void(0);
    }

    get delta() {
        return this[END] === void(0) ? void(0) : this[END] - this[START];
    }

    start(msg) {

        if (this[START] === void(0)) {
            this[START] = new Date();
            this[MSG] = msg;
            return this;
        }

        if (this[END] !== void(0)) {
            throw new Error("Can't start an event that is already stopped");
        }

        let ev = new Event();
        this[EVENTS].unshift(ev);
        ev.start(msg);
        return ev;
    }

    stop() {

        if (!this.isRunning) {
            throw new Error("Can't stop an event that is already stopped");
        }

        if (this[EVENTS].length > 0 && this[EVENTS][0].isRunning) {
            return this[EVENTS][0].stop();
        }

        this[END] = new Date();

        return this;
    }

    toJSON() {
        return {
            start: this[START],
            end: this[END],
            message: this.message,
            delta: this.delta,
            events: this[EVENTS].map(runToJSON)
        };
    }
}

module.exports = Event;

function runToJSON (ev) {
    return ev.toJSON();
}
