"use strict";

/*
 You will need to run the test from the root folder of the project using
 `npm test` or `mocha test\test.js` command

 */

const path = require("path");
const assert = require("assert");
const Generator = require("../src/Generator");
const thumbnail = require("../src/thumbnail");
const sinon = require("sinon");
const im = require("imagemagick-composite");

const sandbox = sinon.sandbox.create();

const jpgIdentifyOutput = "564,776 ";
const jpgWrongIdentifyOutput = "75,75 ";
const gifIdentifyOutput = "90,90,20 90,90,20 90,90,20 90,90,20 90,90,20 ";
const inputPCT = path.resolve("./test/assets/image.pct");
const inputJPG = path.resolve("./test/assets/image.jpg");
const outputJPG = path.resolve("./test/assets/image_thumb_50_50.jpg");
const inputPNG = path.resolve("./test/assets/image.png");
const outputPNG = path.resolve("./test/assets/image_thumb_25_25.png");

describe("Integration tests", () => {
    // set your THUMB_DEV environmental variable to run the integration tests
    const runCondition = (typeof process.env.THUMB_DEV !== "undefined");

    before(() => {
        /*
         INTEGRATION TESTS REQUIRE IMAGEMAGICK 6.*

         FOR THE INTEGRATION TESTS TO SUCCEED WE WILL NEED CERTAIN IMAGE FILES TO BE PRESENT:
         ./test/assets/image.jpg - valid JPEG image
         ./test/assets/image.png - valid PNG image

         Then set your local env variable THUMB_DEV

         IF THE ABOVE CONDITIONS ARE NOT MET, MODIFY CODE TO MATCH NEW LOCAL CONDITIONS
         */
    });

    (runCondition ? it : it.skip)("Should create thumbnail for JPG file", () => {

        thumbnail.thumbnail(inputJPG, 50, 50)
            .then((data) => {
                assert.equal(data, outputJPG);
            })
            .catch((err) => {
                assert.fail(true, false, err);
            });
    });

    (runCondition ? it : it.skip)("Should create thumbnail for PNG file", () => {

        thumbnail.thumbnail(inputPNG)
            .then((data) => {
                assert.equal(data, outputPNG);
            })
            .catch((err) => {
                assert.fail(true, false, err);
            });
    });

});

describe("Thumbnail methods", () => {

    afterEach(() => {
        // this removes any stubs after each test
        sandbox.restore();
    });

    it("Should fail calling `thumbnail` function with unsupported input format error", () => {
        thumbnail.thumbnail(inputPCT)
            .then((data) => {
                assert.fail(true, false, data);
            })
            .catch((err) => {
                // this is expected failure so test is successfull
                assert.ok(err, "we expect a rejection");
            });
    });

    it("Should successfully call `thumbnail` function", () => {
        sandbox.stub(Generator, "generateThumb").returns(Promise.resolve("success"));

        thumbnail.thumbnail(inputJPG)
            .then((data) => {
                assert.equal(data, "success");
            })
            .catch((err) => {
                assert.fail(true, false, err);
            });
    });

    it("Should fail calling `thumbnail` function", () => {
        sandbox.stub(Generator, "generateThumb").returns(Promise.reject("error"));

        thumbnail.thumbnail(inputJPG)
            .then((data) => {
                assert.fail(true, false, data);
            })
            .catch((err) => {
                assert.ok(err, "we expect a rejection");
            });
    });
});


describe("Generator methods", () => {

    afterEach(() => {
        // this removes any stubs after each test
        sandbox.restore();
    });

    it("Should call processImConvert function successfully", () => {

        const convertCallback = sinon.spy();
        // stub helper call
        sandbox.stub(im, "convert").returns(convertCallback);

        return Generator.processImConvert([inputJPG])
            .then((data) => {
                assert.equal(data, true);
            })
            .catch((err) => {
                assert.fail(true, false, err);
            });
    });

    it("Should fail calling processImConvert function", () => {

        // stub helper call
        sandbox.stub(im, "convert").returns(42);

        return Generator.processImConvert([inputJPG])
            .then((data) => {
                assert.fail(true, false, data);
            })
            .catch((err) => {
                assert.ok(err, "we expect a rejection");
            });
    });

    it("Should call processImIdentify function successfully", () => {

        const convertCallback = sinon.spy();
        // stub helper call
        sandbox.stub(im, "identify").returns(convertCallback);

        return Generator.processImIdentify(inputPNG, "%w,%h")
            .then((data) => {
                assert.equal(data, "success");
            })
            .catch((err) => {
                assert.fail(true, false, err);
            });
    });

    it("Should fail calling processImIdentify function", () => {

        // stub helper call
        sandbox.stub(im, "identify").returns(42);

        return Generator.processImIdentify(inputJPG, "%w,%h")
            .then((data) => {
                assert.fail(true, false, data);
            })
            .catch((err) => {
                assert.ok(err, "we expect a rejection");
            });
    });

    it("Should fail calling generateThumb function for multi frames image", () => {
        // stub methods
        sandbox.stub(Generator, "processImIdentify").returns(Promise.resolve(gifIdentifyOutput));
        sandbox.stub(Generator, "processImConvert").returns(Promise.resolve(true));

        return Generator.generateThumb(50, 50, inputJPG, outputJPG)
            .then((data) => {
                assert.fail(true, false, data);
            })
            .catch((err) => {
                assert.equal(err, "Only image with single frame can be used.");
            });
    });

    it("Should fail calling generateThumb function for small image", () => {
        // stub methods
        sandbox.stub(Generator, "processImIdentify").returns(Promise.resolve(jpgWrongIdentifyOutput));
        sandbox.stub(Generator, "processImConvert").returns(Promise.resolve(true));

        return Generator.generateThumb(100, 100, inputPNG, outputPNG)
            .then((data) => {
                assert.equal(data, inputPNG);
            })
            .catch((err) => {
                assert.fail(true, false, err);
            });
    });

    it("Should successfully call generateThumb function", () => {
        // stub methods
        sandbox.stub(Generator, "processImIdentify").returns(Promise.resolve(jpgIdentifyOutput));
        sandbox.stub(Generator, "processImConvert").returns(Promise.resolve(true));

        return Generator.generateThumb(100, 100, inputJPG, outputJPG)
            .then((data) => {
                assert.equal(data, outputJPG);
            })
            .catch((err) => {
                assert.fail(true, false, err);
            });
    });
});

