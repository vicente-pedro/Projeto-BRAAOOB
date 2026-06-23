import { useState, useEffect, useRef } from 'react';
import { formatDateBR, parseDateBR, maskDateBR } from '../utils/date';

export default function DateInputBR({ id, label, value, onChange, min, max }) {
  const [display, setDisplay] = useState('');
  const pickerRef = useRef(null);
  const safeValue = typeof value === 'string' ? value : '';

  useEffect(() => {
    setDisplay(safeValue ? formatDateBR(safeValue) : '');
  }, [safeValue]);

  const handleTextChange = (e) => {
    const masked = maskDateBR(e.target.value);
    setDisplay(masked);
    if (masked.length === 10) {
      const iso = parseDateBR(masked);
      onChange(iso || '');
    } else if (masked.length === 0) {
      onChange('');
    }
  };

  const handlePickerChange = (e) => {
    const iso = e.target.value;
    onChange(iso || '');
    setDisplay(iso ? formatDateBR(iso) : '');
  };

  const openPicker = () => {
    const el = pickerRef.current;
    if (!el) return;
    try {
      if (typeof el.showPicker === 'function') {
        el.showPicker();
        return;
      }
    } catch {
      /* fallback */
    }
    el.focus();
    el.click();
  };

  return (
    <div className="form-group date-input-br-wrap">
      {label && <label htmlFor={id}>{label}</label>}
      <div className="date-input-br">
        <input
          id={id}
          type="text"
          inputMode="numeric"
          placeholder="dd/mm/aaaa"
          value={display}
          onChange={handleTextChange}
          maxLength={10}
          autoComplete="off"
        />
        <div className="date-input-br-picker-wrap">
          <button
            type="button"
            className="date-input-br-btn"
            onClick={openPicker}
            title="Abrir calendário"
            aria-label="Abrir calendário de datas"
          >
            📅
          </button>
          <input
            ref={pickerRef}
            type="date"
            className="date-input-br-picker-overlay"
            value={safeValue}
            min={min || undefined}
            max={max || undefined}
            onChange={handlePickerChange}
            tabIndex={-1}
            aria-hidden
          />
        </div>
      </div>
    </div>
  );
}
