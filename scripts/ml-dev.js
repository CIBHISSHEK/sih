// Cross-platform launcher for the ML service dev server — see ml-setup.js
// for why this isn't just a shell one-liner in package.json.
const { spawnSync } = require("child_process");
const path = require("path");

const mlDir = path.resolve(__dirname, "..", "apps", "ml");
const venvPython = process.platform === "win32"
  ? path.join(mlDir, ".venv", "Scripts", "python.exe")
  : path.join(mlDir, ".venv", "bin", "python");

// Note: uvicorn's --reload watches the whole cwd, including .venv, so an
// occasional spurious reload from a package-internal file touch is possible
// (harmless — it just restarts). --reload-exclude with a "*" glob was tried
// here but Windows Python's CRT-level argv wildcard expansion silently
// expanded ".venv/*" into real filenames before uvicorn ever saw the flag,
// breaking startup entirely — not worth the platform risk for a cosmetic fix.
const result = spawnSync(
  venvPython,
  ["-m", "uvicorn", "main:app", "--port", process.env.ML_PORT || "8000", "--reload"],
  { cwd: mlDir, stdio: "inherit" }
);
process.exit(result.status ?? 0);
