"use strict";

const BPromise = require('bluebird'),
      customMatchers = require('./custom-matchers'),
      HierarchicalTimer = require('../lib/HierarchicalTimer'),
      Event = require('../lib/Event');

describe("HierarchicalTimer", function () {

    let timer;

    beforeEach(function () {
        jasmine.addMatchers(customMatchers);
        timer = new HierarchicalTimer();
    });


    describe("construction", function () {

        it("should be able to create", function () {
            let ev = new HierarchicalTimer();
            expect(ev).toBeInstanceOf(HierarchicalTimer);
        });

    });

    describe(".start", function () {
        let startSpy;

        beforeEach(function () {
            startSpy = jasmine.createSpy('start');
            timer.on('start', startSpy);
        });

        it("should return undefined.", function () {
            expect(timer.start()).toBeUndefined();
        });

        it("should emit a 'start' event.", function () {
            timer.start();
            expect(startSpy).toHaveBeenCalledWith(jasmine.any(Event));
        });
    });

    describe(".stop", function () {
        let stopSpy;

        beforeEach(function () {
            stopSpy = jasmine.createSpy('stop');
            timer.on('start', stopSpy);
        });

        it("should return undefined.", function () {
            timer.start();
            expect(timer.stop()).toBeUndefined();
        });

        it("should emit a 'stop' event.", function () {
            timer.start();
            timer.stop();
            expect(stopSpy).toHaveBeenCalledWith(jasmine.any(Event));
        });
    });

    describe(".forEach", function () {

        let forEachSpy,
            events;

        beforeEach(function () {
            forEachSpy = jasmine.createSpy('forEach');
            events = [];
            timer.on('start', function (ev) {
                events.push(ev);
            });
        });

        describe("Basic case", function () {

            beforeEach(function () {
                timer.start(1);
                timer.stop();
                timer.start(2);
                timer.stop();

                timer.forEach(forEachSpy);
            });

            it("should execute the function on itself and all descendents", function () {
                expect(forEachSpy.calls.argsFor(0)[0]).toBe(events[0]);
                expect(forEachSpy.calls.argsFor(1)[0]).toBe(events[1]);
            });

            it("should pass the index of the child into the function as the 2nd argument.", function () {
                expect(forEachSpy.calls.argsFor(0)[1]).toBe(0);
                expect(forEachSpy.calls.argsFor(1)[1]).toBe(1);
            });

            it("should pass the parent object as the 3rd argument", function () {
                expect(forEachSpy.calls.argsFor(0)[2]).toBe(timer);
                expect(forEachSpy.calls.argsFor(1)[2]).toBe(timer);
            });

            it("should pass the siblings as the 4th argument", function () {
                expect(forEachSpy.calls.argsFor(0)[3]).toEqual(events);
                expect(forEachSpy.calls.argsFor(1)[3]).toEqual(events);
            });
        });

        describe("Complicated test case", function () {

            let index, parent, siblings;

            beforeEach(function () {
                timer.start(0); //[0] 0
                timer.start(1); //[1]   1
                timer.start(2); //[2]     2
                timer.stop();
                timer.stop();
                timer.start(3); //[3]   3
                timer.stop();
                timer.stop();

                timer.forEach(forEachSpy);
            });

            it("should execute the function on itself and all descendents", function () {
                expect(forEachSpy.calls.argsFor(0)[0]).toBe(events[0]);
                expect(forEachSpy.calls.argsFor(1)[0]).toBe(events[1]);
                expect(forEachSpy.calls.argsFor(2)[0]).toBe(events[2]);
                expect(forEachSpy.calls.argsFor(3)[0]).toBe(events[3]);
            });

            it("should pass the index of the child into the function as the 2nd argument.", function () {
                expect(forEachSpy.calls.argsFor(0)[1]).toBe(0);
                expect(forEachSpy.calls.argsFor(1)[1]).toBe(0);
                expect(forEachSpy.calls.argsFor(2)[1]).toBe(0);
                expect(forEachSpy.calls.argsFor(3)[1]).toBe(1);
            });

            it("should pass the parent object as the 3rd argument", function () {
                expect(forEachSpy.calls.argsFor(0)[2]).toBe(timer);
                expect(forEachSpy.calls.argsFor(1)[2]).toBe(events[0]);
                expect(forEachSpy.calls.argsFor(2)[2]).toBe(events[1]);
                expect(forEachSpy.calls.argsFor(3)[2]).toBe(events[0]);
            });

            it("should pass the siblings as the 4th argument", function () {
                expect(forEachSpy.calls.argsFor(0)[3]).toEqual([events[0]]);
                expect(forEachSpy.calls.argsFor(1)[3]).toEqual([events[1], events[3]]);
                expect(forEachSpy.calls.argsFor(2)[3]).toEqual([events[2]]);
                expect(forEachSpy.calls.argsFor(3)[3]).toEqual([events[1], events[3]]);
            });
        });
    });

    describe(".sort", function () {

        let forEachSpy,
            events;

        beforeEach(function () {
            forEachSpy = jasmine.createSpy('forEach');
            events = [];
            timer.on('start', function (ev) {
                events.push(ev);
            });
        });

        describe("Basic case", function () {

            beforeEach(function () {
                timer.start(1);
                timer.stop();
                timer.start(2);
                timer.stop();

                timer
                    .sort(function (a, b) {
                        return b.message - a.message;
                    })
                    .forEach(forEachSpy);
            });

            it("should call the objects in reverse order", function () {
                expect(forEachSpy.calls.argsFor(0)[0]).toBe(events[1]);
                expect(forEachSpy.calls.argsFor(1)[0]).toBe(events[0]);
            });
        });

        describe("Sub events should also be sorted", function () {
            beforeEach(function () {
                timer.start(0);  //[0] 0
                timer.start(1);  //[1]   1
                timer.stop();
                timer.start(2);  //[2]   2
                timer.stop();
                timer.stop();
                timer.start(5);  //[3] 5
                timer.start(4);  //[4]   4
                timer.stop();
                timer.start(3);  //[5]   3
                timer.stop();
                timer.stop();

                timer
                    .sort(function (a, b) {
                        return b.message - a.message;
                    })
                    .forEach(forEachSpy);
            });

            it("should sort children in reverse numerical order based on message.", function () {
                expect(forEachSpy.calls.argsFor(0)[0]).toBe(events[3]);
                expect(forEachSpy.calls.argsFor(1)[0]).toBe(events[4]);
                expect(forEachSpy.calls.argsFor(2)[0]).toBe(events[5]);
                expect(forEachSpy.calls.argsFor(3)[0]).toBe(events[0]);
                expect(forEachSpy.calls.argsFor(4)[0]).toBe(events[2]);
                expect(forEachSpy.calls.argsFor(5)[0]).toBe(events[1]);
            });
        });

    });

    describe("Emit errors:", function () {
        let errSpy;

        beforeEach(function () {
            errSpy = jasmine.createSpy('error');
            timer.on('error', errSpy);
        });

        it("should emit an error when stopping a stopped timer", function () {
            timer.stop();
            expect(errSpy).toHaveBeenCalledWith(jasmine.any(Error));
        });

    });

    describe(".isRunning", function () {

        it("shouldn't be running on creation", function () {
            expect(timer.isRunning).toBe(false);
        });

        it("should be running after a start", function () {
            timer.start();
            expect(timer.isRunning).toBe(true);
        });

        it("shouldn't be running on creation", function () {
            timer.start();
            timer.stop();
            expect(timer.isRunning).toBe(false);
        });

    });
});
