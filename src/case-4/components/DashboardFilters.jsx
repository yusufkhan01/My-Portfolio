import React from "react";

// A labelled dropdown. Every control has a visible <label> tied to it by id.
function SelectControl({ id, label, value, options, onChange }) {
  return (
    <div className="vm-field">
      <label className="vm-field-label" htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        className="vm-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// A segmented button group (used for the metric toggle). Behaves as a
// radiogroup so it is keyboard- and screen-reader-friendly.
function SegmentedControl({ id, label, value, options, onChange }) {
  return (
    <div className="vm-field">
      <span className="vm-field-label" id={`${id}-label`}>
        {label}
      </span>
      <div className="vm-seg" role="radiogroup" aria-labelledby={`${id}-label`}>
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={value === opt.value}
            className={"vm-seg-btn" + (value === opt.value ? " is-active" : "")}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Renders a group of controls from a config array so the same component can
// drive both charts' filters. Each control declares its own `type`.
export default function DashboardFilters({ ariaLabel, controls }) {
  return (
    <div className="vm-controls" role="group" aria-label={ariaLabel}>
      {controls.map((control) =>
        control.type === "segmented" ? (
          <SegmentedControl key={control.id} {...control} />
        ) : (
          <SelectControl key={control.id} {...control} />
        )
      )}
    </div>
  );
}

export { SelectControl, SegmentedControl };
