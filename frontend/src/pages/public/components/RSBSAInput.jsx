import React, { useRef, useState } from "react";

export default function RSBSAInput({ value, onChange }) {
  const [rsbsa, setRsbsa] = useState(() => {
    if (value) {
      const parts = value.split('-').filter(part => part !== '');
      if (parts.length === 5) return parts;
    }
    return ["", "", "", "", ""];
  });

  const refs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];

  const lengths = [2, 3, 2, 3, 6];

  const handleChange = (index, inputValue) => {
    if (!/^\d*$/.test(inputValue)) return;

    const newValues = [...rsbsa];
    newValues[index] = inputValue;
    setRsbsa(newValues);

    const formattedValue = newValues.map((v, i) => 
      i < 4 ? (v ? v.padStart(lengths[i], '-') : '') : v
    ).join('-').replace(/-+/g, '-').replace(/-+$/, '');

    if (!formattedValue.endsWith('-') && newValues.every(v => v)) {
      onChange(newValues.join('-'));
    } else if (inputValue) {
      onChange(newValues.join('-'));
    }

    if (inputValue.length === lengths[index] && index < refs.length - 1) {
      refs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && rsbsa[index] === '' && index > 0) {
      refs[index - 1].current.focus();
    }
  };

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
        RSBSA Number
      </label>

      <div className="flex items-center gap-1.5 bg-white p-2.5 rounded-lg border border-gray-200 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-500/10 transition-all">
        {rsbsa.map((val, i) => (
          <React.Fragment key={i}>
            <input
              ref={refs[i]}
              type="text"
              inputMode="numeric"
              value={val}
              maxLength={lengths[i]}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-10 sm:w-11 px-2 py-1.5 text-sm border border-gray-200 rounded-md text-center font-semibold text-gray-700 bg-gray-50 focus:bg-white focus:border-green-500 focus:outline-none transition-all"
              placeholder={'-'.repeat(lengths[i])}
            />
            {i < 4 && <span className="text-gray-400 font-bold text-sm">-</span>}
          </React.Fragment>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-1.5">Format: XX-XXX-XX-XXX-XXXXXX</p>
    </div>
  );
}