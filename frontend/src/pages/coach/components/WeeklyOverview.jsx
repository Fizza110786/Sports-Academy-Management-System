function WeeklyOverview() {
  const progress = [
    { label: "Sessions Completed", value: 80 },
    { label: "Attendance Marked", value: 95 },
    { label: "Feedback Given", value: 85 },
  ];

  return (
    <div className="card">
      <h2 className="card-title">Weekly Training Progress</h2>

      {progress.map((item, index) => (
        <div key={index} className="progress-item">
          <div className="progress-header">
            <span>{item.label}</span>
            <span>{item.value}%</span>
          </div>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${item.value}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default WeeklyOverview;
