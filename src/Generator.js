"use strict";

const im = require("imagemagick-composite");

class Generator {

    /**
     * Generates thumbnail with required height and width
     * @param {Number} targetHeight
     * @param {Number} targetWidth
     * @param {String} inputPath
     * @param {String} outputPath
     * @returns {Promise}
     *
     * @memberof Generator
     */
    static generateThumb(targetHeight, targetWidth, inputPath, outputPath) {
        return new Promise((resolve, reject) => {

            // We need to collect data from original image
            Generator.processImIdentify(inputPath, "%w,%h,%n ")
                .then((identifyOutput) => {
                    const [width, height, framesCount] = identifyOutput.trim().split(" ").pop().split(",");

                    // If image has multiple frames we won't process it
                    if (framesCount > 1) {
                        return Promise.reject("Only image with single frame can be used.");
                    }

                    // If image's height and width are less then target we return original path
                    if (parseInt(width, 10) <= targetWidth && parseInt(height, 10) <= targetHeight) {
                        return Promise.resolve(inputPath);
                    }

                    // Composing convert arguments
                    let convertArgs = [inputPath, "-synchronize", "-thumbnail", `x${targetHeight}`, "-strip", outputPath];

                    // Converting
                    return Generator.processImConvert(convertArgs)
                        .then(() => {
                            // Collecting converted image's params
                            return Generator.processImIdentify(outputPath, "%w ");
                        })
                        .then((processedIdentifyOutput) => {
                            const processedWidth = processedIdentifyOutput.trim().split(" ").pop();

                            // If converted image has more width than required - remove equal amount of pixels on both sides
                            if (parseInt(processedWidth, 10) > targetWidth) {
                                const shaveValue = Math.ceil((processedWidth - targetHeight) / 2);
                                convertArgs = [outputPath, "-synchronize", "-shave", `${shaveValue}x0`, outputPath];
                                return Generator.processImConvert(convertArgs);
                            }

                            return Promise.resolve(outputPath);
                        })
                        .then(() => {
                            return Promise.resolve(outputPath);
                        });
                })
                .then((path) => {
                    return resolve(path);
                })
                .catch((err) => {
                    return reject(err);
                });
        });
    }

    /**
     * This function is a helper function to return a promise of the imagemagick `convert` function.
     * This makes the process more testable. The use of convert is deprecated. We should consider use of `magick convert`
     *
     * @static
     * @param {Array} convertArgs
     * @returns {Promise}
     *
     * @memberof Generator
     */
    static processImConvert(convertArgs) {

        // we create a call envelope around im.convert so we can pass it to a Promise as argument
        const promiseEnvelope = (resolve, reject) => {

            // declare callback pattern to be used outside of IM call so we can reuse it
            const imCallback = (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            };

            const f = im.convert(convertArgs, imCallback);

            // this is for testing only, when testing we will stub im to return a function or a number and call imCallback with required input when we detect it,
            // when not testing the return type is `object`
            if (typeof f === "function") {
                imCallback(false);
            } else if (typeof f === "number") {
                imCallback("error");
            }
        };
        return new Promise(promiseEnvelope);
    }

    /**
     * This function is a helper function to convert callback to a promise of the imagemagick `identify` function.
     * This makes the process more testable. Identify is legacy component of ImageMagick the updated one is `magick identify`
     *
     * @static
     * @param {String} originalImagePath - the path to the image to be processed
     * @param {String} format - desired format of identify output
     * @returns {Promise} - data payload is identified image format
     *
     * @memberof Generator
     */
    static processImIdentify(originalImagePath, format) {

        // we create a call envelope around im.identify so we can pass it to a Promise as argument
        const promiseEnvelope = (resolve, reject) => {

            // declare callback pattern to be used outside of IM call so we can reuse it
            const imCallback = (error, data) => {
                if (error) {
                    reject(error);
                } else {
                    // data is the identified output from image magic
                    resolve(data);
                }
            };

            const f = im.identify(["-format", format, originalImagePath], imCallback);

            // this is for testing only, when testing we will stub im to return a function or a number and call imCallback with required input when we detect it,
            // when not testing the return type is `object`
            if (typeof f === "function") {
                imCallback(false, "success");
            } else if (typeof f === "number") {
                imCallback("error");
            }
        };

        return new Promise(promiseEnvelope);
    }
}

module.exports = Generator;
