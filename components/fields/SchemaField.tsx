import React from 'react';
import type { FieldSchema } from '../../schemas/blockSchemas';
import type { Locale, LocalizedString, MediaRef } from '../../types';
import { ImageUpload } from './ImageUpload';
import { ChipsInput } from './ChipsInput';

interface SchemaFieldProps {
  schema: FieldSchema;
  value: any;
  onChange: (value: any) => void;
  activeLocale: Locale;
  error?: string | null;
}

export const SchemaField: React.FC<SchemaFieldProps> = ({
  schema,
  value,
  onChange,
  activeLocale,
  error,
}) => {
  const { name, label, type, placeholder, helpText, options, validation } = schema;

  // Localized Text Input
  if (type === 'localized-text' || type === 'localized-textarea') {
    const localizedValue = value as LocalizedString || { en: '', ua: '', pl: '' };
    
    const handleLocalizedChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onChange({ ...localizedValue, [activeLocale]: e.target.value });
    };

    const currentValue = localizedValue[activeLocale] || '';
    const isLong = type === 'localized-textarea' || currentValue.length > 60;

    const commonProps = {
      id: name,
      value: currentValue,
      onChange: handleLocalizedChange,
      placeholder,
      className: `w-full p-2 bg-brand-night border ${error ? 'border-red-500' : 'border-gray-600'} rounded-md focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500' : 'focus:ring-brand-accent'}`,
    };

    return (
      <div className="mb-4">
        <label htmlFor={name} className="block text-sm font-medium text-brand-mist mb-1">
          {label}
          {validation?.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {isLong ? (
          <textarea {...commonProps} rows={4} />
        ) : (
          <input type="text" {...commonProps} />
        )}
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
        {helpText && !error && <p className="mt-1 text-xs text-brand-mist">{helpText}</p>}
      </div>
    );
  }

  // Regular Text Input
  if (type === 'text') {
    return (
      <div className="mb-4">
        <label htmlFor={name} className="block text-sm font-medium text-brand-mist mb-1">
          {label}
          {validation?.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          type="text"
          id={name}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full p-2 bg-brand-night border ${error ? 'border-red-500' : 'border-gray-600'} rounded-md focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500' : 'focus:ring-brand-accent'}`}
        />
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
        {helpText && !error && <p className="mt-1 text-xs text-brand-mist">{helpText}</p>}
      </div>
    );
  }

  // Textarea
  if (type === 'textarea') {
    return (
      <div className="mb-4">
        <label htmlFor={name} className="block text-sm font-medium text-brand-mist mb-1">
          {label}
          {validation?.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <textarea
          id={name}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className={`w-full p-2 bg-brand-night border ${error ? 'border-red-500' : 'border-gray-600'} rounded-md focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500' : 'focus:ring-brand-accent'}`}
        />
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
        {helpText && !error && <p className="mt-1 text-xs text-brand-mist">{helpText}</p>}
      </div>
    );
  }

  // Number Input
  if (type === 'number') {
    return (
      <div className="mb-4">
        <label htmlFor={name} className="block text-sm font-medium text-brand-mist mb-1">
          {label}
          {validation?.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          type="number"
          id={name}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
          placeholder={placeholder}
          min={validation?.min}
          max={validation?.max}
          className={`w-full p-2 bg-brand-night border ${error ? 'border-red-500' : 'border-gray-600'} rounded-md focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500' : 'focus:ring-brand-accent'}`}
        />
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
        {helpText && !error && <p className="mt-1 text-xs text-brand-mist">{helpText}</p>}
      </div>
    );
  }

  // Select Dropdown
  if (type === 'select' && options) {
    return (
      <div className="mb-4">
        <label htmlFor={name} className="block text-sm font-medium text-brand-mist mb-1">
          {label}
          {validation?.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <select
          id={name}
          value={value || schema.defaultValue || ''}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full p-2 bg-brand-night border ${error ? 'border-red-500' : 'border-gray-600'} rounded-md focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500' : 'focus:ring-brand-accent'}`}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
        {helpText && !error && <p className="mt-1 text-xs text-brand-mist">{helpText}</p>}
      </div>
    );
  }

  // Switch/Toggle
  if (type === 'switch') {
    return (
      <div className="mb-4">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm font-medium text-brand-mist">
            {label}
            {validation?.required && <span className="text-red-500 ml-1">*</span>}
          </span>
          <div className="relative">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => onChange(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`w-11 h-6 rounded-full transition-colors ${
                value ? 'bg-brand-accent' : 'bg-gray-600'
              }`}
            >
              <div
                className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                  value ? 'transform translate-x-5' : ''
                }`}
              />
            </div>
          </div>
        </label>
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
        {helpText && !error && <p className="mt-1 text-xs text-brand-mist">{helpText}</p>}
      </div>
    );
  }

  // Chips/Tags Input
  if (type === 'chips') {
    return (
      <ChipsInput
        value={value || []}
        onChange={onChange}
        label={label}
        placeholder={placeholder}
        helpText={helpText}
        maxItems={validation?.maxItems}
      />
    );
  }

  // Image Upload
  if (type === 'image') {
    return (
      <ImageUpload
        value={value as MediaRef}
        onChange={onChange}
        label={label}
        helpText={helpText}
        accept={validation?.accept}
      />
    );
  }

  // Fallback for unsupported types
  return (
    <div className="mb-4">
      <p className="text-sm text-yellow-500">
        Unsupported field type: {type}
      </p>
    </div>
  );
};
