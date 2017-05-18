# Thumbnail class

## Description:

The thumbnail class is a helper class that abstracts the use of the imagemagic binary. The objective is to generate thumbnails from provided images. The default thumbnail size is 25x25 pixels.

The approach to this is first to resize the height to target size while, **keeping** the aspect ratio. If the resulting image width is beyond the thumbnail target size it should be cropped to target width on both sides equally (cutting out the left and right edges).

## Dependencies:

You will have the ImageMagick 6.x library installed and running. The explanation and details for this are beyond this class.

## Functionality:

The class will be merged into the utilities package and will not run independently.


## Input Formats:

These are the known the input formats:
- png, jpg, gif


## Output image formats:

These target formats:
- png, jpg, gif

The output image will have the same type and beginning name as the input images.

More specifically, the output image filename will have a thumbnail specific postfix with height and width inserted before file extension.

Form example if the input image file name is `myface.jpg` and a 25x25px thumbnail is generated, the output name will be `myface_thumb_25_25.jpg`

The output file will be placed in the same folder as the input file.


## Special case

We will not accept animated gif files. An error will be raised.

If the image is below the target size for thumbnail (smaller than or equal to thumbnail height and width), 
then we will return it without modification and without changing its file name. A simple pointer back to input file will be returned.


## Function Signature:

The desired call signature is `thumbnail(locatin,targetHeight, targetWidth)`

```
thumbnail([image location], [targetHeight], [targetWidth]) {

    return Promise.resolve([thumbnail location])
}
```

The targetHeight should default to 25px

The targetWidth should default to 25px

The function should return a promise with location of thumbnail file.



#### Sample calls 

Generate a 25x25px thumbnail from local file
```
thumbnail("/temp/wip/myface.png")

```

Generate a 40x20px thumbnail from local file
```
thumbnail("/temp/wip/briansprofile.jpg",40 , 20)

```

