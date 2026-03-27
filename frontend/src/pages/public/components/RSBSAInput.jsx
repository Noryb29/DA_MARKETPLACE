import { useRef, useState, useEffect } from "react";

export default function RSBSAInput({ value, onChange }) {
  const [rsbsa, setRsbsa] = useState(["", "", "", "", ""]);

  const refs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];

  const lengths = [2, 3, 2, 3, 6];

  // Sync parent value to local state
  useEffect(() => {
    if (value) {
      const parts = value.split('-').filter(part => part !== '');
      if (parts.length === 5) {
        setRsbsa(parts);
      }
    }
  }, [value]);

  const handleChange = (index, inputValue) => {
    if (!/^\d*$/.test(inputValue)) return;

    const newValues = [...rsbsa];
    newValues[index] = inputValue;
    setRsbsa(newValues);

    // Update parent component with full RSBSA number
    onChange(newValues.join('-'));

    // Auto-focus next input when current field is full
    if (inputValue.length === lengths[index] && index < refs.length - 1) {
      refs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Allow backspace to move to previous field
    if (e.key === 'Backspace' && rsbsa[index] === '' && index > 0) {
      refs[index - 1].current.focus();
    }
  };

  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">
        RSBSA Number
      </label>

      <div className="flex gap-1">
        {rsbsa.map((val, i) => (
          <input
            key={i}
            ref={refs[i]}
            type="text"
            inputMode="numeric"
            value={val}
            maxLength={lengths[i]}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className="w-19.5 px-1.5 py-1 text-sm border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent font-semibold"
            placeholder="0"
          />
        ))}
      </div>
    </div>
  );
}
