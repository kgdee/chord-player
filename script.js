const projectName = "chord-player";
const chordInput = document.querySelector(".chord-input textarea");
const settingsEl = document.querySelector(".settings");
const beatStyleInput = document.querySelector(".beat-style-input select");
const volumeInput = document.querySelector(".volume-input select");
const octaveInput = settingsEl.querySelector(".octave-input input");
const drumToggle = settingsEl.querySelector(".drum-toggle input");
const beatsInput = settingsEl.querySelector(".beats-input input");
const messageEl = document.querySelector(".message");

const notes = {
  C: 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  Fb: 4,
  F: 5,
  "E#": 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11,
  Cb: 11,
};

const chordFormulas = {
  "": [0, 4, 7],
  m: [0, 3, 7],
  7: [0, 4, 7, 10],
  m7: [0, 3, 7, 10],
  maj7: [0, 4, 7, 11],
};

const beatStyles = [
  {
    name: "Pop",
    beats: [[0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3], [0, 1, 2, 3]],
    drums: [0, 1, 0, 1],
  },
  {
    name: "Pop2",
    beats: [[0], [0, 1, 2, 3], [], [0]],
    drums: [0, 1, 2, 1],
  },
  {
    name: "Jazz",
    beats: [[0, 1, 2, 3], [], [], []],
    drums: [0, 2, 2, 0],
  },
  {
    name: "Melodic",
    beats: [[0], [1], [2], [3]],
    drums: [0, 1, 2, 2],
  },
];

let currentChord = null;
let currentVolume = getStoredValue("currentVolume", 0.5);
let octave = getStoredValue("octave", 3);
let beatCount = getStoredValue("beatCount", 3);
let drumEnabled = getStoredValue("drumEnabled", true);

let selectedBeatStyle = getStoredValue("selectedBeatStyle", 0);

window.addEventListener("error", (event) => {
  const error = `${event.type}: ${event.message}`;
  console.error(error);
  alert(error);
});

document.addEventListener("DOMContentLoaded", function () {
  beatStyleInput.value = selectedBeatStyle;
  volumeInput.value = currentVolume;
  octaveInput.value = octave;
  drumToggle.checked = drumEnabled;
  beatsInput.value = beatCount;
});

function getStoredValue(key, defaultValue) {
  const stored = localStorage.getItem(`${projectName}_${key}`);
  if (stored == null) return defaultValue;
  return JSON.parse(stored);
}

function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function playAudios(audios, volume) {
  audios.forEach((audio) => {
    const freshAudio = new Audio(audio.src);
    setTimeout(() => {
      freshAudio.volume = volume || currentVolume;
      freshAudio.play();
    }, 200);
  });
}

function parseChord(input) {
  const match = input.trim().match(/^([A-Ga-g](?:#|b)?)(maj7|m7|m|7)?$/);
  if (!match) return null;

  const rootNote = capitalizeFirstLetter(match[1]);
  const type = (match[2] || "").toLowerCase();

  const rootIndex = notes[rootNote];
  const formula = chordFormulas[type];

  if (rootIndex === undefined || !formula) return null;

  let chord = formula.map((semi) => (rootIndex + semi) % 12);

  chord = chord.map((key) => key + octave * 12);

  return chord;
}

function playChord() {
  const chordName = chordInput.value;
  if (!chordName) return;

  const keys = parseChord(chordName);
  if (!keys) {
    chordInput.value = "";
    messageEl.textContent = "That chord is invalid";
    return;
  }

  currentChord = keys;

  playBeats();
  if (drumEnabled) playDrumBeats();

  chordInput.value = "";
}

function playBeats() {
  if (!currentChord || beatCount <= 0) return;

  const audios = currentChord.map((key) => new Audio(`assets/audio/notes/${key + 1}.mp3`));
  playAudios(audios.filter((_, index) => beatStyles[selectedBeatStyle].beats[0].includes(index)));

  for (let i = 1; i < beatCount; i++) {
    setTimeout(() => {
      const beatAudios = audios.filter((_, index) => beatStyles[selectedBeatStyle].beats[i].includes(index));
      playAudios(beatAudios, currentVolume / 4);
    }, 1000 * i);
  }

  // for (let i = 0; i < beatCount; i++) {
  //   setTimeout(() => {
  //     playAudios(audios, currentVolume / 4);
  //   }, 1000 * (i + 1));
  // }
}

function playDrumBeats() {
  const drumNames = ["kick", "snare", "hi-hat"];
  const audio = new Audio(`assets/audio/drums/${drumNames[beatStyles[selectedBeatStyle].drums[0]]}.mp3`);
  playAudios([audio], currentVolume / 2);
  for (let i = 1; i < beatCount; i++) {
    setTimeout(() => {
      const audio = new Audio(`assets/audio/drums/${drumNames[beatStyles[selectedBeatStyle].drums[i]]}.mp3`);
      playAudios([audio], currentVolume / 2);
      playAudios([]);
    }, 1000 * i);
  }
}

function changeBeatStyle(value) {
  selectedBeatStyle = parseInt(value);
  localStorage.setItem(`${projectName}_selectedBeatStyle`, selectedBeatStyle);
}

function changeVolume(value) {
  currentVolume = value;
  localStorage.setItem(`${projectName}_currentVolume`, currentVolume);
}

function changeOctave(value) {
  value = clamp(value, 0, 6);
  octaveInput.value = value;
  octave = value;
  localStorage.setItem(`${projectName}_octave`, octave);
}

function toggleDrum(state) {
  drumEnabled = state;
  localStorage.setItem(`${projectName}_drumEnabled`, drumEnabled);
}

function changeBeatCount(value) {
  value = clamp(value, 0, 4);
  beatsInput.value = value;
  beatCount = value;
  localStorage.setItem(`${projectName}_beatCount`, beatCount);
}

document.addEventListener("focusin", function (e) {
  if (e.target.tagName === "INPUT") {
    e.target.select();
  }
});

chordInput.addEventListener("input", function (event) {
  const value = event.target.value;

  if (value.endsWith(" ") || value.endsWith("\n") || value.endsWith(";")) {
    event.preventDefault();
    chordInput.value = value.slice(0, -1);
    playChord();
  }
});
