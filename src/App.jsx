import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import logo from "./assets/transparent/Logo.png";

function App() {
  const [text, setText] = useState("");
  const videoRef = useRef(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [useWebcam, setUseWebcam] = useState(false);
  let startX = 0, startY = 0;

  useEffect(() => {
    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, [useWebcam]);

  const startCamera = () => {
    const constraints = {
      video: {
        facingMode: useWebcam ? "user" : { exact: "environment" },
      },
    };

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.error("Error accessing the camera: ", err);
      });
  };

  const captureImage = () => {
    const videoElement = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const context = canvas.getContext("2d");
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, "image/jpeg");
    });
  };

  const handleGenerateCaption = async () => {
    if (loading) return;

    const imageBlob = await captureImage();
    if (!imageBlob) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("image", imageBlob, "webcam_image.jpg");

    try {
      const response = await fetch("https://icadio-server.vercel.app/caption", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (response.ok) {
        setCaption(result.caption);
        setText(result.caption);

        // Trigger vibration when caption is ready
        if (navigator.vibrate) {
          navigator.vibrate([200, 100, 200]);
        }
      } else {
        console.error("Error:", result.error);
        setCaption("Failed to generate caption.");
        setText("Error " + result.error);
      }
    } catch (error) {
      console.error("Error:", error);
      setCaption("An error occurred.");
      setText("Error " + error);
    } finally {
      setLoading(false);
    }
  };

  const handleListen = () => {
    const value = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(value);
  };

  const toggleTorch = async () => {
    const videoTrack = videoRef.current?.srcObject?.getVideoTracks()[0];

    if (videoTrack) {
      const capabilities = videoTrack.getCapabilities();

      if (capabilities.torch) {
        await videoTrack.applyConstraints({
          advanced: [{ torch: !torchOn }],
        });
        setTorchOn(!torchOn);
      } else {
        console.error("Torch is not supported on this device");
      }
    }
  };

  const handleSwipe = (e) => {
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;

    const diffX = startX - endX;
    const diffY = startY - endY;

    if (Math.abs(diffX) > Math.abs(diffY)) {
      // Horizontal swipe
      if (diffX > 50) {
        // Swipe left or right to read the caption
        handleListen();
      } else if (diffX < -50) {
        handleListen();
      }
    } else {
      // Vertical swipe
      if (diffY > 50) {
        // Swipe up or down to toggle the torch
        toggleTorch();
      } else if (diffY < -50) {
        toggleTorch();
      }
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen"
      onTouchStart={(e) => {
        startX = e.changedTouches[0].clientX;
        startY = e.changedTouches[0].clientY;
      }}
      onTouchEnd={handleSwipe}
      onClick={handleGenerateCaption} // Single tap anywhere to generate caption
    >
      <div className="flex items-center justify-center mb-4">
        <img src={logo} alt="icadio-logo" className="w-[120px]" />
      </div>
      <div className="flex items-center justify-center w-[400px] h-[400px] bg-black mb-4">
        <video ref={videoRef} autoPlay className="w-full h-full object-cover"></video>
      </div>
      <div className="flex items-center justify-center mb-4">
        {caption && <p>Caption: {caption}</p>}
      </div>
      <div className="flex items-center justify-center mb-4">
        <button onClick={() => setUseWebcam((prev) => !prev)}>
          {useWebcam ? "Switch to Back Camera" : "Switch to Webcam"}
        </button>
      </div>
    </div>
  );
}

export default App;
