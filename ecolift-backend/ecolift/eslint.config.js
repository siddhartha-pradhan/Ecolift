import eslintPluginJest from "eslint-plugin-jest";

export default [
    {
        plugins: {
            jest: eslintPluginJest
        },
        languageOptions: {
          globals: eslintPluginJest.environments.globals.globals,
        }
    }
];
