// prettier.config.js or .prettierrc.js
module.exports = {
  trailingComma: "es5", // default is "es5" 
  tabWidth: 2, // default is 4
  semi: true, // default is true
  singleQuote: true, // default is false *
  bracketSpacing:false, // default is true *
  overrides: [
    {
      files: "*.xxx",
      options: {
        semi: true
      }
    },
    {
      files: ["*.xxx", "xxx/**/*.*"],
      options: {
        tabWidth: 4
      }
    }
  ]
}

