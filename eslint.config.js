import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import pluginPrettier from "eslint-plugin-prettier";

export default [
  // Ignore build directory
  { ignores: ["dist"] },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      prettier: pluginPrettier,
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    rules: {
      // ESLint recommended rules
      ...js.configs.recommended.rules,
      // React Hooks rules
      ...reactHooks.configs.recommended.rules,
      // React Refresh rules
      ...reactRefresh.configs.recommended.rules,
      // Prettier rules to disable conflicting ESLint rules
      ...pluginPrettier.configs.recommended.rules,
      // Custom overrides
      "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
];

// React rules
