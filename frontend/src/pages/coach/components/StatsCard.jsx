function StatsCard({ title, value }) {
  return (
    <div className="card">
      <p className="stat-title">{title}</p>
      <h2 className="stat-value">{value}</h2>
    </div>
  );
}

export default StatsCard;
