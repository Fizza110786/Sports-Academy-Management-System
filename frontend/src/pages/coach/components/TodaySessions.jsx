function TodaySessions() {
  const sessions = [
    {
      name: "Cricket - Morning A",
      time: "6:00 AM",
      status: "Completed",
    },
    {
      name: "Cricket - Evening B",
      time: "4:00 PM",
      status: "Upcoming",
    },
  ];

  return (
    <div className="card">
      <h2 className="card-title">Today's Schedule</h2>

      {sessions.map((session, index) => (
        <div key={index} className="session-item">
          <div>
            <h4>{session.name}</h4>
            <p>{session.time}</p>
          </div>

          <span
            className={`badge ${
              session.status === "Completed"
                ? "completed"
                : "upcoming"
            }`}
          >
            {session.status}
          </span>
        </div>
      ))}
    </div>
  );
}

export default TodaySessions;
