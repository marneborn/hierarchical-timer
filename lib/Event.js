"use strict";

// Define keys for properties
const START = Symbol('start'),
      END = Symbol('end'),
      MSG = Symbol('message'),
      EVENTS = Symbol('events');

class Event {

    constructor(msg) {
        this[START] = new Date();
        this[END] = void(0);
        this[MSG] = msg;
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
        return this[END] === void(0);
    }

    get delta() {
        return this[END] === void(0) ? void(0) : this[END] - this[START];
    }

    start(msg) {

        if (!this.isRunning) {
            throw new Error("Can't start an event that is already stopped");
        }

        let ch = new Event(msg);
        this[EVENTS].unshift(ch);
        return ch;
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
