"use strict";

const BPromise = require('bluebird'),
      customMatchers = require('./custom-matchers'),
      Event = require('../lib/Event');

describe("Event", function () {

    let event, start;

    beforeEach(function () {
        jasmine.addMatchers(customMatchers);
        start = new Date();
        event = new Event();
    });

    describe("Basic functionality:", function () {

        describe("construction", function () {

            it("should be able to create", function () {
                let ev = new Event();
                expect(ev).toBeInstanceOf(Event);
            });

        });

        describe(".startTime", function () {

            it("should not set the startTime until the first start.", function () {
                expect(event.startTime).toBeUndefined();
            });

            it("should set the startTime on a start.", function () {
                event.start();
                expect(new Date() - event.startTime).toBeLessThan(2);
            });
        });

        describe(".endTime", function () {

            it("should have no set endTime on creation.", function () {
                expect(event.endTime).toBeUndefined();
            });

            it("should set the endTime on a stop.", function (done) {
                event.start();
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

            it("shouldn't have a message set before it's started", function () {
                expect(event.message).toBeUndefined();
            });

            it("should be able to retrieve the message set on creation.", function () {
                event.start("some message");
                expect(event.message).toBe("some message");
            });

        });

        describe(".isRunning", function () {

            it("should say that a newly created event is not running.", function () {
                expect(event.isRunning).toBe(false);
            });

            it("should say that a started event is running.", function () {
                event.start();
                expect(event.isRunning).toBe(true);
            });

            it("should say that a stopped event is not running.", function () {
                event.start();
                event.stop();
                expect(event.isRunning).toBe(false);
            });

        });

        describe(".delta", function () {

            it("should say that unstarted event has an undefined delta.", function () {
                expect(event.delta).toBeUndefined();
            });

            it("should say that a started event has an undefined delta.", function () {
                event.start();
                expect(event.delta).toBeUndefined();
            });

            it("should be able to calculate a delta after a stop.", function (done) {
                let t1 = new Date();
                event.start();
                BPromise.delay(50)
                    .then(function () {
                        event.stop();
                        expect(event.delta - (new Date() - t1)).toBeLessThan(5);
                    })
                    .then(done)
                    .catch(done.fail);
            });

        });

        describe(".stop", function () {

            it("should return the original event.", function () {
                event.start();
                let ev = event.stop();
                expect(ev).toBe(event);
                expect(ev).toBeInstanceOf(Event);
            });

            it("should throw an error if stop is called on a stopped event.", function () {
                event.start();
                event.stop();
                expect(event.stop).toThrow();
            });

        });

        describe(".start", function () {

            it("should throw an error if start is called on a stopped event.", function () {
                event.start();
                event.stop();
                expect(event.start).toThrow();
            });

        });

    });

    describe("Multiple starts and stops", function () {

        it("should be running after 2 starts and 1 stop.", function () {
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
            event.start();
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

        it("should have no child events on start+stop.", function () {

            event.start();
            event.start();
            let ev = event.stop();
            expect(ev).not.toBe(event);
        });

    });

    describe("Counting child events", function () {

        it("should have no child events on creation.", function () {
            expect(event.toJSON().children.length).toBe(0);
        });

        it("should have no child events after a single start.", function () {
            event.start();
            expect(event.toJSON().children.length).toBe(0);
        });

        it("should have one child event after a multiple starts.", function () {
            event.start();
            event.start();
            event.start();
            event.start();
            expect(event.toJSON().children.length).toBe(1);
        });

        it("should have two child events if one is started after the first child is stopped.", function () {
            event.start();
            event.start();
            event.stop();
            event.start();
            expect(event.toJSON().children.length).toBe(2);
        });

        it("should properly stop the top event (case 1).", function () {
            event.start();
            event.start();
            event.stop();
            event.start();
            expect(event.stop()).not.toBe(event);
            expect(event.isRunning).toBe(true);
            expect(event.stop()).toBe(event);
            expect(event.isRunning).toBe(false);
        });

    });
});
