const TONE = 2;
const MINOR_TERTIA = 3;
const MAJOR_TERTIA = 4;
const QUINTA = MINOR_TERTIA + MAJOR_TERTIA;
const TRITONE = MINOR_TERTIA * 2;
const SEPTIMA = TONE * 5;

const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function build_chord(tone, offsets) {
	const tone_index = NOTES.indexOf(tone);
	return offsets.map((x) => [x, NOTES[(tone_index + x) % NOTES.length]]);
}

export function build_min(tone) {
	return build_chord(tone, [0, MINOR_TERTIA, QUINTA]);
}

export function build_maj(tone) {
	return build_chord(tone, [0, MAJOR_TERTIA, QUINTA]);
}

export function build_min_7(tone) {
	return build_chord(tone, [0, MINOR_TERTIA, QUINTA, SEPTIMA]);
}

export function build_maj_7(tone) {
	return build_chord(tone, [0, MAJOR_TERTIA, QUINTA, SEPTIMA]);
}

export function build_5(tone) {
	return build_chord(tone, [0, QUINTA]);
}

export function build_dim(tone) {
	return build_chord(tone, [0, MINOR_TERTIA, TRITONE]);
}

export function build_maj_key(tone) {
	return build_chord(tone, [0, 2, 4, 5, 7, 9, 11]);
}
