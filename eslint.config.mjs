import { defineConfig, globalIgnores } from "eslint/config";
import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import react from "eslint-plugin-react";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  globalIgnores(["**/*.config.js", ".expo*", "**/dist/**"]),
  {
    extends: fixupConfigRules(
      compat.extends(
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:react-hooks/recommended",
        "plugin:eslint-comments/recommended",
        "plugin:@typescript-eslint/recommended"
      )
    ),

    plugins: {
      react: fixupPluginRules(react),
      "@typescript-eslint": fixupPluginRules(typescriptEslint),
    },

    languageOptions: {
      globals: {
        ...globals.browser,
      },

      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",
    },

    settings: {
      react: {
        version: "detect",
      },
    },

    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "CallExpression[callee.property.name='useContext']",
          message:
            "Use a dedicated hook (for example useHeaderAction/useAuth) instead of calling useContext directly.",
        },
        {
          selector: "CallExpression[callee.name='useContext']",
          message:
            "Use a dedicated hook (for example useHeaderAction/useAuth) instead of calling useContext directly.",
        },
        {
          selector:
            "CallExpression[callee.property.name='useEffect'] > ArrowFunctionExpression[async=true]",
          message:
            "Do not make useEffect callbacks async. Use React Query for async server-state operations.",
        },
        {
          selector:
            "CallExpression[callee.name='useEffect'] > ArrowFunctionExpression[async=true]",
          message:
            "Do not make useEffect callbacks async. Use React Query for async server-state operations.",
        },
        {
          selector:
            "CallExpression[callee.property.name='useEffect'] FunctionDeclaration[async=true]",
          message:
            "Avoid async functions inside useEffect. Move async server-state work to React Query hooks.",
        },
        {
          selector:
            "CallExpression[callee.name='useEffect'] FunctionDeclaration[async=true]",
          message:
            "Avoid async functions inside useEffect. Move async server-state work to React Query hooks.",
        },
        {
          selector:
            "CallExpression[callee.property.name='useEffect'] VariableDeclarator > ArrowFunctionExpression[async=true]",
          message:
            "Avoid async functions inside useEffect. Move async server-state work to React Query hooks.",
        },
        {
          selector:
            "CallExpression[callee.name='useEffect'] VariableDeclarator > ArrowFunctionExpression[async=true]",
          message:
            "Avoid async functions inside useEffect. Move async server-state work to React Query hooks.",
        },
      ],
    },
  },
  {
    files: ["src/hooks/use-non-null-context.ts"],
    rules: {
      "no-restricted-syntax": "off",
    },
  },
]);
