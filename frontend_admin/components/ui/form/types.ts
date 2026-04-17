import type {ReactNode} from 'react';

/**
 * 表单字段类型枚举
 */
export type FieldType =
  | 'text'      // 单行文本
  | 'email'     // 邮箱
  | 'password'  // 密码
  | 'number'    // 数字
  | 'textarea'  // 多行文本
  | 'select'    // 下拉选择
  | 'switch'    // 开关
  | 'checkbox'  // 复选框
  | 'radio'     // 单选框
  | 'date'      // 日期
  | 'color';    // 颜色选择器

/**
 * 选项类型（用于 select、radio）
 */
export interface FieldOption {
  value: string | number;
  label: ReactNode;
  disabled?: boolean;
}

/**
 * 表单字段配置
 */
export interface FormFieldConfig {
  key: string;
  label: string;
  type: FieldType;

  /** 🧱 Grid 布局占位（1 = 半行，2 = 整行） */
  colSpan?: 1 | 2;

  placeholder?: string;
  options?: readonly FieldOption[];
  rows?: number;
  min?: number;
  max?: number;
  step?: string;
  required?: boolean;
  disabled?: boolean;
  description?: string;
}


/**
 * 表单字段组件属性
 */
export interface FormFieldProps {
  field: FormFieldConfig;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  className?: string;
}
