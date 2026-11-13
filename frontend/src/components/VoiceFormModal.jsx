import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function VoiceFormModal({ onClose }) {
  // The state of the visual form
  const [formData, setFormData] = useState({
    heart_rate: "",
    blood_pressure: "",
    blood_sugar: "",
  });

  const [isListening, setIsListening] = useState(false);

  // 1. Send Audio to FastAPI /parse-voice
  const handleVoiceInput = async (audioBlob) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const data = new FormData();
    data.append("audio", audioBlob);

    try {
      const response = await fetch(`${backendUrl}/api/parse-voice`, {
        method: "POST",
        body: data,
      });
      const result = await response.json();

      // Update the visual form if FastAPI found a match
      if (result.success && result.field) {
        setFormData((prev) => ({ ...prev, [result.field]: result.value }));
      }

      // Play the AI's reply out loud using the browser's Text-to-Speech
      const speech = new SpeechSynthesisUtterance(result.ai_reply);
      window.speechSynthesis.speak(speech);
    } catch (error) {
      console.error("Error talking to backend", error);
    }
  };

  // 2. The Confirm Button: Send final data to FastAPI /save-health
  const handleConfirm = async () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const {
      data: { session },
    } = await supabase.auth.getSession();

    await fetch(`${backendUrl}/api/save-health`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(formData),
    });

    onClose(); // Close the pop-up
  };

  return (
    <div className="modal-popup">
      <h2>Medical Voice Assistant</h2>

      {/* The Visual Form */}
      <div>
        <label>Heart Rate: </label>
        <input type="text" value={formData.heart_rate} readOnly />
      </div>
      <div>
        <label>Blood Pressure: </label>
        <input type="text" value={formData.blood_pressure} readOnly />
      </div>
      <div>
        <label>Blood Sugar: </label>
        <input type="text" value={formData.blood_sugar} readOnly />
      </div>

      {/* Controls */}
      <button onClick={() => setIsListening(true)}>
        {isListening ? "Listening..." : "Start Talking"}
      </button>

      <button onClick={handleConfirm}>Confirm & Save</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
}
