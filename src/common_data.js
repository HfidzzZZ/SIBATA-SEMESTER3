import { fileURLToPath } from "node:url";
import path from "node:path";

export const srcDir = path.dirname(fileURLToPath(import.meta.url));

