module.exports = {
  "env": {
    "browser": true,
    "es2021": true
  },
  "extends": "plugin:react/recommended",
  "overrides": [
    {
      "env": {
        "node": true
      },
      "files": [
        ".eslintrc.{js,cjs}"
      ],
      "parserOptions": {
        "sourceType": "script"
      }
    }
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "plugins": [
    "@typescript-eslint",
    "react"
  ],
  "rules": {
    "indent": ["error", 2], // Enforce 2-space indentation

    "semi": ["error", "always"], // Enforce semicolons

    "react/prop-types": "off", // Turn off prop-types enforcement (useful if you're using TypeScript)
    "react/jsx-uses-react": "off", // Turn off React in JSX scope rule
    "react/react-in-jsx-scope": "off", // Turn off React in JSX scope rule
    "react/jsx-no-target-blank": "off", // Turn off rule about target="_blank" in JSX
    "no-console": "warn", // Warn on console.log usage
    "no-unused-vars": "warn", // Warn on unused variables
    "@typescript-eslint/no-unused-vars": ["warn"], // Warn on unused variables (TypeScript)
  

           
  }
};

