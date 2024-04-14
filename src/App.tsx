import { useEffect, useState, useRef } from 'react';
import './App.css';

type FacingMode = 'user' | 'environment';

function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [facingMode, setFacingMode] = useState<FacingMode | null>(null);
  const [location, setLocation] = useState<number[]>([]);
  const [imgSrc, setImgSrc] = useState<string>('');

  const takePhoto = async () => {
    const video = videoRef.current!;
    const width = video.videoWidth;
    const height = video.videoHeight;

    const canvas = canvasRef.current!;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    ctx.save();

    if (facingMode === 'user') {
      ctx.scale(-1, 1);
      ctx.drawImage(video, width * -1, 0, width, height);
    } else {
      ctx.drawImage(video, 0, 0);
    }

    ctx.restore();
    const src = canvas.toDataURL('image/webp');
    setImgSrc(src);
    console.log('img', src);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        setLocation([latitude, longitude]);
        console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
      });
    } else {
      console.log('Geolocation is not supported.');
    }
  };

  const startRecording = async (facingMode: FacingMode) => {
    setFacingMode(facingMode);
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode },
    });
    const video = videoRef.current!;
    video.srcObject = mediaStream;
    return await video.play();
  };

  const mounted = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter((d) => d.kind === 'videoinput');
    await startRecording(videoDevices.length === 1 ? 'user' : 'environment');
  };

  useEffect(() => {
    mounted();
  }, []);

  return (
    <>
      <h1>Parking Nomad</h1>
      <video
        ref={videoRef}
        className={`video ${facingMode === 'user' ? 'front' : ''}`}
      ></video>
      <canvas ref={canvasRef} className="canvas"></canvas>
      <button onClick={takePhoto} className="photo-button">
        spot!
      </button>
      <div>{JSON.stringify(location)}</div>
      {imgSrc && <img className="photo" src={imgSrc} alt="capture photo" />}
    </>
  );
}

export default App;
