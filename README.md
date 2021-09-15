# hlstogram
## [Try it out!](https://hlstogram.herokuapp.com)

### Background and Overview:

Hlstogram is a frontend javascript project which uses the Canvas API to calculate the frequency of hues in a user uploaded image and generates a circular 'histogram' visualiazation of the frequency of these hues in an image using the Konva library.

### Design Challenges and Considerations:
While there are several existing NPM libraries for getting color palettes from images, the majority of these libraries run using server-side code and cannot be used in the browser. Those libraries which can run browser-side can only run elements that have already been loaded on the document object model. As a result, I chose to create my own methods for extracting color information from an uploaded image.

In Javascript, image data is loaded asynchronously, which must therefore be considered when the application relies on that data for synchronous functions. In order to handle this, I created a method for reading image data and saving it to the component state and placed it within the images onload function. I then used React's useEffect hook to listen for this change in component state and then fire off the synchronous functions which relied upon the image data.


### Architecture and Technology
This project is implemented using the following technologies:

    * The Canvas API to access and read image color data
    * The Konva library to create visualiaztions and plot graph bars based on hue frequency.
    * Webpack and Babel for bundling and transpiling JavaScript
    * npm for managing project dependencies
    * A largely self-written trigonomotry library for calculating points in a radial space and transforming them to a grid-coordinate (x,y) notation.

