import React, { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';

interface ChipsInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  label?: string;
  placeholder?: string;
  helpText?: string;
  maxItems?: number;
}

export const ChipsInput: React.FC<ChipsInputProps> = ({
  value = [],
  onChange,
  label,
  placeholder = 'Add tag (press Enter)',
  helpText,
  maxItems,
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      
      // Check max items
      if (maxItems && value.length >= maxItems) {
        return;
      }

      // Check for duplicates
      if (!value.includes(inputValue.trim())) {
        onChange([...value, inputValue.trim()]);
      }
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      // Remove last tag on backspace when input is empty
      onChange(value.slice(0, -1));
    }
  };

  const removeTag = (indexToRemove: number) => {
    onChange(value.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-brand-mist mb-1">
          {label}
        </label>
      )}

      <div className="w-full p-2 bg-brand-night border border-gray-600 rounded-md focus-within:ring-2 focus-within:ring-brand-accent">
        {/* Tags Display */}
        <div className="flex flex-wrap gap-2 mb-2">
          {value.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2 py-1 bg-brand-accent/20 text-brand-accent rounded text-sm"
            >
              {tag}
              <button
                onClick={() => removeTag(index)}
                className="hover:text-white"
                type="button"
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>

        {/* Input */}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={maxItems && value.length >= maxItems ? `Maximum ${maxItems} tags` : placeholder}
          disabled={maxItems ? value.length >= maxItems : false}
          className="w-full bg-transparent border-none outline-none text-white placeholder-gray-500"
        />
      </div>

      {/* Help Text */}
      {helpText && (
        <p className="mt-1 text-xs text-brand-mist">
          {helpText}
          {maxItems && ` (${value.length}/${maxItems})`}
        </p>
      )}
    </div>
  );
};
