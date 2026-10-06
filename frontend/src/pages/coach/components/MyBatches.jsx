function MyBatches() {
  const batches = [
    {
      name: "Cricket - Morning A",
      time: "6:00 AM - 8:00 AM",
      students: 25,
    },
    {
      name: "Cricket - Evening B",
      time: "4:00 PM - 6:00 PM",
      students: 22,
    },
    {
      name: "Cricket - Weekend",
      time: "7:00 AM - 10:00 AM",
      students: 18,
    },
  ];

  return (
    <div className="card">
      <h2 className="card-title">My Batches</h2>

      {batches.map((batch, index) => (
        <div key={index} className="batch-item">
          <div>
            <h4>{batch.name}</h4>
            <p>{batch.time}</p>
          </div>
          <span>{batch.students} students</span>
        </div>
      ))}
    </div>
  );
}

export default MyBatches;
