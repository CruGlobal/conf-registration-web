// Set environment variables while `load` runs, then put them back. A value of
// undefined unsets the variable.
export const withEnv = <T>(
  env: Record<string, string | undefined>,
  load: () => T,
): T => {
  const set = (values: Record<string, string | undefined>) => {
    Object.entries(values).forEach(([name, value]) => {
      if (value === undefined) {
        delete process.env[name];
      } else {
        process.env[name] = value;
      }
    });
  };
  const saved = Object.fromEntries(
    Object.keys(env).map((name) => [name, process.env[name]]),
  );
  set(env);
  try {
    return load();
  } finally {
    set(saved);
  }
};
