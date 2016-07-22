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
