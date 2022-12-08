// Make all keys in T nullable
// Nullable<{ a: string, b: number }> --> { a: string | null, b: number | null }
export type Nullable<T> = {
  [Key in keyof T]: T[Key] | null;
};
