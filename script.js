const projectName = "chord-player";
const chordInput = document.querySelector(".chord-input textarea");
const settingsEl = document.querySelector(".settings");
const beatStyleInput = document.querySelector(".beat-style-input select");
const volumeInput = document.querySelector(".volume-input select");
const tempoInput = document.querySelector(".tempo-input input");
const octaveInput = settingsEl.querySelector(".octave-input input");
const drumToggle = settingsEl.querySelector(".drum-toggle input");
const beatsInput = settingsEl.querySelector(".beats-input input");

let currentChord = null;
let currentVolume = getStoredValue("currentVolume", 0.5);
let tempo = getStoredValue("tempo", 100);
let octave = getStoredValue("octave", 3);
let beatCount = getStoredValue("beatCount", 4);
let drumEnabled = getStoredValue("drumEnabled", true);

let selectedBeatStyle = getStoredValue("selectedBeatStyle", 0);

let darkTheme = getStoredValue("darkTheme", false)

window.addEventListener("error", (event) => {
  const error = `${event.type}: ${event.message}`;
  console.error(error);
  alert(error);
});

document.addEventListener("DOMContentLoaded", function () {
  beatStyleInput.value = selectedBeatStyle;
  volumeInput.value = currentVolume;
  tempoInput.value = tempo;
  octaveInput.value = octave;
  drumToggle.checked = drumEnabled;
  beatsInput.value = beatCount;
  toggleTheme(darkTheme)
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
    // Wait for browser security
    setTimeout(() => {
      const freshAudio = new Audio(audio.src);
      freshAudio.volume = volume || currentVolume;
      freshAudio.play();
    }, 100);
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
    Toast.show("Cannot play. That chord is invalid");
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
      playAudios(beatAudios, currentVolume / 2);
    }, (60000 / tempo) * i);
  }
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
    }, (60000 / tempo) * i);
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

function changeTempo(value) {
  value = clamp(value, 50, 150);
  tempo = value;
  tempoInput.value = tempo;
  localStorage.setItem(`${projectName}_tempo`, tempo);
}

function changeOctave(value) {
  value = clamp(value, 0, 6);
  octave = value;
  octaveInput.value = octave;
  localStorage.setItem(`${projectName}_octave`, octave);
}

function toggleDrum(state) {
  drumEnabled = state;
  localStorage.setItem(`${projectName}_drumEnabled`, drumEnabled);
}

function changeBeatCount(value) {
  value = clamp(value, 0, 4);
  beatCount = value;
  beatsInput.value = beatCount;
  localStorage.setItem(`${projectName}_beatCount`, beatCount);
}

const Toast = (() => {
  const container = document.querySelector(".toast-container");
  let currentItems = [];

  function show(message) {
    if (!message) return;
    const item = crypto.randomUUID();
    currentItems.push(item);
    container.innerHTML += `
      <div class="toast" data-toast="${item}">
        ${message}
      </div>
    `;
    container.classList.remove("hidden");

    setTimeout(() => {
      const itemEl = container.querySelector(`[data-toast="${item}"]`);
      itemEl.remove();
      const itemToFilter = item;
      currentItems = currentItems.filter((item) => item !== itemToFilter);
      if (currentItems.length <= 0) container.classList.add("hidden");
    }, 3000);
  }

  return { show };
})();

function toggleTheme(state) {
  darkTheme = state === undefined ? !darkTheme : state
  const toggle = document.querySelector(".theme-toggle");
  localStorage.setItem(`${projectName}_darkTheme`, darkTheme);
  document.body.classList.toggle("dark-theme", darkTheme);
  toggle.innerHTML = darkTheme ? `<i class="bi bi-sun"></i>` : `<i class="bi bi-moon"></i>`;
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
