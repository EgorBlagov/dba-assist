import {
	build_min,
	build_maj,
	build_min_7,
	build_maj_7,
	build_5,
	build_dim,
	build_maj_key,
} from "./chord_builder.js";

const buttons_by_pos = {};
const buttons_by_note = {};
const preset_type_by_key = {};
const preset_el_by_type = {};

const RADIO_NAME = "chord-type";
const CHORD_INFOS = {
	["chord-major"]: {
		label: "Major",
		builder: build_maj,
	},
	["chord-minor"]: {
		label: "Minor",
		builder: build_min,
	},
	["chord-7"]: {
		label: "Seventh",
		builder: build_maj_7,
	},
	["chord-m7"]: {
		label: "Minor seventh",
		builder: build_min_7,
	},
	["chord-5"]: {
		label: "Fifth",
		builder: build_5,
	},
	["chord-dim"]: {
		label: "Diminished triad",
		builder: build_dim,
	},
	["chord-octave"]: {
		label: "Octave",
		builder: (note) => [[0, note]],
	},
	["chord-major-key"]: {
		label: "Major key",
		builder: build_maj_key,
	},
};

const PRESET_INFOS = {
	Dm: {
		label: "Dm",
		notes: build_min("D"),
		key: "KeyQ",
	},
	Am: {
		label: "Am",
		notes: build_min("A"),
		key: "KeyW",
	},
	E7: {
		label: "E7",
		notes: build_maj_7("E"),
		key: "KeyE",
	},
	B7: {
		label: "B7",
		notes: build_maj_7("B"),
		key: "KeyR",
	},
	F: {
		label: "F",
		notes: build_maj("F"),
		key: "KeyA",
	},
	C: {
		label: "C",
		notes: build_maj("C"),
		key: "KeyS",
	},
	G: {
		label: "G",
		notes: build_maj("G"),
		key: "KeyD",
	},
	D7: {
		label: "D7",
		notes: build_maj_7("D"),
		key: "KeyF",
	},
};

function build_button(id, parent) {
	const new_btn = document.createElement("div");
	new_btn.classList.add("music-btn");

	const label = document.createElement("div");
	label.innerText = `${id}`;
	label.classList.add("music-btn__note-number");

	const sublabel = document.createElement("div");
	sublabel.innerText = "";
	sublabel.classList.add("music-btn__note-sublabel");

	new_btn.appendChild(label);
	new_btn.appendChild(sublabel);
	parent.appendChild(new_btn);

	buttons_by_pos[id] = new_btn;
}

function build_keyboard() {
	const kb = document.getElementById("keyboard");
	const top_row = document.createElement("div");
	top_row.classList.add("top-row");

	const bottom_row = document.createElement("div");
	bottom_row.classList.add("bottom-row");

	kb.appendChild(top_row);
	kb.appendChild(bottom_row);

	const ROW_LENGTH = 13;
	for (let i = 0; i < ROW_LENGTH; i++) {
		const button_id = i + 1;
		build_button(button_id, bottom_row);
	}

	for (let i = 0; i < ROW_LENGTH - 1; i++) {
		const button_id = i + 1 + ROW_LENGTH;
		build_button(button_id, top_row);
	}
}

function build_radio(parent, id, label, checked = false) {
	const input_element = document.createElement("input");
	input_element.type = "radio";
	input_element.className = "btn-check";
	input_element.name = RADIO_NAME;
	input_element.id = id;
	input_element.autocomplete = "off";
	input_element.checked = checked;
	input_element.value = id;
	input_element.onchange = function () {
		if (this.checked) {
			highlight_notes([]);
		}
	};

	const label_element = document.createElement("label");
	label_element.classList.add("btn", "btn-outline-primary");
	label_element.setAttribute("for", id);
	label_element.innerText = label;

	parent.appendChild(input_element);
	parent.appendChild(label_element);
}

function build_toolbar() {
	const toolbar = document.getElementById("toolbar");
	let active = true;
	for (const key in CHORD_INFOS) {
		build_radio(toolbar, key, CHORD_INFOS[key].label, active);
		active = false;
	}
}

function update_alert(text) {
	const alert = document.getElementById("alert");
	alert.innerHTML = text;
}

function encodeOffset(offset) {
	const readyOffsets = {
		0: "P1",
		3: "m3",
		4: "M3",
		6: "TT",
		7: "P5",
		10: "m7",
	};

	if (readyOffsets.hasOwnProperty(offset)) {
		return readyOffsets[offset];
	}

	return offset;
}

function show_selected_chord(note, active_chord_type) {
	const notes = [];
	for (const n of CHORD_INFOS[active_chord_type].builder(note)) {
		notes.push(n);
	}
	highlight_notes(notes);
}

function hover_button(note, inside) {
	return function () {
		const active_radio = document.querySelector(
			`input[name="${RADIO_NAME}"]:checked`
		);

		if (!inside) {
			highlight_notes([]);
		} else {
			show_selected_chord(note, active_radio.value);
		}
	};
}

function highlight_notes(notes) {
	update_alert("");
	for (const btn of Object.values(buttons_by_pos)) {
		btn.classList.remove("hover");
	}

	if (!notes.length) {
		return;
	}

	const missing_notes = notes.map((x) => x[1]);

	for (const [offset, n] of notes) {
		if (buttons_by_note.hasOwnProperty(n)) {
			missing_notes.splice(missing_notes.indexOf(n), 1);

			for (const btn of buttons_by_note[n]) {
				btn.classList.add("hover");

				btn.querySelector(".music-btn__note-sublabel").innerText =
					encodeOffset(offset);
			}
		}
	}

	const fragments = [];
	for (const [_, note] of notes) {
		if (missing_notes.indexOf(note) !== -1) {
			fragments.push(
				`<span class="text-danger fw-bolder">${note}</span>`
			);
		} else {
			fragments.push(`<span>${note}</span>`);
		}
	}

	update_alert(fragments.join(" "));
}

function attach_note(btn, note) {
	const label = document.createElement("div");
	label.innerText = note;
	label.classList.add("music-btn__note-label");

	btn.appendChild(label);

	if (!buttons_by_note.hasOwnProperty(note)) {
		buttons_by_note[note] = [];
	}

	buttons_by_note[note].push(btn);

	btn.onmouseenter = hover_button(note, true);
	btn.onmouseleave = hover_button(note, false);
}

function add_notes() {
	let pos = 3;
	let step = 12;
	const OCTAVE = "CDEFGAB";

	// keyboard specific
	for (let i = 0; i < 22; i++) {
		attach_note(buttons_by_pos[pos], OCTAVE[i % OCTAVE.length]);
		pos += step;
		step = 1 - step;
	}

	attach_note(buttons_by_pos[1], "D#");
	attach_note(buttons_by_pos[2], "G#");
	attach_note(buttons_by_pos[14], "F#");
}

function build_presets() {
	const root = document.getElementById("presets");
	for (const key in PRESET_INFOS) {
		build_preset(root, key, PRESET_INFOS[key].label, PRESET_INFOS[key].key);
	}
}

function format_key(key) {
	const match = key.match(/Key([A-Z])/);
	let key_name = key;
	if (match) {
		key_name = match[1];
	}

	return `<${key_name}>`;
}

function build_preset(parent, type, caption, key) {
	const preset = document.createElement("div");
	preset.className = "preset-btn";
	preset.onmouseenter = hover_preset(type, true);
	preset.onmouseleave = hover_preset(type, false);

	const wrapper = document.createElement("div");
	wrapper.className = "preset-btn__wrapper";

	const label = document.createElement("div");
	label.innerText = caption;
	label.classList.add("preset-btn__label");

	const sublabel = document.createElement("div");
	sublabel.innerText = format_key(key);
	sublabel.classList.add("preset-btn__sublabel");

	wrapper.appendChild(label);
	wrapper.appendChild(sublabel);
	preset.appendChild(wrapper);
	parent.appendChild(preset);

	preset_type_by_key[key] = type;
	preset_el_by_type[type] = preset;
}

function activate_preset(type) {
	highlight_notes([]);
	for (const el of Object.values(preset_el_by_type)) {
		el.classList.remove("hover");
	}

	if (preset_el_by_type.hasOwnProperty(type)) {
		preset_el_by_type[type].classList.add("hover");
		highlight_notes(PRESET_INFOS[type].notes);
	}
}

function hover_preset(type, inside) {
	if (inside) {
		return function () {
			activate_preset(type);
		};
	}

	return function () {
		activate_preset(null);
	};
}

function add_keyboard_handlers() {
	document.addEventListener("keypress", (event) => {
		const key_code = event.code;
		if (preset_type_by_key.hasOwnProperty(key_code)) {
			if (
				preset_el_by_type[
					preset_type_by_key[key_code]
				].classList.contains("hover")
			) {
				activate_preset(null);
			} else {
				activate_preset(preset_type_by_key[key_code]);
			}
		}
	});
}

export function main() {
	build_keyboard();
	build_toolbar();
	build_presets();
	add_notes();
	update_alert("Hover any button!");
	add_keyboard_handlers();
}
