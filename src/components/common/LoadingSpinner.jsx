import "./Common.css";

export default function LoadingSpinner({ text = "Loading data...", small = false }) {
  return (
    <div className="spinner-container">
      <div className={`spinner ${small ? "spinner-sm" : ""}`} />
      {text && <p style={{ color: "#6b7280", fontSize: "14px", margin: 0 }}>{text}</p>}
    </div>
  );
}
