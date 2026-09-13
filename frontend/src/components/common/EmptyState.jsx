import "./Common.css";

export default function EmptyState({ icon = "📚", title = "No items found", description = "There are no records to display at this moment.", action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h4 className="empty-title">{title}</h4>
      <p className="empty-desc">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
