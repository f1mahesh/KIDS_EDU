/* Lightweight Web Audio API Synthesizer for Kids MathCube 3D */
(function (global) {
  let ctx = null;
  let muted = localStorage.getItem('mathcube_muted') === 'true';
  let voiceOn = localStorage.getItem('mathcube_voice') !== 'false';
  let cachedKidVoice = null;

  const PREFERRED_VOICES = [
    'ana',        // Windows / Edge friendly child-like natural voice
    'aria',       // Edge natural warm voice
    'jenny',      // Edge natural friendly voice
    'samantha',   // macOS / iOS friendly voice
    'karen',
    'tessa',
    'flo',
    'sandy',
    'google us english',
    'google uk english female',
    'zira',       // Windows standard female voice (much warmer than David)
    'natural'
  ];

  function pickKidVoice() {
    if (!global.speechSynthesis) return null;
    const voices = global.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    const enVoices = voices.filter((v) => v.lang && v.lang.toLowerCase().startsWith('en'));
    const pool = enVoices.length > 0 ? enVoices : voices;

    let best = null;
    let bestScore = -1;

    for (const v of pool) {
      const name = (v.name || '').toLowerCase();
      let score = 0;
      PREFERRED_VOICES.forEach((kw, idx) => {
        if (name.includes(kw)) {
          score += (PREFERRED_VOICES.length - idx) * 10;
        }
      });
      if (name.includes('online') || name.includes('neural')) score += 15;
      if (name.includes('female')) score += 8;
      if (name.includes('david') || name.includes('mark') || name.includes('espeak')) score -= 10;
      if (v.localService === false) score += 4;
      if (score > bestScore) {
        bestScore = score;
        best = v;
      }
    }

    cachedKidVoice = best || pool[0];
    return cachedKidVoice;
  }

  if (global.speechSynthesis) {
    pickKidVoice();
    if ('onvoiceschanged' in global.speechSynthesis) {
      global.speechSynthesis.onvoiceschanged = pickKidVoice;
    }
  }

  function cleanForSpeech(text) {
    // Strip emojis & extra symbols so screen/TTS doesn't read emoji descriptions aloud
    return String(text)
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function getCtx() {
    if (muted) return null;
    if (!ctx) {
      const AudioCtx = global.AudioContext || global.webkitAudioContext;
      if (AudioCtx) {
        ctx = new AudioCtx();
      }
    }
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  function playTone(freq, duration, type = 'sine', volume = 0.14, delay = 0) {
    const audio = getCtx();
    if (!audio) return;

    const start = audio.currentTime + delay;
    const osc = audio.createOscillator();
    const gain = audio.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);

    gain.gain.setValueAtTime(0.001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

    osc.connect(gain);
    gain.connect(audio.destination);

    osc.start(start);
    osc.stop(start + duration + 0.02);
  }

  global.MathAudio = {
    isMuted() {
      return muted;
    },
    toggleMute() {
      muted = !muted;
      localStorage.setItem('mathcube_muted', String(muted));
      if (!muted) {
        playTone(523.25, 0.12, 'triangle', 0.12);
      }
      return muted;
    },
    pop() {
      playTone(440, 0.08, 'triangle', 0.1);
    },
    correct() {
      playTone(523.25, 0.12, 'triangle', 0.15, 0);
      playTone(659.25, 0.12, 'triangle', 0.15, 0.08);
      playTone(783.99, 0.22, 'triangle', 0.16, 0.16);
    },
    wrong() {
      playTone(260, 0.14, 'sawtooth', 0.07, 0);
      playTone(210, 0.2, 'sawtooth', 0.07, 0.11);
    },
    fanfare() {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((n, idx) => {
        playTone(n, 0.22, 'triangle', 0.15, idx * 0.1);
      });
    },
    flip() {
      playTone(587.33, 0.09, 'sine', 0.1);
    },
    magic() {
      const shimmer = [523.25, 659.25, 783.99, 987.77, 1174.66, 1318.5];
      shimmer.forEach((n, idx) => {
        playTone(n, 0.18, 'sine', 0.13, idx * 0.055);
      });
    },
    giggle() {
      [587.33, 783.99, 659.25, 880].forEach((n, idx) => {
        playTone(n, 0.1, 'triangle', 0.13, idx * 0.07);
      });
    },
    chomp() {
      playTone(340, 0.07, 'square', 0.06, 0);
      playTone(460, 0.08, 'triangle', 0.12, 0.09);
      playTone(660, 0.14, 'sine', 0.13, 0.18);
    },
    crack() {
      playTone(190, 0.08, 'sawtooth', 0.14, 0);
      playTone(130, 0.10, 'square', 0.10, 0.04);
    },
    boom() {
      playTone(150, 0.16, 'sawtooth', 0.18, 0);
      playTone(95, 0.24, 'triangle', 0.20, 0.05);
      playTone(580, 0.12, 'sine', 0.12, 0.08);
    },
    isVoiceOn() {
      return voiceOn && !muted;
    },
    toggleVoice() {
      voiceOn = !voiceOn;
      localStorage.setItem('mathcube_voice', String(voiceOn));
      if (!voiceOn && global.speechSynthesis) {
        global.speechSynthesis.cancel();
      }
      return voiceOn;
    },
    speak(text, mood = 'normal') {
      if (muted || !voiceOn || !global.speechSynthesis || !text) return;
      const clean = cleanForSpeech(text);
      if (!clean) return;
      try {
        global.speechSynthesis.cancel();
        const utt = new SpeechSynthesisUtterance(clean);
        const voice = cachedKidVoice || pickKidVoice();
        if (voice) utt.voice = voice;

        if (mood === 'cheer') {
          utt.rate = 0.98;
          utt.pitch = 1.24;
        } else if (mood === 'gentle') {
          utt.rate = 0.88;
          utt.pitch = 1.12;
        } else {
          utt.rate = 0.91;
          utt.pitch = 1.18;
        }
        utt.volume = 0.9;
        global.speechSynthesis.speak(utt);
      } catch (_) {}
    }
  };
})(window);
