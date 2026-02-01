type PlainObject = Record<string, any>;

/**
 * 构建请求参数
 * - 自动移除值为 null 的字段
 * - 保留 0 / false / 非空字符串
 */
export function buildParams<T extends PlainObject>(params: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== null)
  ) as Partial<T>;
}
