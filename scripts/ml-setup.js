// Cross-platform ML environment bootstrap: creates apps/ml/.venv, installs
// requirements.txt, and trains the models. Implemented in Node (rather than
// a shell one-liner in package.json) so it behaves the same under cmd.exe,
// PowerShell, and POSIX shells — venv layout differs (Scripts/ vs bin/) and
// cmd.exe in particular won't resolve a forward-slash executable path.
const { spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const mlDir = path.resolve(__dirname, "..", "apps", "ml");
const venvDir = path.join(mlDir, ".venv");
const venvPython = process.platform === "win32"
  ? path.join(venvDir, "Scripts", "python.exe")
  : path.join(venvDir, "bin", "python");

function run(command, args) {
  const result = spawnSync(command, args, { cwd: mlDir, stdio: "inherit" });
  if (result.status !== 0) {
    console.error(`Command failed: ${command} ${args.join(" ")}`);
    process.exit(result.status ?? 1);
  }
}

if (!fs.existsSync(venvPython)) {
  console.log("Creating Python virtual environment for the ML service...");
  run(process.platform === "win32" ? "python" : "python3", ["-m", "venv", ".venv"]);
}

console.log("Installing ML service dependencies...");
run(venvPython, ["-m", "pip", "install", "-q", "--upgrade", "pip"]);
run(venvPython, ["-m", "pip", "install", "-q", "-r", "requirements.txt"]);

console.log("Training synthetic-data models...");
run(venvPython, ["train.py"]);

console.log("ML setup complete.");
