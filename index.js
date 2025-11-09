#!/usr/bin/env node
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const args = process.argv.slice(2);
const projectName = args.find(a => !a.startsWith("--")) || "my-app";
const useJS = args.includes("--js");

// directory of this generator script (used to copy local assets into new projects)
const generatorDir = path.dirname(fileURLToPath(import.meta.url));

console.log(`
🚀 Creating new ${useJS ? "JavaScript" : "TypeScript"} React + Vite + Tailwind project: ${projectName}
`);

// 1. Create the project (pipe input to skip interactive prompts)
const viteTemplate = useJS ? "react" : "react-ts";
execSync(`echo -e "n\\nn\\n" | npx --yes create-vite@latest ${projectName} --template ${viteTemplate}`, { 
  stdio: "inherit",
  shell: "/bin/bash"
});

// 2. Move into project
process.chdir(projectName);

// 3. Install deps
execSync("npm install", { stdio: "inherit" });

// 4. Install Tailwind v4 + PostCSS
execSync("npm install -D tailwindcss @tailwindcss/postcss postcss", { stdio: "inherit" });

// 5. Create PostCSS config
fs.writeFileSync(
  "postcss.config.mjs",
  `const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
`
);

// 6. Replace index.css with Tailwind import + small helper CSS (spin animation)
fs.writeFileSync(
  "src/index.css",
  `@import "tailwindcss";

@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin-slow {
  animation: spin-slow 20s linear infinite;
}
`
);

// 7. Delete App.css if it exists
const appCssFile = "src/App.css";
if (fs.existsSync(appCssFile)) {
  fs.unlinkSync(appCssFile);
}

// 7a. Create tailwind.svg in src/assets/ (react.svg is already created by Vite)
try {
  const assetsDir = path.join(process.cwd(), "src", "assets");
  fs.mkdirSync(assetsDir, { recursive: true });

  const tailwindSvg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 54 33"><g clip-path="url(#prefix__clip0)"><path fill="#38bdf8" fill-rule="evenodd" d="M27 0c-7.2 0-11.7 3.6-13.5 10.8 2.7-3.6 5.85-4.95 9.45-4.05 2.054.513 3.522 2.004 5.147 3.653C30.744 13.09 33.808 16.2 40.5 16.2c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.054-.513-3.522-2.004-5.147-3.653C36.756 3.11 33.692 0 27 0zM13.5 16.2C6.3 16.2 1.8 19.8 0 27c2.7-3.6 5.85-4.95 9.45-4.05 2.054.514 3.522 2.004 5.147 3.653C17.244 29.29 20.308 32.4 27 32.4c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.054-.513-3.522-2.004-5.147-3.653C23.256 19.31 20.192 16.2 13.5 16.2z" clip-rule="evenodd"/></g><defs><clipPath id="prefix__clip0"><path fill="#fff" d="M0 0h54v32.4H0z"/></clipPath></defs></svg>`;
  
  fs.writeFileSync(path.join(assetsDir, "tailwind.svg"), tailwindSvg);
} catch (err) {
  // non-fatal: if writing fails, continue without crashing the generator
  // console.warn('Could not create tailwind.svg:', err);
}

// 8. Replace App component with the current `hello-world` App.jsx style
const appFile = useJS ? "src/App.jsx" : "src/App.tsx";
const appContent = useJS ? `import { useState } from "react";

import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import tailwindLogo from './assets/tailwind.svg'

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="flex justify-center items-center gap-5 mb-5">
            <a href="https://vite.dev" target="_blank" rel="noreferrer">
              <img src={viteLogo} className="h-30 w-30 block align-middle hover:drop-shadow-lg transition-all" alt="Vite logo" />
              <h1 className="text-4xl font-bold mt-4">Vite</h1>
            </a>
            <p className="text-5xl font-semibold">+</p>
            <a href="https://react.dev" target="_blank" rel="noreferrer">
              <img src={reactLogo} className="h-30 w-30 block align-middle hover:drop-shadow-lg transition-all animate-spin-slow" alt="React logo" />
              <h1 className="text-4xl font-bold mt-4">React</h1>
            </a>
            <p className="text-5xl font-semibold">+</p>
            <a href="https://tailwindcss.com" target="_blank" rel="noreferrer">
              <img src={tailwindLogo} className="h-30 w-30 block align-middle hover:drop-shadow-lg transition-all" alt="Tailwind logo" />
              <h1 className="text-4xl font-bold mt-4">Tailwind</h1>
            </a>
          </div>
        </div>
        
        <div className="bg-gray-800 p-12 rounded-xl">
          <p className="text-7xl font-bold mb-8">{count}</p>
          <div className="flex gap-6 justify-center">
            <button
              onClick={() => setCount(count + 1)}
              className="bg-gray-700 px-6 py-3 rounded-lg hover:bg-gray-600 text-2xl font-bold"
            >
              +
            </button>
            <button
              onClick={() => setCount(0)}
              className="bg-gray-700 px-6 py-3 rounded-lg hover:bg-gray-600 text-lg font-bold"
            >
              Reset
            </button>
            <button
              onClick={() => setCount(count - 1)}
              className="bg-gray-700 px-6 py-3 rounded-lg hover:bg-gray-600 text-2xl font-bold"
            >
              -
            </button>
          </div>
        </div>
        
        <p className="text-gray-500 text-base mt-8">
          Edit <code className="bg-gray-800 px-3 py-1 rounded">src/App.jsx</code> to get started
        </p>
      </div>
    </div>
  );
}
` : `import { useState } from "react";

import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import tailwindLogo from './assets/tailwind.svg'

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="flex justify-center items-center gap-5 mb-5">
            <a href="https://vite.dev" target="_blank" rel="noreferrer">
              <img src={viteLogo} className="h-30 w-30 block align-middle hover:drop-shadow-lg transition-all" alt="Vite logo" />
              <h1 className="text-4xl font-bold mt-4">Vite</h1>
            </a>
            <p className="text-5xl font-semibold">+</p>
            <a href="https://react.dev" target="_blank" rel="noreferrer">
              <img src={reactLogo} className="h-30 w-30 block align-middle hover:drop-shadow-lg transition-all animate-spin-slow" alt="React logo" />
              <h1 className="text-4xl font-bold mt-4">React</h1>
            </a>
            <p className="text-5xl font-semibold">+</p>
            <a href="https://tailwindcss.com" target="_blank" rel="noreferrer">
              <img src={tailwindLogo} className="h-30 w-30 block align-middle hover:drop-shadow-lg transition-all" alt="Tailwind logo" />
              <h1 className="text-4xl font-bold mt-4">Tailwind</h1>
            </a>
          </div>
        </div>
        
        <div className="bg-gray-800 p-12 rounded-xl">
          <p className="text-7xl font-bold mb-8">{count}</p>
          <div className="flex gap-6 justify-center">
            <button
              onClick={() => setCount(count + 1)}
              className="bg-gray-700 px-6 py-3 rounded-lg hover:bg-gray-600 text-2xl font-bold"
            >
              +
            </button>
            <button
              onClick={() => setCount(0)}
              className="bg-gray-700 px-6 py-3 rounded-lg hover:bg-gray-600 text-lg font-bold"
            >
              Reset
            </button>
            <button
              onClick={() => setCount(count - 1)}
              className="bg-gray-700 px-6 py-3 rounded-lg hover:bg-gray-600 text-2xl font-bold"
            >
              -
            </button>
          </div>
        </div>
        
        <p className="text-gray-500 text-base mt-8">
          Edit <code className="bg-gray-800 px-3 py-1 rounded">src/App.tsx</code> to get started
        </p>
      </div>
    </div>
  );
}
`;

fs.writeFileSync(appFile, appContent);

// 9. Success message
console.log(`
✅ Project setup complete!

Next steps:
  cd ${projectName}
  npm run dev

Happy hacking!
`);
