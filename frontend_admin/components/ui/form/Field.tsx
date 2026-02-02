'use client';

import { Dropdown, DropdownButton } from '@/components/ui/dropdown';
import { cn } from '@/utils/cn'; // 如果你没有 cn，可以直接删掉用字符串拼接
import type {
  FormFieldProps,
} from './types'; // 如果你没拆文件，可以直接 inline

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

  /** ---------- SELECT（自定义 Dropdown） ---------- */
  if (field.type === 'select') {
    const selected = field.options?.find(opt => opt.value === value);

    return (
      <div className={cn('space-y-1.5', className)}>
        <label className="text-sm font-medium text-gray-700">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>

        <Dropdown
          trigger={
            <DropdownButton
              variant="default"
              className={cn(
                'w-full justify-between',
                error && 'border-red-500'
              )}
            >
              <span className={selected ? 'text-gray-900' : 'text-gray-400'}>
                {selected?.label || field.placeholder || 'Please select'}
              </span>
            </DropdownButton>
          }
          items={
            field.options?.map(opt => ({
              key: String(opt.value),
              label: opt.label,
              disabled: opt.disabled,
              onClick: () => onChange(opt.value),
            })) || []
          }
          menuClassName="w-full"
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
