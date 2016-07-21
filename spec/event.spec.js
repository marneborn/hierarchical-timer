"use strict";

const BPromise = require('bluebird'),
      customMatchers = require('./custom-matchers'),
      Event = require('../lib/Event');

let timer;

describe("Event", function () {

    let event, start;

    beforeEach(function () {
        jasmine.addMatchers(customMatchers);
        start = new Date();
        event = new Event("some message");
    });

    describe("Basic functionality:", function () {
        describe("constructor", function () {

            it("should be able to create", function () {
                expect(new Event()).toBeInstanceOf(Event);
            });
        });

        describe(".startTime", function () {

            it("should set the startTime on creation", function () {
                expect(event.startTime.getTime()).toBeCloseTo((new Date()).getTime(), -1);
            });

        });

        describe(".endTime", function () {

            it("should have no set endTime on creation", function () {
                expect(event.endTime).toBeUndefined();
            });

            it("should set the endTime on a stop", function (done) {

                BPromise.resolve()
                    .delay(50)
                    .then(function () {
                        event.stop();
                        expect(event.endTime.getTime()).toBeCloseTo((new Date()).getTime(), -1);
                    })
                    .then(done)
                    .catch(done.fail);
            });

        });

        describe(".message", function () {

            it("should be able to retrieve the message set on creation", function () {
                expect(event.message).toBe("some message");
            });

        });

        describe(".isRunning", function () {

            it("should say that a newly created event is running.", function () {
                expect(event.isRunning).toBe(true);
            });

            it("should not be running after a stop", function () {
                event.stop();
                expect(event.isRunning).toBe(false);
            });

        });

        describe(".delta", function () {

            it("should say that the delta is undefined while still running.", function () {
                expect(event.delta).toBeUndefined();
            });

            it("should be able to calculate a delta after a stop", function (done) {
                BPromise.delay(50)
                    .then(function () {
                        event.stop();
                        expect(event.delta).toBeCloseTo(new Date() - start, -1);
                    })
                    .then(done)
                    .catch(done.fail);
            });

        });

        describe(".stop", function () {

            it("should return the original event", function () {
                let ev = event.stop();
                expect(ev).toBe(event);
                expect(ev).toBeInstanceOf(Event);
            });

            it("should throw an error if stop is called on a stopped event", function () {
                event.stop();
                expect(event.stop).toThrow();
            });

        });

        describe(".start", function () {

            it("should throw an error if start is called on a stopped event", function () {
                event.start();
                expect(event.stop).toThrow();
            });

        });

    });

    describe("Multiple starts and stops", function () {

        it("should be running after 2 starts and 1 stop", function () {
            event.start();
            event.start();
            event.stop();
            expect(event.isRunning).toBe(true);
        });

        it("should return the sub-event when stopping a nested start.", function () {
            event.start();
            event.start();
            let ev = event.stop();
            expect(ev).not.toBe(event);
        });

        it("should stop the outer event on the second .stop.", function (done) {
            BPromise.delay(50)
                .then(function () {
                    event.start();
                })
                .delay(50)
                .then(function () {
                    let ev = event.stop();
                    expect(ev.delta).toBeLessThan(100);
                    expect(event.isRunning).toBe(true);
                })
                .delay(50)
                .then(function () {
                    let ev = event.stop();
                    expect(ev).toBe(event);
                    expect(ev.delta).toBeGreaterThan(100);
                })
                .then(done)
                .catch(done.fail);
        });
    });
});
