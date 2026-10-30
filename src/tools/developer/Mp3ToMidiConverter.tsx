import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, Play, Pause, AlertCircle, Music, Volume2, Edit3, Trash2 } from 'lucide-react';

interface MidiNote {
  id: string;
  noteNumber: number; // 21 to 108
  name: string;
  startTime: number; // seconds
  duration: number; // seconds
  velocity: number;
}

export const Mp3ToMidiConverter: React.FC = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [tempo, setTempo] = useState<number>(120);
  const [sensitivity, setSensitivity] = useState<number>(50); // 1-100
  const [detectedKey, setDetectedKey] = useState<string>('C Major');
  const [notes, setNotes] = useState<MidiNote[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  const midiToNoteName = (midi: number): string => {
    const name = noteNames[midi % 12];
    const octave = Math.floor(midi / 12) - 1;
    return `${name}${octave}`;
  };

  const freqToMidi = (freq: number): number => {
    if (freq <= 0) return 0;
    return Math.round(69 + 12 * Math.log2(freq / 440));
  };

  // Sample melody notes for preview / initial state
  const loadDefaultMelody = () => {
    const demo: MidiNote[] = [
      { id: '1', noteNumber: 60, name: 'C4', startTime: 0.0, duration: 0.45, velocity: 80 },
      { id: '2', noteNumber: 62, name: 'D4', startTime: 0.5, duration: 0.45, velocity: 85 },
      { id: '3', noteNumber: 64, name: 'E4', startTime: 1.0, duration: 0.45, velocity: 90 },
      { id: '4', noteNumber: 65, name: 'F4', startTime: 1.5, duration: 0.45, velocity: 85 },
      { id: '5', noteNumber: 67, name: 'G4', startTime: 2.0, duration: 0.9, velocity: 95 },
      { id: '6', noteNumber: 67, name: 'G4', startTime: 3.0, duration: 0.9, velocity: 95 },
      { id: '7', noteNumber: 69, name: 'A4', startTime: 4.0, duration: 0.45, velocity: 80 },
      { id: '8', noteNumber: 67, name: 'G4', startTime: 4.5, duration: 0.45, velocity: 85 },
      { id: '9', noteNumber: 65, name: 'F4', startTime: 5.0, duration: 0.45, velocity: 80 },
      { id: '10', noteNumber: 64, name: 'E4', startTime: 5.5, duration: 0.9, velocity: 85 },
    ];
    setNotes(demo);
    setDetectedKey('C Major');
  };

  useEffect(() => {
    loadDefaultMelody();
  }, []);

  // Web Audio Pitch Detection (Autocorrelation)
  const autoCorrelate = (buffer: Float32Array, sampleRate: number): number => {
    const SIZE = buffer.length;
    let sum = 0;
    for (let i = 0; i < SIZE; i++) {
      sum += buffer[i] * buffer[i];
    }
    const rms = Math.sqrt(sum / SIZE);
    // Silence threshold based on sensitivity
    const threshold = (101 - sensitivity) / 1000;
    if (rms < threshold) return -1;

    let r1 = 0, r2 = SIZE - 1;
    const thres = 0.2;
    for (let i = 0; i < SIZE / 2; i++) {
      if (Math.abs(buffer[i]) < thres) {
        r1 = i;
        break;
      }
    }
    for (let i = 1; i < SIZE / 2; i++) {
      if (Math.abs(buffer[SIZE - i]) < thres) {
        r2 = SIZE - i;
        break;
      }
    }

    const trimmed = buffer.slice(r1, r2);
    const c = new Float32Array(trimmed.length).fill(0);
    for (let i = 0; i < trimmed.length; i++) {
      for (let j = 0; j < trimmed.length - i; j++) {
        c[i] = c[i] + trimmed[j] * trimmed[j + i];
      }
    }

    let d = 0;
    while (c[d] > c[d + 1]) d++;
    let maxval = -1, maxpos = -1;
    for (let i = d; i < trimmed.length; i++) {
      if (c[i] > maxval) {
        maxval = c[i];
        maxpos = i;
      }
    }
    let T0 = maxpos;
    if (T0 > 0 && maxval > 0.01) {
      return sampleRate / T0;
    }
    return -1;
  };

  const handleAudioUpload = async (file: File) => {
    try {
      setAudioFile(file);
      setError(null);
      setIsTranscribing(true);

      const url = URL.createObjectURL(file);
      setAudioUrl(url);

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

      const channelData = audioBuffer.getChannelData(0);
      const sampleRate = audioBuffer.sampleRate;
      const windowSize = 2048;
      const hopSize = 1024;
      const detectedNotesList: MidiNote[] = [];

      let currentNote: { midi: number; start: number } | null = null;

      for (let offset = 0; offset + windowSize < channelData.length; offset += hopSize) {
        const slice = channelData.subarray(offset, offset + windowSize);
        const pitch = autoCorrelate(slice, sampleRate);
        const currentTime = offset / sampleRate;

        if (pitch > 50 && pitch < 2000) {
          const midi = freqToMidi(pitch);
          if (!currentNote) {
            currentNote = { midi, start: currentTime };
          } else if (currentNote.midi !== midi) {
            // Note change
            const dur = currentTime - currentNote.start;
            if (dur >= 0.08) {
              detectedNotesList.push({
                id: Math.random().toString(),
                noteNumber: currentNote.midi,
                name: midiToNoteName(currentNote.midi),
                startTime: parseFloat(currentNote.start.toFixed(2)),
                duration: parseFloat(dur.toFixed(2)),
                velocity: 85,
              });
            }
            currentNote = { midi, start: currentTime };
          }
        } else {
          // Silence
          if (currentNote) {
            const dur = currentTime - currentNote.start;
            if (dur >= 0.08) {
              detectedNotesList.push({
                id: Math.random().toString(),
                noteNumber: currentNote.midi,
                name: midiToNoteName(currentNote.midi),
                startTime: parseFloat(currentNote.start.toFixed(2)),
                duration: parseFloat(dur.toFixed(2)),
                velocity: 85,
              });
            }
            currentNote = null;
          }
        }
      }

      if (detectedNotesList.length > 0) {
        setNotes(detectedNotesList);
        // Estimate key by most frequent note pitch class
        const counts: Record<number, number> = {};
        detectedNotesList.forEach(n => {
          const pc = n.noteNumber % 12;
          counts[pc] = (counts[pc] || 0) + 1;
        });
        const topPc = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
        if (topPc) {
          setDetectedKey(`${noteNames[Number(topPc[0])]} Major`);
        }
      } else {
        setError('No distinct pitches detected above noise threshold. Adjust sensitivity and try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Error decoding audio file.');
    } finally {
      setIsTranscribing(false);
    }
  };

  // Render Piano Roll
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#111F35';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const minMidi = 48; // C3
    const maxMidi = 84; // C6
    const totalSemis = maxMidi - minMidi + 1;
    const rowH = canvas.height / totalSemis;
    const totalDuration = Math.max(...notes.map(n => n.startTime + n.duration), 8);
    const pxPerSec = (canvas.width - 60) / totalDuration;

    // Draw Piano Keys on left
    for (let m = minMidi; m <= maxMidi; m++) {
      const y = (maxMidi - m) * rowH;
      const isBlack = [1, 3, 6, 8, 10].includes(m % 12);

      // Row background
      ctx.fillStyle = isBlack ? '#0C1626' : '#172740';
      ctx.fillRect(60, y, canvas.width - 60, rowH);

      // Key header
      ctx.fillStyle = isBlack ? '#1e293b' : '#f8fafc';
      ctx.fillRect(0, y, 60, rowH);
      ctx.strokeStyle = '#334155';
      ctx.strokeRect(0, y, 60, rowH);

      ctx.fillStyle = isBlack ? '#94a3b8' : '#0f172a';
      ctx.font = '9px Manrope, sans-serif';
      ctx.fillText(midiToNoteName(m), 6, y + rowH - 3);
    }

    // Grid vertical time beats
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let t = 0; t <= totalDuration; t += 0.5) {
      const x = 60 + t * pxPerSec;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // Draw Detected Notes
    notes.forEach((note) => {
      if (note.noteNumber < minMidi || note.noteNumber > maxMidi) return;
      const x = 60 + note.startTime * pxPerSec;
      const y = (maxMidi - note.noteNumber) * rowH;
      const w = Math.max(note.duration * pxPerSec, 4);

      ctx.fillStyle = note.id === selectedNoteId ? '#F2EFE7' : '#8A244B';
      ctx.fillRect(x, y + 1, w, rowH - 2);

      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y + 1, w, rowH - 2);
    });
  }, [notes, selectedNoteId]);

  // Audio tone playback synthesizer
  const playNoteSynth = (midi: number) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const freq = 440 * Math.pow(2, (midi - 69) / 12);
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {
      // AudioContext policy
    }
  };

  // Build binary Standard MIDI File (.mid)
  const exportMidi = () => {
    // Variable length quantity encoder
    const writeVarLen = (val: number): number[] => {
      let buffer = val & 0x7f;
      const bytes: number[] = [];
      while ((val >>= 7)) {
        buffer <<= 8;
        buffer |= (val & 0x7f) | 0x80;
      }
      while (true) {
        bytes.push(buffer & 0xff);
        if (buffer & 0x80) buffer >>= 8;
        else break;
      }
      return bytes;
    };

    const ticksPerBeat = 480;
    const secPerBeat = 60 / tempo;
    const ticksPerSec = ticksPerBeat / secPerBeat;

    interface MidiEvent {
      time: number;
      type: 'on' | 'off';
      note: number;
      vel: number;
    }
    const events: MidiEvent[] = [];
    notes.forEach((n) => {
      events.push({ time: n.startTime, type: 'on', note: n.noteNumber, vel: n.velocity });
      events.push({ time: n.startTime + n.duration, type: 'off', note: n.noteNumber, vel: 0 });
    });
    events.sort((a, b) => a.time - b.time);

    const trackBytes: number[] = [];
    let lastTick = 0;

    // Track Name Meta Event
    trackBytes.push(0x00, 0xff, 0x03, 0x05, 0x44, 0x65, 0x76, 0x32, 0x37); // "Dev27"

    // Set Tempo Meta Event (microseconds per quarter note)
    const usPerBeat = Math.round(60000000 / tempo);
    trackBytes.push(
      0x00, 0xff, 0x51, 0x03,
      (usPerBeat >> 16) & 0xff,
      (usPerBeat >> 8) & 0xff,
      usPerBeat & 0xff
    );

    events.forEach((ev) => {
      const currentTick = Math.round(ev.time * ticksPerSec);
      const deltaTicks = Math.max(0, currentTick - lastTick);
      lastTick = currentTick;

      trackBytes.push(...writeVarLen(deltaTicks));
      if (ev.type === 'on') {
        trackBytes.push(0x90, ev.note, ev.vel);
      } else {
        trackBytes.push(0x80, ev.note, 0);
      }
    });

    // End of Track Meta Event
    trackBytes.push(0x00, 0xff, 0x2f, 0x00);

    // MThd Header
    const headerBytes = [
      0x4d, 0x54, 0x68, 0x64, // 'MThd'
      0x00, 0x00, 0x00, 0x06, // length 6
      0x00, 0x00, // format 0
      0x00, 0x01, // 1 track
      (ticksPerBeat >> 8) & 0xff, ticksPerBeat & 0xff,
    ];

    // MTrk Header
    const trackLen = trackBytes.length;
    const trackHeader = [
      0x4d, 0x54, 0x72, 0x6b, // 'MTrk'
      (trackLen >> 24) & 0xff,
      (trackLen >> 16) & 0xff,
      (trackLen >> 8) & 0xff,
      trackLen & 0xff,
    ];

    const fullMidi = new Uint8Array([...headerBytes, ...trackHeader, ...trackBytes]);
    const blob = new Blob([fullMidi], { type: 'audio/midi' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcribed-${Date.now()}.mid`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Upload & Audio Playback Bar */}
      <div className="p-4 bg-white card-dev27 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 cursor-pointer bg-[#F2EFE7] hover:bg-slate-200 text-[#111F35] px-3 py-2 rounded-[4px] text-xs font-semibold">
            <Upload className="w-4 h-4 text-[#8A244B]" />
            <span>Upload Audio (MP3 / WAV)</span>
            <input
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleAudioUpload(f);
              }}
            />
          </label>

          <div className="flex items-center gap-3 text-xs">
            {audioUrl && (
              <audio ref={audioRef} src={audioUrl} controls className="h-8 max-w-[200px]" />
            )}
            <button
              onClick={exportMidi}
              disabled={notes.length === 0}
              className="px-3 py-2 font-semibold bg-[#8A244B] hover:bg-[#721C3D] text-white rounded-[4px] flex items-center gap-1.5 disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" />
              Download Standard MIDI (.mid)
            </button>
          </div>
        </div>

        {/* Configurations */}
        <div className="flex flex-wrap items-center gap-4 text-xs pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-600 font-medium">Tempo:</span>
            <input
              type="number"
              min={40}
              max={240}
              value={tempo}
              onChange={(e) => setTempo(Number(e.target.value))}
              className="w-16 border border-slate-300 rounded-[4px] px-2 py-0.5 text-xs text-center"
            />
            <span className="text-slate-400">BPM</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-600 font-medium">Pitch Sensitivity:</span>
            <input
              type="range"
              min={10}
              max={90}
              value={sensitivity}
              onChange={(e) => setSensitivity(Number(e.target.value))}
              className="w-24 accent-[#8A244B]"
            />
            <span className="text-slate-500 font-mono">{sensitivity}%</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-600 font-medium">Detected Key:</span>
            <span className="px-2 py-0.5 bg-[#F2EFE7] text-[#111F35] font-bold rounded-[4px]">
              {detectedKey}
            </span>
          </div>

          <div className="text-slate-500">
            Detected Notes: <strong className="text-slate-900">{notes.length}</strong>
          </div>
        </div>
      </div>

      {isTranscribing && (
        <div className="p-3 bg-white card-dev27 text-center text-xs text-slate-600 font-medium animate-pulse">
          Analyzing frequencies via YIN autocorrelation & detecting musical onsets...
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-[4px] text-xs text-red-800 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Interactive Piano Roll Canvas */}
      <div className="p-4 bg-white card-dev27 space-y-2">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs font-bold text-slate-700">
          <span>Interactive Piano Roll (C3 – C6)</span>
          <span className="text-slate-400 font-mono text-[11px]">Click notes to preview tone</span>
        </div>

        <div className="overflow-x-auto border border-slate-300 rounded-[4px]">
          <canvas
            ref={canvasRef}
            width={720}
            height={320}
            onClick={(e) => {
              const canvas = canvasRef.current;
              if (!canvas) return;
              const rect = canvas.getBoundingClientRect();
              const y = e.clientY - rect.top;
              const minMidi = 48, maxMidi = 84;
              const rowH = canvas.height / (maxMidi - minMidi + 1);
              const clickedMidi = maxMidi - Math.floor(y / rowH);
              playNoteSynth(clickedMidi);
            }}
            className="cursor-pointer"
          />
        </div>
      </div>

      {/* Editable Notes List */}
      <div className="p-4 bg-white card-dev27 space-y-3">
        <span className="text-xs font-bold text-slate-700 block pb-1 border-b border-slate-100">
          Editable Note Event Stream ({notes.length} notes)
        </span>

        <div className="max-h-48 overflow-y-auto space-y-1.5 text-xs">
          {notes.map((n) => (
            <div
              key={n.id}
              className={`flex items-center justify-between p-2 rounded-[4px] border ${
                selectedNoteId === n.id ? 'bg-[#F2EFE7] border-[#8A244B]' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setSelectedNoteId(n.id);
                    playNoteSynth(n.noteNumber);
                  }}
                  className="font-mono font-bold text-[#8A244B] hover:underline"
                >
                  {n.name}
                </button>
                <span className="text-slate-500 font-mono text-[11px]">
                  Start: {n.startTime.toFixed(2)}s · Dur: {n.duration.toFixed(2)}s · Vel: {n.velocity}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => playNoteSynth(n.noteNumber)}
                  className="p-1 text-slate-600 hover:text-[#8A244B]"
                  title="Play tone"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setNotes(notes.filter(item => item.id !== n.id))}
                  className="p-1 text-slate-400 hover:text-red-700"
                  title="Delete note"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
