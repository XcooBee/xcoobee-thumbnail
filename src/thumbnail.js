"use strict";

const fs = require("fs");
const path = require("path");
const Generator = require("./Generator");

const supportedInputFormats = ["jpg", "jpeg", "gif", "png"];

module.exports.thumbnail = (location, targetHeight = 25, targetWidth = 25) => {
    return new Promise((resolve, reject) => {

        const inputReadStream = fs.createReadStream(location);

        const inputImagePath = inputReadStream.path;
        let inputExtension = path.extname(inputImagePath);
        const inputFileName = path.basename(inputImagePath, inputExtension);
        const inputDirectory = path.dirname(inputImagePath);
        inputExtension = inputExtension.substr(1);

        if (!supportedInputFormats.includes(inputExtension)) {
            return reject("Unsupported input format.");
        }
        
        const outputImagePath = path.resolve(`${inputDirectory}${path.sep}${inputFileName}_thumb_${targetHeight}_${targetWidth}.${inputExtension}`);
        
        Generator.generateThumb(targetHeight, targetWidth, inputImagePath, outputImagePath)
            .then((result) => {
                resolve(result);
            })
            .catch((err) => {
                reject(err);
            });
    });
};
