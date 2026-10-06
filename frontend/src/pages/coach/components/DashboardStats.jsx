import StatsCard from "./StatsCard";

function DashboardStats() {
  const stats = [
    { title: "Total Students", value: 65 },
    { title: "Today's Sessions", value: 2 },
    { title: "Avg. Attendance", value: "92%" },
    { title: "Hours This Week", value: 18 },
  ];

  return (
    <div className="stats-grid">
      {stats.map((stat, index) => (
        <StatsCard key={index} title={stat.title} value={stat.value} />
      ))}
    </div>
  );
}

export default DashboardStats;
