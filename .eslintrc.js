module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true,
  },
  extends: ["eslint:recommended", "plugin:prettier/recommended"],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
  },
  parserOptions: {
    ecmaVersion: 2017,
  },
  rules: {
    "prettier/prettier": [
      "error",
      {
        //Add prettier formatting rules here
      },
    ],
    //Add ESLint linting rules here
    "no-console": "off",
    "no-unused-vars": "warn",
  },
};
