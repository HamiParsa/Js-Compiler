"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { FaJs } from "react-icons/fa";

const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

type ExecResponse = {
  stdout: string;
  stderr: string;
};

export default function Home() {
  const [code, setCode] = useState("console.log('Hello World!');");
  const [stdout, setStdout] = useState("");
  const [stderr, setStderr] = useState("");
  const [loading, setLoading] = useState(false);

  const runCode = async () => {
    setLoading(true);
    setStdout("");
    setStderr("");

    try {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data: ExecResponse = await res.json();
      setStdout(data.stdout);
      setStderr(data.stderr);
    } catch {
      setStderr("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0c0f1a] to-[#1e293b] text-white flex flex-col items-center p-6 font-sans">
      <h1 className="text-5xl font-extrabold mb-8 flex items-center gap-4 animate-pulse">
        <FaJs className="text-yellow-400" /> JS Code Runner
      </h1>

      {/* Editor */}
      <div className="w-full max-w-4xl border-2 border-blue-700 rounded-2xl overflow-hidden shadow-2xl mb-6 transform hover:scale-[1.01] transition-all duration-300">
        <Editor
          height="350px"
          language="javascript"
          theme="vs-dark"
          value={code}
          onChange={(v) => setCode(v || "")}
          options={{
            fontSize: 16,
            minimap: { enabled: false },
            lineNumbers: "on",
            scrollBeyondLastLine: false,
          }}
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={runCode}
          disabled={loading}
          className="px-6 py-2 bg-green-500 hover:bg-green-600 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 font-bold"
        >
          {loading ? "Running..." : "Run Code"}
        </button>
        <button
          onClick={() => navigator.clipboard.writeText(`${stdout}\n${stderr}`)}
          className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 font-bold"
        >
          Copy Output
        </button>
      </div>

      {/* Output */}
      <div className="w-full max-w-4xl bg-[#111827] rounded-2xl p-5 font-mono min-h-[180px] overflow-auto whitespace-pre-wrap shadow-inner border-2 border-gray-700">
        {stdout && <pre className="text-green-400">{stdout}</pre>}
        {stderr && <pre className="text-red-500">{stderr}</pre>}
        {!stdout && !stderr && (
          <pre className="text-gray-400 animate-pulse">Output will appear here...</pre>
        )}
      </div>

      <footer className="mt-8 text-gray-400 text-sm italic">
        💻 I Love You Programming
      </footer>
    </div>
  );
}
