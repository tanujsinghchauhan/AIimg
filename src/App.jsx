import { useState } from "react";

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY;

  const translateToEnglish = async (text) => {
    try {
      const response = await fetch(
        "https://translate.argosopentech.com/translate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            q: text,
            source: "hi",
            target: "en",
            format: "text",
          }),
        }
      );

      if (!response.ok) throw new Error("Translation failed");

      const data = await response.json();
      return data.translatedText || text;
    } catch (error) {
      console.error("Translation Error:", error);
      return text;
    }
  };

  const generateImage = async () => {
    if (!prompt) return alert("Please enter a prompt");
    setLoading(true);
    setImage(null);

    const translatedPrompt = await translateToEnglish(prompt);

    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5",
        {
          headers: { Authorization: `Bearer ${API_KEY}` },
          method: "POST",
          body: JSON.stringify({ inputs: translatedPrompt }),
        }
      );

      if (!response.ok) {
        throw new Error("Image generation failed");
      }

      const blob = await response.blob();
      setImage(URL.createObjectURL(blob));
    } catch (error) {
      alert("Failed to generate image. Try again.");
      console.error("Image Generation Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white px-6 py-10">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-center">
        हिन्दी AI Image Generator
      </h1>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg">
        <input
          type="text"
          placeholder="Enter a prompt (Hindi or English)..."
          className="flex-1 p-3 bg-gray-800 rounded-lg text-white outline-none w-full sm:w-auto"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button
          onClick={generateImage}
          className="px-5 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold w-full sm:w-auto"
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate"}
        </button>
      </div>

      <div className="mt-6 w-full max-w-lg">
        {loading && <p className="text-gray-400 text-center">Generating...</p>}
        {image && (
          <img
            src={image}
            alt="Generated AI"
            className="mt-4 rounded-lg shadow-lg w-full"
          />
        )}
      </div>
    </div>
  );
}
