const projectName = "chord-player"
const chordInput = document.querySelector(".chord-input textarea");
const settingsEl = document.querySelector(".settings");
const volumeInput = document.querySelector(".volume-input select")
const octaveInput = settingsEl.querySelector(".octave-input input");
const drumToggle = settingsEl.querySelector(".drum-toggle input");
const beatsInput = settingsEl.querySelector(".beats-input input");
const messageEl = document.querySelector(".message");

const noteNames = {
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

const chordTypes = {
  "": [0, 4, 7],
  m: [0, 3, 7],
  7: [0, 4, 7, 10],
  m7: [0, 3, 7, 10],
  maj7: [0, 4, 7, 11],
};

let currentChord = null;
let currentVolume = getStoredValue("currentVolume", 0.5)
let octave = getStoredValue("octave", 3)
let beatCount = getStoredValue("beatCount", 3)
let drumEnabled = getStoredValue("drumEnabled", true)

const noteAudios = [];
const drumAudios = [];

window.addEventListener("error", (event) => {
  const error = `${event.type}: ${event.message}`;
  console.error(error);
  alert(error);
});

document.addEventListener("DOMContentLoaded", function () {
  initAudios();
  volumeInput.value = currentVolume
  octaveInput.value = octave;
  drumToggle.checked = drumEnabled;
  beatsInput.value = beatCount;
});

function getStoredValue(key, defaultValue) {
  const stored = localStorage.getItem(`${projectName}_${key}`);
  if (stored == null) return defaultValue;
  return JSON.parse(stored);
}

function initAudios() {
  for (let i = 0; i < 88; i++) {
    const audio = new Audio(`assets/audio/notes/${i + 1}.mp3`);
    noteAudios.push(audio);
  }

  const drumNames = ["hi-hat", "kick", "snare"];
  drumNames.forEach((drumName) => {
    const audio = new Audio(`assets/audio/drums/${drumName}.mp3`);
    drumAudios.push(audio);
  });
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
    freshAudio.volume = volume || currentVolume;
    freshAudio.play();
  });
}

function parseChord(input) {
  const match = input.trim().match(/^([A-Ga-g](?:#|b)?)(maj7|m7|m|7)?$/);
  if (!match) return null;

  const rootNote = capitalizeFirstLetter(match[1]);
  const type = (match[2] || "").toLowerCase();

  const rootIndex = noteNames[rootNote];
  const formula = chordTypes[type];

  if (rootIndex === undefined || !formula) return null;

  let chord = formula.map((semi) => (rootIndex + semi) % 12);

  chord = chord.map((key) => key + octave * 12);

  return chord;
}

function playChord() {
  const chordName = chordInput.value;
  const keys = parseChord(chordName);
  if (!keys) {
    chordInput.value = "";
    messageEl.textContent = "That chord is invalid";
    return;
  }

  currentChord = keys;

  const audios = keys.map((key) => noteAudios[key]);
  playAudios(audios);

  playBeats();
  if (drumEnabled) playDrumBeats();

  chordInput.value = "";
}

function playRoot() {
  if (!currentChord) return;
  const key = currentChord[0];
  const audio = new Audio(`assets/audio/notes/${key}.mp3`);
  audio.play();
}

function playBeats() {
  if (!currentChord || beatCount <= 0) return;

  const audios = currentChord.map((key) => noteAudios[key]);
  for (let i = 0; i < beatCount; i++) {
    setTimeout(() => {
      playAudios(audios, currentVolume / 4);
    }, 1000 * (i + 1));
  }
}

function playDrumBeats() {
  playDrum(0);
  for (let i = 0; i < beatCount; i++) {
    setTimeout(() => {
      playDrum(i + 1);
    }, 1000 * (i + 1));
  }
}

function playDrum(drumIndex = 0) {
  const audio = drumIndex % 2 === 0 ? drumAudios[1] : drumAudios[2];
  playAudios([audio], currentVolume / 2);
}

function changeVolume(value) {
  currentVolume = value
  localStorage.setItem(`${projectName}_currentVolume`, currentVolume)
}

function changeOctave(value) {
  octaveInput.value = clamp(value, 0, 6);
  octave = value;
  localStorage.setItem(`${projectName}_octave`, octave)
}

function toggleDrum(state) {
  drumEnabled = state;
  localStorage.setItem(`${projectName}_drumEnabled`, drumEnabled)
}

function changeBeatCount(value) {
  beatsInput.value = clamp(value, 0, 4);
  beatCount = value;
  localStorage.setItem(`${projectName}_beatCount`, beatCount)
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
