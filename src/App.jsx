import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import logo from "./assets/transparent/Logo.png";
import listen from "./assets/transparent/Listen.png";
import gen from "./assets/transparent/gen.png";
import flash from "./assets/transparent/Flash.png";

function App() {
  const test = "asdasd";
  const [text, setText] = useState("");
  const videoRef = useRef(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [useWebcam, setUseWebcam] = useState(false);
  const [torchOn, setTorchOn] = useState(false);

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
    const imageBlob = await captureImage();
    if (!imageBlob) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("image", imageBlob, "webcam_image.jpg");

    try {
      const response = await fetch("http://127.0.0.1:5000/caption", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (response.ok) {
        setCaption(result.caption);
        setText(result.caption);
        // Trigger vibration
        if (navigator.vibrate) {
          navigator.vibrate([200, 100, 200]); // Vibrate pattern: vibrate for 200ms, pause for 100ms, then vibrate for 200ms
        }

        if (result.audioUrl) {
          setAudioUrl(result.audioUrl);

          // Automatically play the audio after setting the audio URL
          setTimeout(() => {
            handlePlayAudio();
          }, 100); // Small delay to ensure the audio element is ready
        } else {
          setAudioUrl("");
        }
      } else {
        console.error("Error:", result.error);
        setCaption("Failed to generate caption.");
        setText("Error " + result.error);
        setAudioUrl("");
      }
    } catch (error) {
      console.error("Error:", error);
      setCaption("An error occurred.");
      setText("Error " + error);
      setAudioUrl("");
    } finally {
      setLoading(false);
    }
  };

  const handleListen = () => {
    const value = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(value);
  };

  const toggleTorch = async () => {
    const videoTrack = videoRef.current?.srcObject
      ?.getVideoTracks()[0];

    if (videoTrack) {
      const capabilities = videoTrack.getCapabilities();

      if (capabilities.torch) {
        const settings = videoTrack.getSettings();
        await videoTrack.applyConstraints({
          advanced: [{ torch: !torchOn }],
        });
        setTorchOn(!torchOn);
      } else {
        console.error("Torch is not supported on this device");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="flex items-center justify-center mb-4">
        <img src={logo} alt="icadio-logo" className="w-[120px]" />
      </div>
      <div className="flex items-center justify-center w-[400px] h-[400px] bg-black mb-4">
        <video
          ref={videoRef}
          autoPlay
          className="w-full h-full object-cover"
        ></video>
      </div>
      <div className="flex items-center justify-center mb-4">
        {caption && (
          <div>
            <p>Caption: {caption}</p>
          </div>
        )}
      </div>
      <div className="flex items-center justify-center mb-4">
        <button onClick={handleGenerateCaption} disabled={loading}>
          {loading ? "Generating..." : <img src={gen} alt="gen-logo" className="w-[120px]" />}
        </button>
        <button onClick={handleListen} disabled={loading}>
          {loading ? "Captioning AI" : <img src={listen} alt="listen-logo" className="w-[120px]" />}
        </button>
        <div className="flex items-center justify-center mb-4">
        <button onClick={toggleTorch}>
          {torchOn ? <img src={flash} alt="listen-logo" className="w-[120px]" /> : <img src={flash} alt="listen-logo" className="w-[120px]" />}
        </button>
      </div>
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
