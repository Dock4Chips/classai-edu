'use client';

import { Select } from '@/components/ui/select';
import { cn } from '@/utils/cn';
import type { FormFieldConfig, FormFieldProps } from './types';

export function FormField({
  field,
  value,
  onChange,
  error,
  className = '',
}: FormFieldProps) {
  const baseInputClass =
    'w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white ' +
    'focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition';

  /** ---------- SELECT（统一使用 Select 组件） ---------- */
  if (field.type === 'select') {
    return (
      <div className={cn('space-y-1.5', className)}>
        <label className="text-sm font-medium text-gray-700">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>

        <Select
          value={value ?? ''}
          onChange={(v) => onChange(v)}
          options={field.options?.map(opt => ({
            value: opt.value,
            label: opt.label,
            disabled: opt.disabled,
          })) || []}
          placeholder={field.placeholder || 'Please select'}
          size="md"
        />

        {field.description && (
          <p className="text-xs text-gray-500">{field.description}</p>
        )}
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  /** ---------- TEXTAREA ---------- */
  if (field.type === 'textarea') {
    return (
      <div className={cn('space-y-1.5', className)}>
        <label className="text-sm font-medium text-gray-700">
          {field.label}
        </label>
        <textarea
          rows={field.rows ?? 3}
          value={value ?? ''}
          placeholder={field.placeholder}
          onChange={e => onChange(e.target.value)}
          className={baseInputClass}
        />
      </div>
    );
  }

  /** ---------- COLOR PICKER ---------- */
  if (field.type === 'color') {
    return (
      <div className={cn('space-y-1.5', className)}>
        <label className="text-sm font-medium text-gray-700">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>

        <div className="flex items-center gap-3">
          {/* 颜色预览和输入框 */}
          <div className="flex-1 flex items-center gap-2">
            <input
              type="color"
              value={value || '#FF0000'}
              onChange={e => onChange(e.target.value)}
              className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer"
              style={{padding: '2px'}}
            />
            <input
              type="text"
              value={value || ''}
              placeholder="#FF0000"
              onChange={e => onChange(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 font-mono text-sm"
              pattern="^#[0-9A-Fa-f]{6}$"
            />
          </div>
        </div>

        {/* 预设颜色 */}
        <div className="flex gap-2 mt-2">
          {['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080'].map(presetColor => (
            <button
              key={presetColor}
              type="button"
              onClick={() => onChange(presetColor)}
              className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
              style={{backgroundColor: presetColor}}
              title={presetColor}
            />
          ))}
        </div>

        {field.description && (
          <p className="text-xs text-gray-500">{field.description}</p>
        )}
      </div>
    );
  }

  /** ---------- DEFAULT INPUT ---------- */
  return (
    <div className={cn('space-y-1.5', className)}>
      <label className="text-sm font-medium text-gray-700">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <input
        type={field.type}
        value={value ?? ''}
        placeholder={field.placeholder}
        disabled={field.disabled}
        min={field.min}
        max={field.max}
        step={field.step}
        onChange={e => onChange(e.target.value)}
        className={cn(
          baseInputClass,
          error && 'border-red-500'
        )}
      />

      {field.description && (
        <p className="text-xs text-gray-500">{field.description}</p>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
