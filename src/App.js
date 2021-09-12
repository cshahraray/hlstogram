import logo from './logo.svg';
import './App.css';
import { useRef, useState } from 'react';

function App() {

  const imageRef = useRef(null)
  const [imageUpload, setImageUpload] = useState(null)
  const [imageURL, setImageURL] = useState(null)


  const handleFileChange = (e) => {
    setImageUpload(e.target.files[0])
    setImageURL(URL.createObjectURL(e.target.files[0]))
  }


  return (
    <div className="App">
     <input
      type="file"
      accept="image/*"
      id="input"
      hidden
      onChange={handleFileChange.bind(this)}
    />  
    </div>
  );
}

export default App;
