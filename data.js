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
    name: "Pop 2",
    beats: [[0], [0, 1, 2, 3], [], [0]],
    drums: [2, 1, 2, 1],
  },
  {
    name: "Jazz",
    beats: [[0, 1, 2, 3], [], [], []],
    drums: [1, 2, 2, 1],
  },
  {
    name: "Melodic",
    beats: [[0], [1], [2], [3]],
    drums: [0, 1, 2, 2],
  },
];