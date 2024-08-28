import React, { useEffect, useRef } from 'react';
import './App.css';
import logo from './assets/transparent/Logo-with-name.png';
import listen from './assets/transparent/Listen.png';

function App() {
  const videoRef = useRef(null);

  useEffect(() => {
    // Get the user's media (camera)
    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: { exact: 'environment' }, // Use the back camera on mobile devices
        },
      })
      .then((stream) => {
        // Set the stream to the video element
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.error("Error accessing the camera: ", err);
      });
  }, []);

  return (
    <div>
      <div className="flex items-center justify-center">
        <img src={logo} alt="icadio-logo" className="w-[120px]" />
      </div>
      <div className="flex items-center justify-center w-[400px] h-[400px] bg-black">
        <video ref={videoRef} autoPlay className="w-full h-full object-cover"></video>
      </div>
      <div className="flex items-center justify-center">
        <img src={listen} alt="listen-logo" className="w-[120px]" />
      </div>
    </div>
  );
}

export default App;
