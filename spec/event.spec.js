"use strict";

const Event = require('../lib/Event');

describe("Event:", function () {

    let event;
    beforeEach(function () {
        event = new Event();
    });

    describe(".start", function () {

        it("shouldn't return anything", function () {
            expect(timer.start()).toBeUndefined();
        });


    });

    describe(".stop", function () {

        it("should return the stopped event", function () {
            timer.start();
            let ev = timer.stop();
            expect(ev).toBeInstanceOf(Event);
        });

        it("should have the message on the stopped event", function () {
            timer.start("foo");
            let ev = timer.stop();
            expect(ev.message).toBe("foo");
        });

        it("should throw an error if stop is called before start", function () {
            expect(timer.stop).toThrow();
        });

    });

    describe(".delta", function () {

        it("should return the time between the start and stop calls", function (done) {
            timer.start();
            setTimeout(function () {
                let ev = timer.stop();
                expect(ev.delta).toBeCloseTo(100, -1);
                done();
            }, 100);
        });

    });
});
