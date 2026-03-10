import { createRequire } from "module";
import prettierConfig from "eslint-config-prettier";

const require = createRequire(import.meta.url);
const nextConfig = require("eslint-config-next");

const eslintConfig = [...nextConfig, prettierConfig];

export default eslintConfig;
