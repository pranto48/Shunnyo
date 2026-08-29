/**
 * Native Audio Recording Engine for Shunnyo
 * Uses Web Audio API + MediaRecorder for Facebook Messenger style voice messaging.
 */

class AudioRecorderEngine {
  constructor() {
    this.mediaRecorder = null;
    this.audioContext = null;
    this.analyser = null;
    this.microphone = null;
    this.audioChunks = [];
    this.stream = null;
    this.startTime = 0;
    this.isRecording = false;
  }

  /**
   * Request microphone permission and start recording
   */
  async start() {
    this.audioChunks = [];
    this.isRecording = false;

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Setup Web Audio Analyser for live waveform visualization
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioContext = new AudioCtx();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 64;
        this.microphone = this.audioContext.createMediaStreamSource(this.stream);
        this.microphone.connect(this.analyser);
      }

      // Determine supported MIME type
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
        mimeType = 'audio/ogg;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      }

      this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(100);
      this.startTime = Date.now();
      this.isRecording = true;

      return true;
    } catch (err) {
      console.error('[AudioRecorder] Failed to initialize microphone:', err);
      throw err;
    }
  }

  /**
   * Get real-time audio volume levels for animated waveform (0-100)
   */
  getFrequencyLevels(barCount = 24) {
    if (!this.analyser || !this.isRecording) {
      return Array.from({ length: barCount }, () => Math.floor(Math.random() * 40) + 10);
    }

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);

    const levels = [];
    const step = Math.max(1, Math.floor(dataArray.length / barCount));

    for (let i = 0; i < barCount; i++) {
      const val = dataArray[i * step] || 0;
      // Normalize to 15% - 100% height
      const normalized = Math.max(15, Math.min(100, Math.round((val / 255) * 100)));
      levels.push(normalized);
    }

    return levels;
  }

  /**
   * Stop recording and return complete Audio Blob + Preview URL
   */
  stop() {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const mimeType = this.mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(this.audioChunks, { type: mimeType });
        const audioUrl = URL.createObjectURL(audioBlob);
        const durationSeconds = Math.max(1, Math.round((Date.now() - this.startTime) / 1000));

        this.cleanup();

        resolve({
          blob: audioBlob,
          url: audioUrl,
          duration: durationSeconds,
          mimeType
        });
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * Cancel and discard recording
   */
  cancel() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch (e) {
        console.warn(e);
      }
    }
    this.cleanup();
  }

  cleanup() {
    this.isRecording = false;
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch (e) {}
      this.audioContext = null;
    }
    this.audioChunks = [];
  }
}

export const audioRecorderEngine = new AudioRecorderEngine();
