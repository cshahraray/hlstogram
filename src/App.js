import logo from './logo.svg';
import './App.css';
import { useEffect, useRef, useState } from 'react';
import Button from '@material-ui/core/Button';
import { fetchImageData } from './util/canvas-utils';
const getPixels = require('get-pixels')

function App() {

  const imageRef = useRef(null)
  const [imageUpload, setImageUpload] = useState(null)
  const [imageURL, setImageURL] = useState(null)


  const handleFileChange = (e) => {
    setImageUpload(e.target.files[0])
    setImageURL(URL.createObjectURL(e.target.files[0]))
  }
  

  // const getImageData = () => {

  // }

  useEffect(() => {
    // console.log(imageUpload)
    // console.log(imageURL)
      if(imageRef.current) {
        imageRef.current.src=(imageURL)
        // getPixels(imageRef.current.src, (err, pixels) => {
        //   if (!err) {console.log(pixels)} else {console.log(err)}
        // } )
        drawImageToCanvas(imageRef.current)
      }
      // const canvas = (document.createElement('canvas'))
      // const context = canvas.getContext('2d')
      // context.drawImage(imageRef.current, 0, 0)
      // console.log(context)
 
  }, [imageUpload])

  // useEffect(() => {
  //   // console.log(fetchImageData(imageURL))
  //   if (imageRef.current) {
  //     console.log(fetchImageData(imageRef.current.src))
  //   }
  // }, [imageURL])

  const drawImageToCanvas =  (image) => {
    var canvas = document.getElementById('canvas');
    // console.log(canvas.width)
    var ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0,0);
    console.log(ctx.getImageData(0, 0, canvas.width, canvas.height))
  }



  return (
    <div className="App">
      <Button
    component = "label"
    type= "contained">
    <input
      type="file"
      accept="image/*"
      id="input"
      hidden
      onChange={handleFileChange.bind(this)}
    />  
    Upload image
    </Button>

    <img id="image-upload" ref={imageRef} alt="hello" style={{display: "none"}}></img>
    {/* <img id="image-upload" ref={imageRef} alt="hello"></img> */}
    <canvas id="canvas" ></canvas>

    </div>
  );
}

export default App;
