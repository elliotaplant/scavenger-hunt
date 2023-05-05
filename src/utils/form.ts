// Validators
export function required<T>(value: T) {
  return value ? undefined : 'Required';
}
