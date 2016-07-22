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

            it("should throw an error if stop is called with a different message from start.", function () {
                event.start("foo");
                expect(function () {
                    event.stop("foo");
                }).not.toThrow();
            });

            it("should throw an error if stop is called with a different message from start.", function () {
                event.start("foo");
                expect(function () {
                    event.stop("bar");
                }).toThrow();
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

    describe(".forEach", function () {
        let forEachSpy;

        beforeEach(function () {
            forEachSpy = jasmine.createSpy('forEach');
        });

        describe("basic functionality", function () {
            it("should execute the function on itself", function () {
                let index = new Object(),
                    parent = new Object(),
                    siblings = [];
                event.forEach(forEachSpy, index, parent, siblings);
                expect(forEachSpy).toHaveBeenCalledWith(event, index, parent, siblings);
            });
        });

        describe("Complicated test case", function () {

            let ev1, ev2, ev3, ev4,
                index, parent, siblings;

            beforeEach(function () {
                // 1
                //  2
                //   3
                //  4
                event.start(1);
                event.start(2);
                event.start(3);
                ev3 = event.stop();
                ev2 = event.stop();
                event.start(4);
                ev4 = event.stop();
                ev1 = event.stop();

                index = new Object();
                parent = new Object();
                siblings = new Array();
                event.forEach(forEachSpy, index, parent, siblings);
            });

            it("should execute the function on itself and all children", function () {
                expect(forEachSpy.calls.argsFor(0)[0]).toBe(ev1);
                expect(forEachSpy.calls.argsFor(1)[0]).toBe(ev2);
                expect(forEachSpy.calls.argsFor(2)[0]).toBe(ev3);
                expect(forEachSpy.calls.argsFor(3)[0]).toBe(ev4);
            });

            it("should pass the index of the child into the function, the top has no index", function () {
                expect(forEachSpy.calls.argsFor(0)[1]).toBe(index);
                expect(forEachSpy.calls.argsFor(1)[1]).toBe(0);
                expect(forEachSpy.calls.argsFor(2)[1]).toBe(0);
                expect(forEachSpy.calls.argsFor(3)[1]).toBe(1);
            });

            it("should pass the parent object as the 3rd argument", function () {
                expect(forEachSpy.calls.argsFor(0)[2]).toBe(parent);
                expect(forEachSpy.calls.argsFor(1)[2]).toBe(ev1);
                expect(forEachSpy.calls.argsFor(2)[2]).toBe(ev2);
                expect(forEachSpy.calls.argsFor(3)[2]).toBe(ev1);
            });

            it("should pass the siblings as the 4th argument", function () {
                expect(forEachSpy.calls.argsFor(0)[3]).toBe(siblings);
                expect(forEachSpy.calls.argsFor(1)[3]).toEqual([ev2, ev4]);
                expect(forEachSpy.calls.argsFor(2)[3]).toEqual([ev3]);
                expect(forEachSpy.calls.argsFor(3)[3]).toEqual([ev2, ev4]);
            });
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
