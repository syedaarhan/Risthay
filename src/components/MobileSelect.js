"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronDown, Search, X, Check } from "lucide-react";

/**
 * MobileSelect – Premium bottom-sheet style select for mobile-first UX.
 *
 * Props:
 *   value        – currently selected value (string)
 *   onChange     – callback(newValue: string)
 *   options      – Array of strings OR Array of { value, label } objects
 *   placeholder  – text shown when nothing is selected (default "Select…")
 *   label        – optional title shown in the sheet header
 *   searchable   – bool: show search box (auto-true when >12 options)
 *   icon         – optional JSX element shown left of the trigger text
 *   disabled     – bool
 *   className    – extra className on the trigger wrapper
 *   required     – show red asterisk when no value
 */
export default function MobileSelect({
  value,
  onChange,
  options = [],
  placeholder = "Select…",
  label,
  searchable,
  icon,
  disabled = false,
  className = "",
  required = false,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const sheetRef = useRef(null);
  const searchRef = useRef(null);

  // Normalise options to { value, label } objects
  const normalised = options.map((o) =>
    typeof o === "string" ? { value: o, label: o } : o
  );

  const autoSearch = searchable !== undefined ? searchable : normalised.length > 12;

  const filtered =
    autoSearch && query.trim()
      ? normalised.filter((o) =>
          o.label.toLowerCase().includes(query.toLowerCase())
        )
      : normalised;

  const selectedLabel =
    normalised.find((o) => o.value === value)?.label ?? placeholder;

  const hasValue = value !== undefined && value !== "" && value !== null;

  // Focus search when sheet opens
  useEffect(() => {
    if (open && autoSearch && searchRef.current) {
      const t = setTimeout(() => searchRef.current?.focus(), 120);
      return () => clearTimeout(t);
    }
    if (!open) setQuery("");
  }, [open, autoSearch]);

  // Close on backdrop touch/click
  const handleBackdropClick = useCallback(
    (e) => {
      if (sheetRef.current && !sheetRef.current.contains(e.target)) {
        setOpen(false);
      }
    },
    []
  );

  const handleSelect = (val) => {
    onChange(val);
    setOpen(false);
  };

  return (
    <>
      {/* ── Trigger Button ─────────────────────────── */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(true)}
        className={[
          "ms-trigger",
          hasValue ? "ms-trigger--filled" : "",
          disabled ? "ms-trigger--disabled" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {icon && <span className="ms-trigger__icon">{icon}</span>}
        <span
          className={[
            "ms-trigger__label",
            !hasValue ? "ms-trigger__label--placeholder" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {selectedLabel}
        </span>
        {required && !hasValue && (
          <span style={{ color: "#ef4444", fontSize: "14px", marginLeft: "-2px" }}>*</span>
        )}
        <ChevronDown
          size={16}
          className={[
            "ms-trigger__chevron",
            open ? "ms-trigger__chevron--open" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        />
      </button>

      {/* ── Bottom Sheet ───────────────────────────── */}
      {open && (
        <div
          className="ms-backdrop"
          onMouseDown={handleBackdropClick}
          onTouchStart={handleBackdropClick}
        >
          <div className="ms-sheet" ref={sheetRef}>
            {/* Drag handle */}
            <div className="ms-handle" />

            {/* Header */}
            <div className="ms-sheet__header">
              <span className="ms-sheet__title">{label || placeholder}</span>
              <button
                type="button"
                className="ms-sheet__close"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search */}
            {autoSearch && (
              <div className="ms-search-wrap">
                <Search size={15} className="ms-search__icon" />
                <input
                  ref={searchRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search…"
                  className="ms-search"
                />
                {query && (
                  <button
                    type="button"
                    className="ms-search__clear"
                    onClick={() => setQuery("")}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            )}

            {/* Options list */}
            <div className="ms-options">
              {filtered.length === 0 ? (
                <div className="ms-empty">No results for "{query}"</div>
              ) : (
                filtered.map((o) => {
                  const isSelected = o.value === value;
                  return (
                    <button
                      key={o.value}
                      type="button"
                      className={[
                        "ms-option",
                        isSelected ? "ms-option--selected" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() => handleSelect(o.value)}
                    >
                      <span className="ms-option__label">{o.label}</span>
                      {isSelected && (
                        <span className="ms-option__check">
                          <Check size={15} strokeWidth={3} />
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
