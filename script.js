const chordInput = document.querySelector(".chord-input");
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

function parseChord(input) {
  const match = input.trim().match(/^([A-Ga-g](?:#|b)?)(maj7|m7|m|7)?$/);
  if (!match) return null;

  const rootNote = capitalizeFirstLetter(match[1])
  const type = (match[2] || "").toLowerCase();
  
  const rootIndex = noteNames[rootNote];
  const formula = chordTypes[type];

  if (rootIndex === undefined || !formula) return null;

  return formula.map((semi) => (rootIndex + semi) % 12);
}

function getNoteNumbers(noteIndexes, baseOctave = 4) {
  return noteIndexes
    .map((semi) => {
      const midi = (baseOctave + 1) * 12 + semi;
      const key = midi - 20;
      return key >= 1 && key <= 88 ? key : null;
    })
    .filter((n) => n);
}

function playChord() {
  const chordName = chordInput.value;
  const semitones = parseChord(chordName);
  if (!semitones) {
    alert("Invalid chord");
    return;
  }

  const keys = getNoteNumbers(semitones);
  keys.forEach((key) => {
    const audio = new Audio(`assets/audio/notes/${key}.mp3`);
    audio.play();
  });

  chordInput.value = "";
}

function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

document.addEventListener("keydown", function (event) {
  if (event.code === "Semicolon" || event.code === "Space" || event.code === "Enter") {
    event.preventDefault();
    playChord();
  }
});
