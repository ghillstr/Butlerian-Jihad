"use client";

import { useState } from "react";

export default function AttendeePicker({
  knownNames,
  selected,
  onChange,
}: {
  knownNames: string[];
  selected: string[];
  onChange: (names: string[]) => void;
}) {
  const [newName, setNewName] = useState("");

  function toggle(name: string) {
    if (selected.includes(name)) {
      onChange(selected.filter((n) => n !== name));
    } else {
      onChange([...selected, name]);
    }
  }

  function addNewName() {
    const trimmed = newName.trim();
    if (trimmed && !selected.includes(trimmed)) {
      onChange([...selected, trimmed]);
    }
    setNewName("");
  }

  const extraSelected = selected.filter((n) => !knownNames.includes(n));

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {knownNames.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => toggle(name)}
            className={`rounded-full border px-3 py-1 text-sm transition ${
              selected.includes(name)
                ? "border-spice bg-spice text-white"
                : "border-dune/40 bg-white text-ink hover:bg-parchment"
            }`}
          >
            {name}
          </button>
        ))}
        {extraSelected.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => toggle(name)}
            className="rounded-full border border-spice bg-spice px-3 py-1 text-sm text-white"
          >
            {name}
          </button>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          className="input"
          placeholder="Add someone new..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addNewName();
            }
          }}
        />
        <button type="button" className="btn-secondary" onClick={addNewName}>
          Add
        </button>
      </div>
    </div>
  );
}
