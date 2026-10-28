import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/**"],
    rules: {
      // Logs de depuración fuera de producción; warn/error quedan para errores reales
      "no-console": ["error", { allow: ["warn", "error"] }],
    },
  },
  {
    // Herramientas de línea de comandos en Node (CommonJS): imprimen progreso por consola
    files: ["scripts/**/*.{js,mjs,cjs}"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
