'use client'
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
gsap.registerPlugin(Draggable, InertiaPlugin);
interface Particle {
  element: HTMLDivElement;
  x: number;
  y: number;
  speed: number;
  angle: number;
  angleSpeed: number;
  amplitude: number;
  size: number;
  pulseSpeed: number;
  pulsePhase: number;
}
export default function Home() {
  const threeContainerRef = useRef<HTMLDivElement>(null);
  const loadingOverlayRef = useRef<HTMLDivElement>(null);
  const preloaderCanvasRef = useRef<HTMLCanvasElement>(null);
  const circularCanvasRef = useRef<HTMLCanvasElement>(null);
  const waveformCanvasRef = useRef<HTMLCanvasElement>(null);
  const spectrumCanvasRef = useRef<HTMLCanvasElement>(null);
  const timestampRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const stabilityBarRef = useRef<HTMLDivElement>(null);
  const stabilityValueRef = useRef<HTMLSpanElement>(null);
  const massValueRef = useRef<HTMLSpanElement>(null);
  const energyValueRef = useRef<HTMLSpanElement>(null);
  const varianceValueRef = useRef<HTMLSpanElement>(null);
  const statusIndicatorRef = useRef<HTMLSpanElement>(null);
  const peakValueRef = useRef<HTMLSpanElement>(null);
  const amplitudeValueRef = useRef<HTMLSpanElement>(null);
  const phaseValueRef = useRef<HTMLSpanElement>(null);
  const rotationSliderRef = useRef<HTMLInputElement>(null);
  const rotationValueRef = useRef<HTMLSpanElement>(null);
  const resolutionSliderRef = useRef<HTMLInputElement>(null);
  const resolutionValueRef = useRef<HTMLSpanElement>(null);
  const distortionSliderRef = useRef<HTMLInputElement>(null);
  const distortionValueRef = useRef<HTMLSpanElement>(null);
  const reactivitySliderRef = useRef<HTMLInputElement>(null);
  const reactivityValueRef = useRef<HTMLSpanElement>(null);
  const resetBtnRef = useRef<HTMLButtonElement>(null);
  const analyzeBtnRef = useRef<HTMLButtonElement>(null);
  const audioWaveRef = useRef<HTMLDivElement>(null);
  const floatingParticlesRef = useRef<HTMLDivElement>(null);
  const fileBtnRef = useRef<HTMLButtonElement>(null);
  const audioFileInputRef = useRef<HTMLInputElement>(null);
  const fileLabelRef = useRef<HTMLDivElement>(null);
  const sensitivitySliderRef = useRef<HTMLInputElement>(null);
  const sensitivityValueRef = useRef<HTMLSpanElement>(null);
  const audioControlsRef = useRef<HTMLDivElement>(null);
  const controlsRowRef = useRef<HTMLDivElement>(null);
  const audioPlayerRef = useRef<HTMLAudioElement>(null);
  const controlPanelRef = useRef<HTMLDivElement>(null);
  const controlPanelHandleRef = useRef<HTMLSpanElement>(null);
  const spectrumAnalyzerRef = useRef<HTMLDivElement>(null);
  const spectrumHandleRef = useRef<HTMLSpanElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioAnalyserRef = useRef<AnalyserNode | null>(null);
  const audioSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const audioDataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const frequencyDataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const isAudioInitializedRef = useRef(false);
  const audioContextStartedRef = useRef(false);
  const audioSourceConnectedRef = useRef(false);
  const currentAudioElementRef = useRef<HTMLAudioElement | null>(null);
  const currentAudioSrcRef = useRef<string | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const anomalyObjectRef = useRef<THREE.Group | null>(null);
  const clockRef = useRef(new THREE.Clock());
  const updateGlowRef = useRef<((time: number, audioLevel: number) => void) | null>(null);
  const updateParticlesRef = useRef<((time: number) => void) | null>(null);
  const distortionAmountRef = useRef(1.0);
  const resolutionRef = useRef(32);
  const audioReactivityRef = useRef(1.0);
  const audioSensitivityRef = useRef(5.0);
  const isAudioPlayingRef = useRef(false);
  let floatingParticles: Particle[] = [];
  const isDraggingAnomalyRef = useRef(false);
  const anomalyVelocityRef = useRef(new THREE.Vector2(0, 0));
  const anomalyTargetPositionRef = useRef(new THREE.Vector3(0, 0, 0));
  const anomalyOriginalPositionRef = useRef(new THREE.Vector3(0, 0, 0));
  const defaultCameraPositionRef = useRef(new THREE.Vector3(0, 0, 10));
  const zoomedCameraPositionRef = useRef(new THREE.Vector3(0, 0, 7));
  useEffect(() => {
    let animationFrameId: number;
    let particleAnimFrame: number;
    let waveformAnimFrame: number;
    const showNotification = (message: string) => {
      const notification = notificationRef.current;
      if (!notification) return;
      notification.textContent = message;
      notification.style.opacity = '1';
      setTimeout(() => {
        notification.style.opacity = '0';
      }, 3000);
    };
    function setupExpandingCirclesPreloader() {
      const canvas = preloaderCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas!.getContext("2d");
      if (!ctx) return;
      const centerX = canvas!.width / 2;
      const centerY = canvas!.height / 2;
      let time = 0;
      let lastTime = 0;
      const maxRadius = 80;
      const circleCount = 5;
      const dotCount = 24;
      let preloaderAnimFrame: number;
      function animate(timestamp: number) {
        if (!lastTime) lastTime = timestamp;
        const deltaTime = timestamp - lastTime;
        lastTime = timestamp;
        time += deltaTime * 0.001;
        ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
        ctx!.beginPath();
        ctx!.arc(centerX, centerY, 3, 0, Math.PI * 2);
        ctx!.fillStyle = "rgba(57, 255, 20, 0.9)";
        ctx!.fill();
        for (let c = 0; c < circleCount; c++) {
          const circlePhase = (time * 0.3 + c / circleCount) % 1;
          const radius = circlePhase * maxRadius;
          const opacity = 1 - circlePhase;
          ctx!.beginPath();
          ctx!.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx!.strokeStyle = `rgba(57, 255, 20, ${opacity * 0.2})`;
          ctx!.lineWidth = 1;
          ctx!.stroke();
          for (let i = 0; i < dotCount; i++) {
            const angle = (i / dotCount) * Math.PI * 2;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            const size = 2 * (1 - circlePhase * 0.5);
            ctx!.beginPath();
            ctx!.moveTo(centerX, centerY);
            ctx!.lineTo(x, y);
            ctx!.strokeStyle = `rgba(57, 255, 20, ${opacity * 0.1})`;
            ctx!.lineWidth = 1;
            ctx!.stroke();
            ctx!.beginPath();
            ctx!.arc(x, y, size, 0, Math.PI * 2);
            ctx!.fillStyle = `rgba(57, 255, 20, ${opacity * 0.9})`;
            ctx!.fill();
          }
        }
        if (loadingOverlayRef.current && loadingOverlayRef.current.style.display !== "none") {
          preloaderAnimFrame = requestAnimationFrame(animate);
        }
      }
      preloaderAnimFrame = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(preloaderAnimFrame);
    }
    function initFloatingParticles() {
      const container = floatingParticlesRef.current;
      if (!container) return;
      const numParticles = 1000;
      container.innerHTML = "";
      floatingParticles = [];
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const centerX = windowWidth / 2;
      const centerY = windowHeight / 2;
      for (let i = 0; i < numParticles; i++) {
        const particle = document.createElement("div");
        particle.className = "particle";
        particle.style.position = "absolute";
        particle.style.width = "1.5px";
        particle.style.height = "1.5px";
        particle.style.backgroundColor = `rgba(${Math.floor(Math.random() * 50) + 50
          }, 255, ${Math.floor(Math.random() * 50) + 50}, ${Math.random() * 0.5 + 0.2
          })`;
        particle.style.borderRadius = "50%";
        const minDistance = 200;
        const maxDistance = Math.max(windowWidth, windowHeight) * 0.8;
        const angle = Math.random() * Math.PI * 2;
        const distanceFactor = Math.sqrt(Math.random());
        const distance =
          minDistance + distanceFactor * (maxDistance - minDistance);
        const x = Math.cos(angle) * distance + centerX;
        const y = Math.sin(angle) * distance + centerY;
        particle.style.left = x + "px";
        particle.style.top = y + "px";
        const particleObj: Particle = {
          element: particle,
          x: x,
          y: y,
          speed: Math.random() * 0.5 + 0.1,
          angle: Math.random() * Math.PI * 2,
          angleSpeed: (Math.random() - 0.5) * 0.02,
          amplitude: Math.random() * 50 + 20,
          size: 1.5,
          pulseSpeed: Math.random() * 0.04 + 0.01,
          pulsePhase: Math.random() * Math.PI * 2
        };
        floatingParticles.push(particleObj);
        container.appendChild(particle);
      }
      animateFloatingParticles();
    }
    function animateFloatingParticles() {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      let time = 0;
      function updateParticles() {
        time += 0.01;
        floatingParticles.forEach((particle) => {
          particle.angle += particle.angleSpeed;
          const orbitX = centerX + Math.cos(particle.angle) * particle.amplitude;
          const orbitY = centerY + Math.sin(particle.angle) * particle.amplitude;
          const noiseX = Math.sin(time * particle.speed + particle.angle) * 5;
          const noiseY =
            Math.cos(time * particle.speed + particle.angle * 0.7) * 5;
          const newX = orbitX + noiseX;
          const newY = orbitY + noiseY;
          particle.element.style.left = newX + "px";
          particle.element.style.top = newY + "px";
          const pulseFactor =
            1 + Math.sin(time * particle.pulseSpeed + particle.pulsePhase) * 0.3;
          const newSize = particle.size * pulseFactor;
          particle.element.style.width = newSize + "px";
          particle.element.style.height = newSize + "px";
          const baseOpacity =
            0.2 +
            Math.sin(time * particle.pulseSpeed + particle.pulsePhase) * 0.1;
          particle.element.style.opacity = Math.min(0.8, baseOpacity).toString();
        });
        particleAnimFrame = requestAnimationFrame(updateParticles);
      }
      particleAnimFrame = requestAnimationFrame(updateParticles);
      return () => cancelAnimationFrame(particleAnimFrame);
    }
    function initAudio() {
      if (isAudioInitializedRef.current) return true;
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioAnalyserRef.current = audioContextRef.current.createAnalyser();
        audioAnalyserRef.current.fftSize = 2048;
        audioAnalyserRef.current.smoothingTimeConstant = 0.8;
        audioDataRef.current = new Uint8Array(audioAnalyserRef.current.frequencyBinCount);
        frequencyDataRef.current = new Uint8Array(audioAnalyserRef.current.frequencyBinCount);
        audioAnalyserRef.current.connect(audioContextRef.current.destination);
        isAudioInitializedRef.current = true;
        showNotification("Audio Analysis System Online");
        return true;
      } catch (error) {
        showNotification("Audio System Error");
        return false;
      }
    }
    function ensureAudioContextStarted() {
      if (!audioContextRef.current) {
        if (!initAudio()) return false;
      }
      if (audioContextRef.current && audioContextRef.current.state === "suspended") {
        audioContextRef.current
          .resume()
          .then(() => {
            if (!audioContextStartedRef.current) {
              audioContextStartedRef.current = true;
            }
          })
          .catch((err) => {
          });
      } else {
        audioContextStartedRef.current = true;
      }
      return true;
    }
    function cleanupAudioSource() {
      if (audioSourceRef.current) {
        try {
          audioSourceRef.current.disconnect();
          audioSourceConnectedRef.current = false;
          audioSourceRef.current = null;
        } catch (e) {
        }
      }
    }
    function createNewAudioElement() {
      if (currentAudioElementRef.current) {
        if (currentAudioElementRef.current.parentNode) {
          currentAudioElementRef.current.parentNode.removeChild(currentAudioElementRef.current);
        }
      }
      const newAudioElement = document.createElement("audio");
      newAudioElement.id = "audioPlayer";
      newAudioElement.className = "audioPlayer";
      newAudioElement.crossOrigin = "anonymous";
      if (audioControlsRef.current && controlsRowRef.current) {
        audioControlsRef.current.insertBefore(newAudioElement, controlsRowRef.current);
      } else if (audioPlayerRef.current && audioPlayerRef.current.parentElement) {
        audioPlayerRef.current.parentElement.insertBefore(newAudioElement, audioPlayerRef.current);
        audioPlayerRef.current.remove();
      }
      currentAudioElementRef.current = newAudioElement;
      return newAudioElement;
    }
    function setupAudioSource(audioElement: HTMLAudioElement) {
      try {
        if (!ensureAudioContextStarted()) {
          return false;
        }
        cleanupAudioSource();
        try {
          if (!audioSourceConnectedRef.current && audioContextRef.current) {
            audioSourceRef.current = audioContextRef.current.createMediaElementSource(audioElement);
            if (audioAnalyserRef.current) {
              audioSourceRef.current.connect(audioAnalyserRef.current);
            }
            audioSourceConnectedRef.current = true;
          }
          return true;
        } catch (error: any) {
          if (
            error.name === "InvalidStateError" &&
            error.message.includes("already connected")
          ) {
            return true;
          }
          return false;
        }
      } catch (error) {
        return false;
      }
    }
    function initAudioFile(file: File) {
      try {
        if (!isAudioInitializedRef.current && !initAudio()) {
          return;
        }
        const audioPlayer = createNewAudioElement();
        const fileURL = URL.createObjectURL(file);
        currentAudioSrcRef.current = fileURL;
        audioPlayer.src = fileURL;
        audioPlayer.onloadeddata = function () {
          if (setupAudioSource(audioPlayer)) {
            audioPlayer
              .play()
              .then(() => {
                isAudioPlayingRef.current = true;
                zoomCameraForAudio(true);
              })
              .catch((e) => {
              });
          }
        };
        audioPlayer.onended = function () {
          isAudioPlayingRef.current = false;
          zoomCameraForAudio(false);
        };
        if (fileLabelRef.current) fileLabelRef.current.textContent = file.name;
        showNotification("Audio File Loaded");
      } catch (error) {
        showNotification("Audio File Error");
      }
    }
    const circularCanvas = circularCanvasRef.current;
    const circularCtx = circularCanvas?.getContext("2d");
    function resizeCircularCanvas() {
      if (!circularCanvas || !circularCtx) return;
      circularCanvas.width = circularCanvas.offsetWidth;
      circularCanvas.height = circularCanvas.offsetHeight;
    }
    function drawCircularVisualizer() {
      if (!audioAnalyserRef.current || !circularCtx || !circularCanvas || !frequencyDataRef.current) return;
      const width = circularCanvas.width;
      const height = circularCanvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      circularCtx.clearRect(0, 0, width, height);
      audioAnalyserRef.current.getByteFrequencyData(frequencyDataRef.current);
      const numPoints = 180;
      const baseRadius = Math.min(width, height) * 0.4;
      circularCtx.beginPath();
      circularCtx.arc(centerX, centerY, baseRadius * 1.2, 0, Math.PI * 2);
      circularCtx.fillStyle = "rgba(57, 255, 20, 0.05)";
      circularCtx.fill();
      const numRings = 3;
      for (let ring = 0; ring < numRings; ring++) {
        const ringRadius = baseRadius * (0.7 + ring * 0.15);
        const opacity = 0.8 - ring * 0.2;
        circularCtx.beginPath();
        for (let i = 0; i < numPoints; i++) {
          const freqRangeStart = Math.floor(
            (ring * audioAnalyserRef.current.frequencyBinCount) / (numRings * 1.5)
          );
          const freqRangeEnd = Math.floor(
            ((ring + 1) * audioAnalyserRef.current.frequencyBinCount) / (numRings * 1.5)
          );
          const freqRange = freqRangeEnd - freqRangeStart;
          let sum = 0;
          const segmentSize = Math.floor(freqRange / numPoints);
          for (let j = 0; j < segmentSize; j++) {
            const freqIndex =
              freqRangeStart + ((i * segmentSize + j) % freqRange);
            sum += frequencyDataRef.current[freqIndex];
          }
          const value = sum / (segmentSize * 255);
          const adjustedValue = value * (audioSensitivityRef.current / 5) * audioReactivityRef.current;
          let dynamicRadius = ringRadius * (1 + adjustedValue * 0.5);
          dynamicRadius = Math.min(dynamicRadius, Math.min(width, height) * 0.5 - 10);
          const angle = (i / numPoints) * Math.PI * 2;
          const x = centerX + Math.cos(angle) * dynamicRadius;
          const y = centerY + Math.sin(angle) * dynamicRadius;
          if (i === 0) {
            circularCtx.moveTo(x, y);
          } else {
            circularCtx.lineTo(x, y);
          }
        }
        circularCtx.closePath();
        let gradient;
        if (ring === 0) {
          gradient = circularCtx.createRadialGradient(
            centerX,
            centerY,
            ringRadius * 0.8,
            centerX,
            centerY,
            ringRadius * 1.2
          );
          gradient.addColorStop(0, `rgba(57, 255, 20, ${opacity})`);
          gradient.addColorStop(1, `rgba(0, 200, 0, ${opacity * 0.7})`);
        } else if (ring === 1) {
          gradient = circularCtx.createRadialGradient(
            centerX,
            centerY,
            ringRadius * 0.8,
            centerX,
            centerY,
            ringRadius * 1.2
          );
          gradient.addColorStop(0, `rgba(0, 200, 0, ${opacity})`);
          gradient.addColorStop(1, `rgba(144, 238, 144, ${opacity * 0.7})`);
        } else {
          gradient = circularCtx.createRadialGradient(
            centerX,
            centerY,
            ringRadius * 0.8,
            centerX,
            centerY,
            ringRadius * 1.2
          );
          gradient.addColorStop(0, `rgba(144, 238, 144, ${opacity})`);
          gradient.addColorStop(1, `rgba(57, 255, 20, ${opacity * 0.7})`);
        }
        circularCtx.strokeStyle = gradient;
        circularCtx.lineWidth = 2 + (numRings - ring);
        circularCtx.stroke();
        circularCtx.shadowBlur = 15;
        circularCtx.shadowColor = "rgba(57, 255, 20, 0.7)";
      }
      circularCtx.shadowBlur = 0;
    }
    const spectrumCanvas = spectrumCanvasRef.current;
    const spectrumCtx = spectrumCanvas?.getContext("2d");
    function resizeSpectrumCanvas() {
      if (!spectrumCanvas || !spectrumCtx) return;
      spectrumCanvas.width = spectrumCanvas.offsetWidth;
      spectrumCanvas.height = spectrumCanvas.offsetHeight;
    }
    function drawSpectrumAnalyzer() {
      if (!audioAnalyserRef.current || !spectrumCtx || !spectrumCanvas || !frequencyDataRef.current) return;
      const width = spectrumCanvas.width;
      const height = spectrumCanvas.height;
      spectrumCtx.clearRect(0, 0, width, height);
      audioAnalyserRef.current.getByteFrequencyData(frequencyDataRef.current);
      const barWidth = width / 256;
      let x = 0;
      for (let i = 0; i < 256; i++) {
        const barHeight =
          (frequencyDataRef.current[i] / 255) * height * (audioSensitivityRef.current / 5);
        const hue = (i / 256) * 30 + 100;
        spectrumCtx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        spectrumCtx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
        x += barWidth;
      }
      spectrumCtx.strokeStyle = "rgba(57, 255, 20, 0.2)";
      spectrumCtx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        const y = height * (i / 4);
        spectrumCtx.beginPath();
        spectrumCtx.moveTo(0, y);
        spectrumCtx.lineTo(width, y);
        spectrumCtx.stroke();
      }
      for (let i = 0; i < 9; i++) {
        const x = width * (i / 8);
        spectrumCtx.beginPath();
        spectrumCtx.moveTo(x, 0);
        spectrumCtx.lineTo(x, height);
        spectrumCtx.stroke();
      }
      spectrumCtx.fillStyle = "rgba(57, 255, 20, 0.7)";
      spectrumCtx.font = '10px "TheGoodMonolith", monospace';
      spectrumCtx.textAlign = "center";
      const freqLabels = ["0", "1K", "2K", "4K", "8K", "16K"];
      for (let i = 0; i < freqLabels.length; i++) {
        const x = (width / (freqLabels.length - 1)) * i;
        spectrumCtx.fillText(freqLabels[i], x, height - 5);
      }
    }
    function updateAudioWave() {
      if (!audioAnalyserRef.current || !audioDataRef.current) return;
      audioAnalyserRef.current.getByteTimeDomainData(audioDataRef.current);
      let sum = 0;
      for (let i = 0; i < audioDataRef.current.length; i++) {
        sum += Math.abs(audioDataRef.current[i] - 128);
      }
      const average = sum / audioDataRef.current.length;
      const normalizedAverage = average / audioDataRef.current.length;
      const wave = audioWaveRef.current;
      if (!wave) return;
      const scale =
        1 + normalizedAverage * audioReactivityRef.current * (audioSensitivityRef.current / 5);
      wave.style.transform = `translate(-50%, -50%) scale(${scale})`;
      wave.style.borderColor = `rgba(57, 255, 20, ${0.1 + normalizedAverage * 0.3
        })`;
    }
    function calculateAudioMetrics() {
      if (!audioAnalyserRef.current || !frequencyDataRef.current || !audioContextRef.current) return;
      audioAnalyserRef.current.getByteFrequencyData(frequencyDataRef.current);
      let maxValue = 0;
      let maxIndex = 0;
      for (let i = 0; i < frequencyDataRef.current.length; i++) {
        if (frequencyDataRef.current[i] > maxValue) {
          maxValue = frequencyDataRef.current[i];
          maxIndex = i;
        }
      }
      const sampleRate = audioContextRef.current.sampleRate;
      const peakFrequency =
        (maxIndex * sampleRate) / (audioAnalyserRef.current.frequencyBinCount * 2);
      let sum = 0;
      for (let i = 0; i < frequencyDataRef.current.length; i++) {
        sum += frequencyDataRef.current[i];
      }
      const amplitude = sum / (frequencyDataRef.current.length * 255);
      if (peakValueRef.current) peakValueRef.current.textContent = `${Math.round(peakFrequency)} HZ`;
      if (amplitudeValueRef.current) amplitudeValueRef.current.textContent = amplitude.toFixed(2);
      const stabilityValue = 50 + Math.round(amplitude * 50);
      if (stabilityValueRef.current) stabilityValueRef.current.textContent = `${stabilityValue}%`;
      if (stabilityBarRef.current) stabilityBarRef.current.style.width = `${stabilityValue}%`;
      if (statusIndicatorRef.current) {
        if (stabilityValue < 40) {
          statusIndicatorRef.current.style.color = "#FF0000";
        } else if (stabilityValue < 70) {
          statusIndicatorRef.current.style.color = "#FFFF00";
        } else {
          statusIndicatorRef.current.style.color = "#39FF14";
        }
      }
      if (Math.random() < 0.05) {
        if (massValueRef.current) massValueRef.current.textContent = (1 + amplitude * 2).toFixed(3);
        if (energyValueRef.current) energyValueRef.current.textContent = `${(amplitude * 10).toFixed(1)}e8 J`;
        if (varianceValueRef.current) varianceValueRef.current.textContent = (amplitude * 0.01).toFixed(4);
        const phases = ["π/4", "π/2", "π/6", "3π/4"];
        if (phaseValueRef.current) phaseValueRef.current.textContent = phases[Math.floor(Math.random() * phases.length)];
      }
    }
    const handleUserClick = () => {
      if (!isAudioInitializedRef.current) {
        initAudio();
      } else if (audioContextRef.current && audioContextRef.current.state === "suspended") {
        audioContextRef.current.resume();
      }
    };
    document.addEventListener("click", handleUserClick);
    const loadingOverlay = loadingOverlayRef.current;
    if (loadingOverlay) {
      setTimeout(() => {
        loadingOverlay.style.opacity = '0';
        setTimeout(() => {
          loadingOverlay.style.display = "none";
          initAudio();
          initFloatingParticles();
          onWindowResize();
        }, 500);
      }, 3000);
    }
    setupExpandingCirclesPreloader();
    function updateTimestamp() {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      if (timestampRef.current) timestampRef.current.textContent = `Time: ${hours}:${minutes}:${seconds}`;
    }
    const timestampInterval = setInterval(updateTimestamp, 1000);
    updateTimestamp();
    const waveformCanvas = waveformCanvasRef.current;
    const waveformCtx = waveformCanvas?.getContext("2d");
    function resizeCanvas() {
      if (!waveformCanvas || !waveformCtx) return;
      waveformCanvas.width = waveformCanvas.offsetWidth * window.devicePixelRatio;
      waveformCanvas.height =
        waveformCanvas.offsetHeight * window.devicePixelRatio;
      waveformCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    function drawWaveform() {
      if (!waveformCanvas || !waveformCtx) return;
      const width = waveformCanvas.width / window.devicePixelRatio;
      const height = waveformCanvas.height / window.devicePixelRatio;
      waveformCtx.clearRect(0, 0, width, height);
      waveformCtx.fillStyle = "rgba(0, 0, 0, 0.2)";
      waveformCtx.fillRect(0, 0, width, height);
      if (audioAnalyserRef.current && audioDataRef.current) {
        audioAnalyserRef.current.getByteTimeDomainData(audioDataRef.current);
        waveformCtx.beginPath();
        waveformCtx.strokeStyle = "rgba(57, 255, 20, 0.8)";
        waveformCtx.lineWidth = 2;
        const sliceWidth = width / audioDataRef.current.length;
        let x = 0;
        for (let i = 0; i < audioDataRef.current.length; i++) {
          const v = audioDataRef.current[i] / 128.0;
          const y = (v * height) / 2;
          if (i === 0) {
            waveformCtx.moveTo(x, y);
          } else {
            waveformCtx.lineTo(x, y);
          }
          x += sliceWidth;
        }
        waveformCtx.stroke();
      } else {
        waveformCtx.beginPath();
        waveformCtx.strokeStyle = "rgba(57, 255, 20, 0.8)";
        waveformCtx.lineWidth = 1;
        const time = Date.now() / 1000;
        const sliceWidth = width / 100;
        let x = 0;
        for (let i = 0; i < 100; i++) {
          const t = i / 100;
          const y =
            height / 2 +
            Math.sin(t * 10 + time) * 5 +
            Math.sin(t * 20 + time * 1.5) * 3 +
            Math.sin(t * 30 + time * 0.5) * 7 +
            (Math.random() - 0.5) * 2;
          if (i === 0) {
            waveformCtx.moveTo(x, y);
          } else {
            waveformCtx.lineTo(x, y);
          }
          x += sliceWidth;
        }
        waveformCtx.stroke();
      }
      waveformAnimFrame = requestAnimationFrame(drawWaveform);
    }
    drawWaveform();
    function initThreeJS() {
      const threeContainer = threeContainerRef.current;
      if (!threeContainer) return;
      sceneRef.current = new THREE.Scene();
      sceneRef.current.fog = new THREE.FogExp2(0x000000, 0.05);
      cameraRef.current = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      cameraRef.current.position.copy(defaultCameraPositionRef.current);
      rendererRef.current = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        stencil: false,
        depth: true
      });
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      rendererRef.current.setClearColor(0x000000, 0);
      rendererRef.current.setPixelRatio(window.devicePixelRatio);
      threeContainer.appendChild(rendererRef.current.domElement);
      controlsRef.current = new OrbitControls(cameraRef.current, rendererRef.current.domElement);
      controlsRef.current.enableDamping = true;
      controlsRef.current.dampingFactor = 0.1;
      controlsRef.current.rotateSpeed = 0.5;
      controlsRef.current.zoomSpeed = 0.7;
      controlsRef.current.panSpeed = 0.8;
      controlsRef.current.minDistance = 3;
      controlsRef.current.maxDistance = 30;
      controlsRef.current.enableZoom = false;
      const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
      sceneRef.current.add(ambientLight);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
      directionalLight.position.set(1, 1, 1);
      sceneRef.current.add(directionalLight);
      const pointLight1 = new THREE.PointLight(0x39FF14, 1, 10);
      pointLight1.position.set(2, 2, 2);
      sceneRef.current.add(pointLight1);
      const pointLight2 = new THREE.PointLight(0x00FF00, 1, 10);
      pointLight2.position.set(-2, -2, -2);
      sceneRef.current.add(pointLight2);
      createAnomalyObject();
      createBackgroundParticles();
      window.addEventListener("resize", onWindowResize);
      setupAnomalyDragging();
      animate();
    }
    function zoomCameraForAudio(zoomIn: boolean) {
      if (!cameraRef.current) return;
      const targetPosition = zoomIn
        ? zoomedCameraPositionRef.current
        : defaultCameraPositionRef.current;
      gsap.to(cameraRef.current.position, {
        x: targetPosition.x,
        y: targetPosition.y,
        z: targetPosition.z,
        duration: 1.5,
        ease: "power2.inOut",
        onUpdate: function () {
          cameraRef.current?.lookAt(0, 0, 0);
        }
      });
    }
    function setupAnomalyDragging() {
      const container = threeContainerRef.current;
      if (!container || !cameraRef.current) return;
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();
      let isDragging = false;
      let dragStartPosition = new THREE.Vector2();
      anomalyOriginalPositionRef.current = new THREE.Vector3(0, 0, 0);
      anomalyTargetPositionRef.current = new THREE.Vector3(0, 0, 0);
      const maxDragDistance = 3;
      const onMouseDown = (event: MouseEvent) => {
        if (!cameraRef.current || !anomalyObjectRef.current) return;
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, cameraRef.current);
        const intersects = raycaster.intersectObject(anomalyObjectRef.current, true);
        if (intersects.length > 0) {
          if (controlsRef.current) controlsRef.current.enabled = false;
          isDragging = true;
          isDraggingAnomalyRef.current = true;
          dragStartPosition.x = mouse.x;
          dragStartPosition.y = mouse.y;
          showNotification("Anomaly Interaction Detected");
        }
      };
      const onMouseMove = (event: MouseEvent) => {
        if (isDragging) {
          mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
          mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
          const deltaX = (mouse.x - dragStartPosition.x) * 5;
          const deltaY = (mouse.y - dragStartPosition.y) * 5;
          anomalyTargetPositionRef.current.x += deltaX;
          anomalyTargetPositionRef.current.y += deltaY;
          const distance = Math.sqrt(
            anomalyTargetPositionRef.current.x * anomalyTargetPositionRef.current.x +
            anomalyTargetPositionRef.current.y * anomalyTargetPositionRef.current.y
          );
          if (distance > maxDragDistance) {
            const scale = maxDragDistance / distance;
            anomalyTargetPositionRef.current.x *= scale;
            anomalyTargetPositionRef.current.y *= scale;
          }
          anomalyVelocityRef.current.x = deltaX * 2;
          anomalyVelocityRef.current.y = deltaY * 2;
          dragStartPosition.x = mouse.x;
          dragStartPosition.y = mouse.y;
        }
      };
      const onMouseUp = () => {
        if (isDragging) {
          if (controlsRef.current) controlsRef.current.enabled = true;
          isDragging = false;
          isDraggingAnomalyRef.current = false;
        }
      };
      container.addEventListener("mousedown", onMouseDown);
      container.addEventListener("mousemove", onMouseMove);
      container.addEventListener("mouseup", onMouseUp);
      container.addEventListener("mouseleave", onMouseUp);
      return () => {
        container.removeEventListener("mousedown", onMouseDown);
        container.removeEventListener("mousemove", onMouseMove);
        container.removeEventListener("mouseup", onMouseUp);
        container.removeEventListener("mouseleave", onMouseUp);
      };
    }
    function createBackgroundParticles() {
      if (!sceneRef.current) return () => { };
      const particlesGeometry = new THREE.BufferGeometry();
      const particleCount = 3000;
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      const sizes = new Float32Array(particleCount);
      const color1 = new THREE.Color(0x39FF14);
      const color2 = new THREE.Color(0x00FF00);
      const color3 = new THREE.Color(0x90EE90);
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 100;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
        let color;
        const colorChoice = Math.random();
        if (colorChoice < 0.33) {
          color = color1;
        } else if (colorChoice < 0.66) {
          color = color2;
        } else {
          color = color3;
        }
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
        sizes[i] = 0.05;
      }
      particlesGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
      );
      particlesGeometry.setAttribute(
        "color",
        new THREE.BufferAttribute(colors, 3)
      );
      particlesGeometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
      const particlesMaterial = new THREE.ShaderMaterial({
        uniforms: {
          time: {
            value: 0
          }
        },
        vertexShader: `
          attribute float size;
          varying vec3 vColor;
          uniform float time;
          
          void main() {
            vColor = color;
            
            vec3 pos = position;
            pos.x += sin(time * 0.1 + position.z * 0.2) * 0.05;
            pos.y += cos(time * 0.1 + position.x * 0.2) * 0.05;
            pos.z += sin(time * 0.1 + position.y * 0.2) * 0.05;
            
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = size * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          varying vec3 vColor;
          
          void main() {
            float r = distance(gl_PointCoord, vec2(0.5, 0.5));
            if (r > 0.5) discard;
            
            float glow = 1.0 - (r * 2.0);
            glow = pow(glow, 2.0);
            
            gl_FragColor = vec4(vColor, glow);
          }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true
      });
      const particles = new THREE.Points(particlesGeometry, particlesMaterial);
      sceneRef.current.add(particles);
      return function updateParticles(time: number) {
        particlesMaterial.uniforms.time.value = time;
      };
    }
    function createAnomalyObject() {
      if (!sceneRef.current) return () => { };
      if (anomalyObjectRef.current) {
        sceneRef.current.remove(anomalyObjectRef.current);
      }
      anomalyObjectRef.current = new THREE.Group();
      const radius = 2;
      const outerGeometry = new THREE.IcosahedronGeometry(
        radius,
        Math.max(1, Math.floor(resolutionRef.current / 8))
      );
      const outerMaterial = new THREE.ShaderMaterial({
        uniforms: {
          time: {
            value: 0
          },
          color: {
            value: new THREE.Color(0x39FF14)
          },
          audioLevel: {
            value: 0
          },
          distortion: {
            value: distortionAmountRef.current
          }
        },
        vertexShader: `
      uniform float time;
      uniform float audioLevel;
      uniform float distortion;
      varying vec3 vNormal;
      varying vec3 vPosition;
      
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
      vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
      
      float snoise(vec3 v) {
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        
        vec3 i  = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);
        
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        
        i = mod289(i);
        vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));
            
        float n_ = 0.142857142857;
        vec3 ns = n_ * D.wyz - D.xzx;
        
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);
        
        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        
        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);
        
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
        
        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);
        
        vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;
        
        vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m*m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
      }
      
      void main() {
        vNormal = normalize(normalMatrix * normal);
        
        float slowTime = time * 0.3;
        vec3 pos = position;
        
        float noise = snoise(vec3(position.x * 0.5, position.y * 0.5, position.z * 0.5 + slowTime));
        pos += normal * noise * 0.2 * distortion * (1.0 + audioLevel);
        
        vPosition = pos;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
        fragmentShader: `
      uniform float time;
      uniform vec3 color;
      uniform float audioLevel;
      varying vec3 vNormal;
      varying vec3 vPosition;
      
      void main() {
        vec3 viewDirection = normalize(cameraPosition - vPosition);
        float fresnel = 1.0 - max(0.0, dot(viewDirection, vNormal));
        fresnel = pow(fresnel, 2.0 + audioLevel * 2.0);
        
        float pulse = 0.8 + 0.2 * sin(time * 2.0);
        
        vec3 finalColor = color * fresnel * pulse * (1.0 + audioLevel * 0.8);
        
        float alpha = fresnel * (0.7 - audioLevel * 0.3);
        
        gl_FragColor = vec4(finalColor, alpha);
      }
    `,
        wireframe: true,
        transparent: true
      });
      const outerSphere = new THREE.Mesh(outerGeometry, outerMaterial);
      anomalyObjectRef.current.add(outerSphere);
      sceneRef.current.add(anomalyObjectRef.current);
      const glowGeometry = new THREE.SphereGeometry(radius * 1.2, 32, 32);
      const glowMaterial = new THREE.ShaderMaterial({
        uniforms: {
          time: {
            value: 0
          },
          color: {
            value: new THREE.Color(0x39FF14)
          },
          audioLevel: {
            value: 0
          }
        },
        vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      uniform float audioLevel;
      
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = position * (1.0 + audioLevel * 0.2);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);
      }
    `,
        fragmentShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      uniform vec3 color;
      uniform float time;
      uniform float audioLevel;
      
      void main() {
        vec3 viewDirection = normalize(cameraPosition - vPosition);
        float fresnel = 1.0 - max(0.0, dot(viewDirection, vNormal));
        fresnel = pow(fresnel, 3.0 + audioLevel * 3.0);
        
        float pulse = 0.5 + 0.5 * sin(time * 2.0);
        float audioFactor = 1.0 + audioLevel * 3.0;
        
        vec3 finalColor = color * fresnel * (0.8 + 0.2 * pulse) * audioFactor;
        
        float alpha = fresnel * (0.3 * audioFactor) * (1.0 - audioLevel * 0.2);
        
        gl_FragColor = vec4(finalColor, alpha);
      }
    `,
        transparent: true,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const glowSphere = new THREE.Mesh(glowGeometry, glowMaterial);
      anomalyObjectRef.current.add(glowSphere);
      return function updateAnomaly(time: number, audioLevel: number) {
        outerMaterial.uniforms.time.value = time;
        outerMaterial.uniforms.audioLevel.value = audioLevel;
        outerMaterial.uniforms.distortion.value = distortionAmountRef.current;
        glowMaterial.uniforms.time.value = time;
        glowMaterial.uniforms.audioLevel.value = audioLevel;
      };
    }
    function updateWireframeDistortion(amount: number) {
      distortionAmountRef.current = amount;
      updateGlowRef.current = createAnomalyObject();
    }
    function updateWireframeResolution(newResolution: number) {
      resolutionRef.current = newResolution;
      updateGlowRef.current = createAnomalyObject();
    }
    function onWindowResize() {
      if (cameraRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        cameraRef.current.updateProjectionMatrix();
      }
      if (rendererRef.current) {
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      }
      resizeCanvas();
      resizeCircularCanvas();
      resizeSpectrumCanvas();
    }
    function updateAnomalyPosition() {
      if (!anomalyObjectRef.current) return;
      if (!isDraggingAnomalyRef.current) {
        anomalyVelocityRef.current.x *= 0.95;
        anomalyVelocityRef.current.y *= 0.95;
        anomalyTargetPositionRef.current.x += anomalyVelocityRef.current.x * 0.1;
        anomalyTargetPositionRef.current.y += anomalyVelocityRef.current.y * 0.1;
        const springStrength = 0.1;
        anomalyVelocityRef.current.x -= anomalyTargetPositionRef.current.x * springStrength;
        anomalyVelocityRef.current.y -= anomalyTargetPositionRef.current.y * springStrength;
        if (
          Math.abs(anomalyTargetPositionRef.current.x) < 0.05 &&
          Math.abs(anomalyTargetPositionRef.current.y) < 0.05
        ) {
          anomalyTargetPositionRef.current.set(0, 0, 0);
          anomalyVelocityRef.current.set(0, 0);
        }
        const bounceThreshold = 3;
        const bounceDamping = 0.8;
        if (Math.abs(anomalyTargetPositionRef.current.x) > bounceThreshold) {
          anomalyVelocityRef.current.x = -anomalyVelocityRef.current.x * bounceDamping;
          anomalyTargetPositionRef.current.x =
            Math.sign(anomalyTargetPositionRef.current.x) * bounceThreshold;
        }
        if (Math.abs(anomalyTargetPositionRef.current.y) > bounceThreshold) {
          anomalyVelocityRef.current.y = -anomalyVelocityRef.current.y * bounceDamping;
          anomalyTargetPositionRef.current.y =
            Math.sign(anomalyTargetPositionRef.current.y) * bounceThreshold;
        }
      }
      anomalyObjectRef.current.position.x +=
        (anomalyTargetPositionRef.current.x - anomalyObjectRef.current.position.x) * 0.2;
      anomalyObjectRef.current.position.y +=
        (anomalyTargetPositionRef.current.y - anomalyObjectRef.current.position.y) * 0.2;
      if (!isDraggingAnomalyRef.current) {
        anomalyObjectRef.current.rotation.x += anomalyVelocityRef.current.y * 0.01;
        anomalyObjectRef.current.rotation.y += anomalyVelocityRef.current.x * 0.01;
      }
    }
    function animate() {
      animationFrameId = requestAnimationFrame(animate);
      if (controlsRef.current) controlsRef.current.update();
      const time = clockRef.current.getElapsedTime();
      let audioLevel = 0;
      if (audioAnalyserRef.current && frequencyDataRef.current) {
        audioAnalyserRef.current.getByteFrequencyData(frequencyDataRef.current);
        let sum = 0;
        for (let i = 0; i < frequencyDataRef.current.length; i++) {
          sum += frequencyDataRef.current[i];
        }
        audioLevel = ((sum / frequencyDataRef.current.length / 255) * audioSensitivityRef.current) / 5;
        drawCircularVisualizer();
        drawSpectrumAnalyzer();
        updateAudioWave();
        calculateAudioMetrics();
      }
      updateAnomalyPosition();
      if (updateGlowRef.current) {
        updateGlowRef.current(time, audioLevel);
      }
      if (updateParticlesRef.current) {
        updateParticlesRef.current(time);
      }
      const rotationSpeed = rotationSliderRef.current ? parseFloat(rotationSliderRef.current.value) : 1.0;
      if (anomalyObjectRef.current) {
        const audioRotationFactor = 1 + audioLevel * audioReactivityRef.current;
        anomalyObjectRef.current.rotation.y += 0.005 * rotationSpeed * audioRotationFactor;
        anomalyObjectRef.current.rotation.z += 0.002 * rotationSpeed * audioRotationFactor;
      }
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    }
    initThreeJS();
    updateParticlesRef.current = createBackgroundParticles();
    updateGlowRef.current = createAnomalyObject();
    const handleRotation = (e: Event) => {
      if (rotationValueRef.current) rotationValueRef.current.textContent = (e.target as HTMLInputElement).value;
    };
    const handleResolution = (e: Event) => {
      const value = parseInt((e.target as HTMLInputElement).value);
      if (resolutionValueRef.current) resolutionValueRef.current.textContent = value.toString();
      updateWireframeResolution(value);
    };
    const handleDistortion = (e: Event) => {
      const value = parseFloat((e.target as HTMLInputElement).value);
      if (distortionValueRef.current) distortionValueRef.current.textContent = value.toFixed(1);
      updateWireframeDistortion(value);
    };
    const handleReactivity = (e: Event) => {
      audioReactivityRef.current = parseFloat((e.target as HTMLInputElement).value);
      if (reactivityValueRef.current) reactivityValueRef.current.textContent = audioReactivityRef.current.toFixed(1);
    };
    const handleSensitivity = (e: Event) => {
      audioSensitivityRef.current = parseFloat((e.target as HTMLInputElement).value);
      if (sensitivityValueRef.current) sensitivityValueRef.current.textContent = audioSensitivityRef.current.toString();
    };
    rotationSliderRef.current?.addEventListener("input", handleRotation);
    resolutionSliderRef.current?.addEventListener("input", handleResolution);
    distortionSliderRef.current?.addEventListener("input", handleDistortion);
    reactivitySliderRef.current?.addEventListener("input", handleReactivity);
    sensitivitySliderRef.current?.addEventListener("input", handleSensitivity);
    const handleReset = () => {
      if (rotationSliderRef.current) rotationSliderRef.current.value = "1.0";
      if (rotationValueRef.current) rotationValueRef.current.textContent = "1.0";
      if (resolutionSliderRef.current) resolutionSliderRef.current.value = "32";
      if (resolutionValueRef.current) resolutionValueRef.current.textContent = "32";
      if (distortionSliderRef.current) distortionSliderRef.current.value = "1.0";
      if (distortionValueRef.current) distortionValueRef.current.textContent = "1.0";
      if (reactivitySliderRef.current) reactivitySliderRef.current.value = "1.0";
      if (reactivityValueRef.current) reactivityValueRef.current.textContent = "1.0";
      audioReactivityRef.current = 1.0;
      if (sensitivitySliderRef.current) sensitivitySliderRef.current.value = "5.0";
      if (sensitivityValueRef.current) sensitivityValueRef.current.textContent = "5.0";
      audioSensitivityRef.current = 5.0;
      distortionAmountRef.current = 1.0;
      resolutionRef.current = 32;
      updateGlowRef.current = createAnomalyObject();
      anomalyTargetPositionRef.current.set(0, 0, 0);
      anomalyVelocityRef.current.set(0, 0);
      if (anomalyObjectRef.current) anomalyObjectRef.current.position.set(0, 0, 0);
      showNotification("Settings Reset To Default Values");
    };
    resetBtnRef.current?.addEventListener("click", handleReset);
    const handleAnalyze = () => {
      const btn = analyzeBtnRef.current;
      if (!btn) return;
      btn.textContent = "Analyzing...";
      btn.disabled = true;
      if (stabilityBarRef.current) stabilityBarRef.current.style.width = "45%";
      if (stabilityValueRef.current) stabilityValueRef.current.textContent = "45%";
      if (statusIndicatorRef.current) statusIndicatorRef.current.style.color = "#FFFF00";
      setTimeout(() => {
        btn.textContent = "Analyze";
        btn.disabled = false;
        showNotification("Anomaly Analysis Complete");
        if (massValueRef.current) massValueRef.current.textContent = (Math.random() * 2 + 1).toFixed(3);
        if (energyValueRef.current) energyValueRef.current.textContent = (Math.random() * 9 + 1).toFixed(1) + "e8 J";
        if (varianceValueRef.current) varianceValueRef.current.textContent = (Math.random() * 0.01).toFixed(4);
        if (peakValueRef.current) peakValueRef.current.textContent = (Math.random() * 200 + 100).toFixed(1) + " HZ";
        if (amplitudeValueRef.current) amplitudeValueRef.current.textContent = (Math.random() * 0.5 + 0.3).toFixed(2);
        const phases = ["π/4", "π/2", "π/6", "3π/4"];
        if (phaseValueRef.current) phaseValueRef.current.textContent = phases[Math.floor(Math.random() * phases.length)];
      }, 3000);
    };
    analyzeBtnRef.current?.addEventListener("click", handleAnalyze);
    const handleFileClick = () => {
      if (!isAudioInitializedRef.current) {
        initAudio();
      }
      if (audioContextRef.current && audioContextRef.current.state === "suspended") {
        audioContextRef.current.resume();
      }
      audioFileInputRef.current?.click();
    };
    fileBtnRef.current?.addEventListener("click", handleFileClick);
    const handleFileChange = (e: Event) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        const file = files[0];
        initAudioFile(file);
      }
    };
    audioFileInputRef.current?.addEventListener("change", handleFileChange);
    function makePanelDraggable(element: HTMLElement | null, handle: HTMLElement | null = null) {
      if (!element) return;
      Draggable.create(element, {
        type: "x,y",
        edgeResistance: 0.65,
        bounds: document.body,
        handle: handle || element,
        inertia: true,
        throwResistance: 0.85,
        onDragStart: function () {
          const panels = document.querySelectorAll(
            ".controlPanel, .spectrumAnalyzer, .dataPanel"
          );
          let maxZ = 10;
          panels.forEach((panel) => {
            if (panel instanceof HTMLElement) {
              const z = parseInt(window.getComputedStyle(panel).zIndex) || 10;
              if (z > maxZ) maxZ = z;
            }
          });
          element.style.zIndex = (maxZ + 1).toString();
        }
      });
    }
    makePanelDraggable(
      controlPanelRef.current,
      controlPanelHandleRef.current
    );
    makePanelDraggable(
      spectrumAnalyzerRef.current,
      spectrumHandleRef.current
    );
    const dataPanels = document.querySelectorAll('.dataPanel');
    dataPanels.forEach(panel => makePanelDraggable(panel as HTMLElement));
    return () => {
      cancelAnimationFrame(animationFrameId);
      cancelAnimationFrame(waveformAnimFrame);
      if (particleAnimFrame) cancelAnimationFrame(particleAnimFrame);
      clearInterval(timestampInterval);
      document.removeEventListener("click", handleUserClick);
      rotationSliderRef.current?.removeEventListener("input", handleRotation);
      resolutionSliderRef.current?.removeEventListener("input", handleResolution);
      distortionSliderRef.current?.removeEventListener("input", handleDistortion);
      reactivitySliderRef.current?.removeEventListener("input", handleReactivity);
      sensitivitySliderRef.current?.removeEventListener("input", handleSensitivity);
      resetBtnRef.current?.removeEventListener("click", handleReset);
      analyzeBtnRef.current?.removeEventListener("click", handleAnalyze);
      fileBtnRef.current?.removeEventListener("click", handleFileClick);
      audioFileInputRef.current?.removeEventListener("change", handleFileChange);
      window.removeEventListener("resize", onWindowResize);
      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (rendererRef.current.domElement.parentElement) {
          rendererRef.current.domElement.parentElement.removeChild(rendererRef.current.domElement);
        }
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (currentAudioElementRef.current && currentAudioElementRef.current.parentNode) {
        currentAudioElementRef.current.parentNode.removeChild(currentAudioElementRef.current);
      }
      sceneRef.current = null;
      cameraRef.current = null;
      rendererRef.current = null;
      controlsRef.current = null;
      anomalyObjectRef.current = null;
      audioContextRef.current = null;
      audioAnalyserRef.current = null;
      audioSourceRef.current = null;
      if (controlPanelRef.current) Draggable.get(controlPanelRef.current)?.kill();
      if (spectrumAnalyzerRef.current) Draggable.get(spectrumAnalyzerRef.current)?.kill();
      dataPanels.forEach(panel => Draggable.get(panel as HTMLElement)?.kill());
    };
  }, []);
  return (
    <>
      <style jsx global>{`
        :root {
          --bg-color: #000000;
          --grid-color: rgba(57, 255, 20, 0.05);
          --text-primary: #e0e0e0;
          --text-secondary: #a0a0a0;
          --text-highlight: #ffffff;
          --accent-primary: #39FF14;
          --accent-secondary: #90EE90;
          --accent-tertiary: #C1FFC1;
          --panel-bg: rgba(10, 20, 10, 0.7);
          --panel-border: rgba(57, 255, 20, 0.3);
          --panel-highlight: rgba(57, 255, 20, 0.1);
          --scanner-line: rgba(57, 255, 20, 0.7);
        }
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          background-color: var(--bg-color);
          color: var(--text-primary);
          overflow: hidden;
          height: 100vh;
          text-transform: uppercase;
          font-size: 1rem;
        }
        button,
        input,
        select,
        textarea {
          font-family: inherit;
        }
        .spaceBackground {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          z-index: 0;
        }
        #threeContainer {
          position: absolute;
          width: 100%;
          height: 100%;
          z-index: 1;
          cursor: grab;
        }
        #threeContainer:active {
          cursor: grabbing;
        }
        .interfaceContainer {
          position: relative;
          width: 100%;
          height: 100vh;
          z-index: 2;
          pointer-events: none;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .gridOverlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: linear-gradient(
              to right,
              var(--grid-color) 0.0625rem,
              transparent 0.0625rem
            ),
            linear-gradient(to bottom, var(--grid-color) 0.0625rem, transparent 0.0625rem);
          background-size: 2.5rem 2.5rem;
          pointer-events: none;
          z-index: 0;
          display: none;
        }
        .header {
          display: flex;
          justify-content: space-between;
          padding: 1.25rem;
        }
        .headerItem {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }
        .dataPanels {
          display: flex;
          justify-content: space-between;
          padding: 0 1.25rem;
          margin-bottom: 1.25rem;
        }
        .dataPanel {
          width: 22vw;
          min-width: 18rem;
          background: var(--panel-bg);
          border: 1px solid var(--panel-border);
          border-radius: 0.3125rem;
          padding: 0.9375rem;
          backdrop-filter: blur(0.5rem);
          pointer-events: auto;
          box-shadow: 0 0 1rem var(--panel-highlight);
        }
        .dataPanelTitle {
          font-size: 0.875rem;
          color: var(--accent-primary);
          margin-bottom: 0.625rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .dataReadouts {
          margin-top: 0.625rem;
        }
        .dataRow {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.3125rem;
          font-size: 0.75rem;
        }
        .dataLabel {
          color: var(--text-secondary);
        }
        .dataValue {
          color: var(--text-primary);
        }
        .dataBar {
          height: 0.375rem;
          background: rgba(255, 255, 255, 0.1);
          margin: 0.625rem 0;
          position: relative;
          border-radius: 0.1875rem;
        }
        .dataBarFill {
          height: 100%;
          background: var(--accent-primary);
          border-radius: 0.1875rem;
          transition: width 0.5s;
          box-shadow: 0 0 0.5rem var(--accent-primary);
        }
        .waveform {
          width: 100%;
          height: 3.125rem;
          margin: 0.625rem 0;
          display: flex;
          align-items: center;
          position: relative;
        }
        .waveformCanvas {
          width: 100%;
          height: 100%;
        }
        .controlPanel {
          width: 22vw;
          min-width: 18rem;
          background: var(--panel-bg);
          border: 1px solid var(--panel-border);
          border-radius: 0.3125rem;
          padding: 0.9375rem;
          position: absolute;
          backdrop-filter: blur(0.5rem);
          pointer-events: auto;
          z-index: 10;
          box-shadow: 0 0 1rem var(--panel-highlight);
        }
        .controlPanel h3 {
          font-size: 0.875rem;
          color: var(--accent-primary);
          margin-bottom: 0.9375rem;
        }
        .controlGroup {
          margin-bottom: 0.9375rem;
        }
        .controlRow {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }
        .controlLabel {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }
        .controlValue {
          font-size: 0.75rem;
          color: var(--text-primary);
        }
        .sliderContainer {
          width: 100%;
          display: flex;
          flex-direction: column;
        }
        .slider {
          -webkit-appearance: none;
          width: 100%;
          height: 0.375rem;
          background: rgba(255, 255, 255, 0.1);
          outline: none;
          border-radius: 0.1875rem;
        }
        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 0.75rem;
          height: 0.75rem;
          border-radius: 50%;
          background: var(--accent-primary);
          cursor: pointer;
          box-shadow: 0 0 0.5rem var(--accent-primary);
        }
        .buttons {
          display: flex;
          gap: 0.625rem;
          margin-top: 0.9375rem;
        }
        .btn {
          flex: 1;
          padding: 0.5rem 0;
          background: var(--panel-highlight);
          border: 1px solid var(--panel-border);
          color: var(--accent-primary);
          font-size: 0.75rem;
          border-radius: 0.1875rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn:hover {
          background: var(--panel-border);
          box-shadow: 0 0 0.625rem var(--accent-primary);
        }
        .panelHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-direction: row;
          margin-bottom: 1rem;
        }
        .loadingOverlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: var(--bg-color);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          transition: opacity 0.5s;
        }
        .loadingContainer {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 90vw;
          max-width: 31.25rem;
          padding: 1.25rem;
        }
        .preloaderCanvasContainer {
          width: 11.25rem;
          height: 11.25rem;
          aspect-ratio: 1 / 1;
          position: relative;
        }
        .loadingText {
          margin-top: 1.25rem;
          text-align: center;
          color: var(--accent-primary);
          letter-spacing: 0.125rem;
          font-size: 0.875rem;
        }
        .notification {
          position: fixed;
          top: 1.25rem;
          left: 50%;
          transform: translateX(-50%);
          background: var(--panel-bg);
          border: 1px solid var(--panel-border);
          padding: 0.625rem 1.25rem;
          border-radius: 0.3125rem;
          font-size: 0.75rem;
          color: var(--accent-primary);
          opacity: 0;
          transition: opacity 0.3s;
          z-index: 100;
          box-shadow: 0 0 1rem var(--panel-highlight);
        }
        .dragHandle {
          cursor: move;
          width: auto;
          height: 100%;
          color: var(--accent-primary);
        }
        .particleTrail {
          position: absolute;
          width: 0.625rem;
          height: 0.625rem;
          border-radius: 50%;
          pointer-events: none;
          opacity: 0.7;
          transition: opacity 0.5s;
        }
        .circularVisualizer {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: min(90vw, 90vh);
          height: min(90vw, 90vh);
          pointer-events: none;
          z-index: 5;
        }
        .circularVisualizer canvas {
          width: 100%;
          height: 100%;
        }
        .audioWave {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 95vw;
          max-width: 31.25rem;
          aspect-ratio: 1 / 1;
          height: auto;
          border-radius: 50%;
          background: transparent;
          border: 0.0625rem solid rgba(57, 255, 20, 0.1);
          pointer-events: none;
          z-index: 3;
        }
        .audioWave::before {
          content: "";
        }
        .spectrumAnalyzer {
          position: absolute;
          width: 22vw;
          min-width: 18rem;
          background: var(--panel-bg);
          border: 1px solid var(--panel-border);
          border-radius: 0.3125rem;
          overflow: hidden;
          pointer-events: auto;
          z-index: 10;
          box-shadow: 0 0 1rem var(--panel-highlight);
        }
        .spectrumHeader {
          padding: 0.5rem 0.625rem;
          background: rgba(0, 0, 0, 0.3);
          font-size: 0.875rem;
          color: var(--accent-primary);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .spectrumContent {
          padding: 0.625rem;
          position: relative;
        }
        .spectrumCanvas {
          width: 100%;
          height: 7.5rem;
          display: block;
        }
        .audioControls {
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
          margin-top: 0.9375rem;
          padding: 0 0.625rem 0.625rem;
        }
        .audioFileInput {
          display: none;
        }
        .audioFileBtn {
          display: block;
          padding: 0.5rem 0;
          background: var(--panel-highlight);
          border: 1px solid var(--panel-border);
          color: var(--accent-primary);
          font-size: 0.75rem;
          border-radius: 0.1875rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .audioFileLabel {
          display: block;
          padding: 0.5rem 0.625rem;
          background: rgba(0, 0, 0, 0.2);
          color: var(--accent-primary);
          font-size: 0.75rem;
          border-radius: 0.1875rem;
          margin-bottom: 0.625rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .audioPlayer {
          width: 100%;
          margin-bottom: 0.625rem;
        }
        .controlsRow {
          display: flex;
          gap: 0.625rem;
          margin-bottom: 0.625rem;
        }
        .audioSensitivityLabel {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.3125rem;
          font-size: 0.75rem;
        }
        .audioSensitivityValue {
          color: var(--accent-primary);
        }
        .preloaderCanvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        .floatingParticles {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 4;
        }
        .dataPanel,
        .controlPanel,
        .spectrumAnalyzer {
          position: absolute !important;
          transform: none !important;
        }
        .dataPanel[data-position="top-left"] {
          top: 1.25rem;
          left: 1.25rem;
        }
        .dataPanel[data-position="top-right"] {
          top: 1.25rem;
          right: 1.25rem;
        }
        .controlPanel {
          bottom: 1.25rem;
          left: 1.25rem;
        }
        .spectrumAnalyzer {
          bottom: 1.25rem;
          right: 1.25rem;
        }
      `}</style>
      <div className="spaceBackground"></div>
      <div className="loadingOverlay" id="loadingOverlay" ref={loadingOverlayRef}>
        <div className="loadingContainer">
          <div className="preloaderCanvasContainer">
            <canvas id="preloaderCanvas" className="preloaderCanvas" width="180" height="180" ref={preloaderCanvasRef}></canvas>
          </div>
          <div className="loadingText">Initializing Scanner</div>
        </div>
      </div>
      <div className="notification" id="notification" ref={notificationRef}>Notification</div>
      <div id="threeContainer" ref={threeContainerRef}></div>
      <div className="gridOverlay"></div>
      <div className="circularVisualizer">
        <canvas id="circularCanvas" ref={circularCanvasRef}></canvas>
      </div>
      <div className="audioWave" id="audioWave" ref={audioWaveRef}></div>
      <div className="floatingParticles" id="floatingParticles" ref={floatingParticlesRef}></div>
      <div className="interfaceContainer">
        <div className="header">
          <div className="headerItem"></div>
          <div className="headerItem"></div>
          <div className="headerItem" id="timestamp" ref={timestampRef}>Time: 00:00:00</div>
        </div>
      </div>
      <div className="dataPanel" data-position="top-left">
        <div className="dataPanelTitle">
          <span>Anomaly Metrics</span>
          <span id="statusIndicator" ref={statusIndicatorRef}>●</span>
        </div>
        <div className="dataBar">
          <div className="dataBarFill" id="stabilityBar" style={{ width: '75%' }} ref={stabilityBarRef}></div>
        </div>
        <div className="dataReadouts">
          <div className="dataRow">
            <span className="dataLabel">Stability Index:</span>
            <span className="dataValue" id="stabilityValue" ref={stabilityValueRef}>75%</span>
          </div>
          <div className="dataRow">
            <span className="dataLabel">Mass Coefficient:</span>
            <span className="dataValue" id="massValue" ref={massValueRef}>1.728</span>
          </div>
          <div className="dataRow">
            <span className="dataLabel">Energy Signature:</span>
            <span className="dataValue" id="energyValue" ref={energyValueRef}>5.3e8 J</span>
          </div>
          <div className="dataRow">
            <span className="dataLabel">Quantum Variance:</span>
            <span className="dataValue" id="varianceValue" ref={varianceValueRef}>0.0042</span>
          </div>
        </div>
      </div>
      <div className="dataPanel" data-position="top-right">
        <div className="dataPanelTitle">Anomaly Metrics</div>
        <div className="waveform">
          <canvas id="waveformCanvas" className="waveformCanvas" ref={waveformCanvasRef}></canvas>
        </div>
        <div className="dataReadouts">
          <div className="dataRow">
            <span className="dataLabel">Peak Frequency:</span>
            <span className="dataValue" id="peakValue" ref={peakValueRef}>127.3 HZ</span>
          </div>
          <div className="dataRow">
            <span className="dataLabel">Amplitude:</span>
            <span className="dataValue" id="amplitudeValue" ref={amplitudeValueRef}>0.56</span>
          </div>
          <div className="dataRow">
            <span className="dataLabel">Phase Shift:</span>
            <span className="dataValue" id="phaseValue" ref={phaseValueRef}>π/4</span>
          </div>
        </div>
      </div>
      <div className="controlPanel" ref={controlPanelRef}>
        <div className="panelHeader">
          <span className="dataPanelTitle">Anomaly Controls</span>
          <span className="dragHandle" id="controlPanelHandle" ref={controlPanelHandleRef}>⋮⋮</span>
        </div>
        <div className="controlGroup">
          <div className="controlRow">
            <span className="controlLabel">Rotation Speed</span>
            <span className="controlValue" id="rotationValue" ref={rotationValueRef}>1.0</span>
          </div>
          <div className="sliderContainer">
            <input type="range" min="0" max="5" defaultValue="1" step="0.1" className="slider" id="rotationSlider" ref={rotationSliderRef} />
          </div>
        </div>
        <div className="controlGroup">
          <div className="controlRow">
            <span className="controlLabel">Resolution</span>
            <span className="controlValue" id="resolutionValue" ref={resolutionValueRef}>32</span>
          </div>
          <div className="sliderContainer">
            <input type="range" min="12" max="64" defaultValue="32" step="4" className="slider" id="resolutionSlider" ref={resolutionSliderRef} />
          </div>
        </div>
        <div className="controlGroup">
          <div className="controlRow">
            <span className="controlLabel">Distortion</span>
            <span className="controlValue" id="distortionValue" ref={distortionValueRef}>1.0</span>
          </div>
          <div className="sliderContainer">
            <input type="range" min="0" max="3" defaultValue="1" step="0.1" className="slider" id="distortionSlider" ref={distortionSliderRef} />
          </div>
        </div>
        <div className="controlGroup">
          <div className="controlRow">
            <span className="controlLabel">Audio Reactivity</span>
            <span className="controlValue" id="reactivityValue" ref={reactivityValueRef}>1.0</span>
          </div>
          <div className="sliderContainer">
            <input type="range" min="0" max="2" defaultValue="1" step="0.1" className="slider" id="reactivitySlider" ref={reactivitySliderRef} />
          </div>
        </div>
        <div className="buttons">
          <button className="btn" id="resetBtn" ref={resetBtnRef}>Reset</button>
          <button className="btn" id="analyzeBtn" ref={analyzeBtnRef}>Analyze</button>
        </div>
      </div>
      <div className="spectrumAnalyzer" ref={spectrumAnalyzerRef}>
        <div className="spectrumHeader">
          <span>Audio Spectrum Analyzer</span>
          <span className="dragHandle" id="spectrumHandle" ref={spectrumHandleRef}>⋮⋮</span>
        </div>
        <div className="spectrumContent">
          <canvas id="spectrumCanvas" className="spectrumCanvas" ref={spectrumCanvasRef}></canvas>
        </div>
        <div className="audioControls" ref={audioControlsRef}>
          <input type="file" id="audioFileInput" className="audioFileInput" accept="audio/*" ref={audioFileInputRef} />
          <button className="audioFileBtn" id="fileBtn" ref={fileBtnRef}>Upload Audio File</button>
          <div className="audioFileLabel" id="fileLabel" ref={fileLabelRef}>No File Selected</div>
          <audio id="audioPlayer" className="audioPlayer" crossOrigin="anonymous" ref={audioPlayerRef}></audio>
          <div className="controlsRow" ref={controlsRowRef}>
            <div className="audioSensitivity" style={{ flex: 1 }}>
              <div className="audioSensitivityLabel">
                <span>Sensitivity</span>
                <span className="audioSensitivityValue" id="sensitivityValue" ref={sensitivityValueRef}>5.0</span>
              </div>
              <input type="range" min="1" max="10" defaultValue="5" step="0.1" className="slider" id="sensitivitySlider" ref={sensitivitySliderRef} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}