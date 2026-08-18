import { useState, useRef } from "react";
import Tesseract from "tesseract.js";
import jsQR from "jsqr";

function CameraTab({ theme, API, user, txt }) {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ocrText, setOcrText] = useState("");
  const [mode, setMode] = useState("upload");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileRef = useRef(null);

  const startCamera = async () => {
    setMode("camera");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
    } catch (e) {
      alert("Camera access denied!");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    }
    setMode("upload");
  };

  const capturePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/png");
    setImage(dataUrl);
    stopCamera();
    analyzeImage(dataUrl);
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImage(ev.target.result);
      analyzeImage(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (dataUrl) => {
    setLoading(true);
    setResult(null);
    setOcrText("");

    try {
      // OCR — Image la text extract
      const { data: { text } } = await Tesseract.recognize(dataUrl, "eng");
      setOcrText(text);

      // QR Code check
      const img = new Image();
      img.src = dataUrl;
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const qr = jsQR(imageData.data, imageData.width, imageData.height);

        const textToAnalyze = qr ? qr.data : text;

        if (textToAnalyze.trim()) {
          // Backend la send pannuvaom
          const res = await fetch(API + "/detect", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": "Bearer " + user?.token
            },
            body: JSON.stringify({
              text: textToAnalyze,
              userEmail: user.email
            }),
          });
          const data = await res.json();
          setResult({ ...data, isQR: !!qr, qrData: qr ? qr.data : null });
        } else {
          setResult({ status: "NO_TEXT", category: "NONE", score: 0 });
        }
        setLoading(false);
      };
    } catch (e) {
      setResult({ status: "ERROR", category: "NONE", score: 0 });
      setLoading(false);
    }
  };

  const takeScreenshot = async () => {
    setLoading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(document.body);
      const dataUrl = canvas.toDataURL("image/png");
      setImage(dataUrl);
      analyzeImage(dataUrl);
    } catch (e) {
      setLoading(false);
      alert("Screenshot failed!");
    }
  };

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 24, margin: 0 }}>📸 Camera & Photo Detection</h2>
        <p style={{ color: theme.sub, margin: "6px 0 0" }}>
          Image upload, Camera, QR Scan, Screenshot analyze
        </p>
      </div>

      {/* Mode Buttons */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {[
          { id: "upload", label: "📁 Upload Image" },
          { id: "camera", label: "📷 Take Photo" },
          { id: "screenshot", label: "🖥️ Screenshot" },
          { id: "qr", label: "📱 QR Scan" },
        ].map(m => (
          <button key={m.id}
            onClick={() => {
              if (m.id === "camera") startCamera();
              else if (m.id === "screenshot") takeScreenshot();
              else if (m.id === "qr") { setMode("qr"); fileRef.current.click(); }
              else { setMode("upload"); fileRef.current.click(); }
            }}
            style={{
              flex: 1, padding: "10px 8px",
              background: mode === m.id ? "#e94560" : theme.card,
              color: theme.text, border: "1px solid " + theme.border,
              borderRadius: 10, cursor: "pointer", fontSize: 12,
              fontWeight: "bold"
            }}>
            {m.label}
          </button>
        ))}
      </div>

      {/* Hidden file input */}
      <input type="file" accept="image/*" ref={fileRef}
        onChange={handleUpload} style={{ display: "none" }} />

      {/* Camera View */}
      {mode === "camera" && (
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <video ref={videoRef} autoPlay
            style={{ width: "100%", borderRadius: 12, maxHeight: 300 }} />
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button onClick={capturePhoto}
              style={{ flex: 1, padding: 10, background: "#e94560", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: "bold" }}>
              📷 Capture & Analyze
            </button>
            <button onClick={stopCamera}
              style={{ flex: 1, padding: 10, background: theme.card, color: theme.text, border: "1px solid " + theme.border, borderRadius: 10, cursor: "pointer" }}>
              ❌ Cancel
            </button>
          </div>
        </div>
      )}

      {/* Hidden canvas */}
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* Image Preview */}
      {image && (
        <div style={{ marginBottom: 16, textAlign: "center" }}>
          <img src={image} alt="preview"
            style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 12, border: "1px solid " + theme.border }} />
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: 20, background: theme.card, borderRadius: 12 }}>
          <div style={{ fontSize: 24 }}>⏳</div>
          <div style={{ marginTop: 8, color: theme.sub }}>
            Analyzing image...
          </div>
        </div>
      )}

      {/* OCR Text */}
      {ocrText && !loading && (
        <div style={{ padding: 12, background: theme.card, borderRadius: 10, marginBottom: 12, border: "1px solid " + theme.border }}>
          <div style={{ fontSize: 11, color: theme.sub, marginBottom: 4 }}>📝 Extracted Text:</div>
          <div style={{ fontSize: 12, maxHeight: 80, overflow: "auto" }}>{ocrText.slice(0, 200)}...</div>
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div style={{
          padding: 20, borderRadius: 16, textAlign: "center",
          background: result.status === "FAKE" ? "rgba(233,69,96,0.15)" : "rgba(0,184,148,0.15)",
          border: "1px solid " + (result.status === "FAKE" ? "#e94560" : "#00b894")
        }}>
          <div style={{ fontSize: 40 }}>
            {result.status === "FAKE" ? "⚠️" : result.status === "NO_TEXT" ? "❓" : "✅"}
          </div>
          <h3 style={{ color: result.status === "FAKE" ? "#e94560" : "#00b894", margin: "8px 0" }}>
            {result.status === "FAKE" ? "FAKE CONTENT DETECTED!" :
             result.status === "NO_TEXT" ? "No text found in image" : "GENUINE CONTENT!"}
          </h3>
          {result.status !== "NO_TEXT" && (
            <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
              <div style={{ background: "rgba(255,255,255,0.1)", padding: "8px 16px", borderRadius: 10 }}>
                <div style={{ fontSize: 10, color: "#aaa" }}>CATEGORY</div>
                <div style={{ fontWeight: "bold" }}>{result.category}</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.1)", padding: "8px 16px", borderRadius: 10 }}>
                <div style={{ fontSize: 10, color: "#aaa" }}>SCORE</div>
                <div style={{ fontWeight: "bold" }}>{result.score && result.score.toFixed(1)}%</div>
              </div>
            </div>
          )}
          {result.isQR && (
            <div style={{ marginTop: 8, fontSize: 12, color: theme.sub }}>
              📱 QR Code detected: {result.qrData}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CameraTab;