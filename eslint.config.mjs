const eslintConfig = [
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  {
    // Default ignores of eslint-config-next:
    ignorePatterns: ['.next/**', 'out/**', 'build/**', 'next-env.d.ts']
  }
];

export default eslintConfig;
