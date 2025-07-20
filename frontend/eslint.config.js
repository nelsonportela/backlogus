import js from "@eslint/js";
import vue from "eslint-plugin-vue";
import prettier from "@vue/eslint-config-prettier";

export default [
  js.configs.recommended,
  ...vue.configs["flat/essential"],
  prettier,
  {
    files: ["**/*.{js,vue}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        process: "readonly",
      },
    },
    rules: {
      "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
      "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
      "vue/multi-word-component-names": "off",
    },
  },
  {
    ignores: ["dist/**", "node_modules/**"],
  },
];
