import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip
} from "recharts";
import "./MyProgress.css";

const MyProgress = () => {
  const [feedback, setFeedback] = useState([]);
  const [grade, setGrade] = useState("");
  const [skillData, setSkillData] = useState([]);
  const [bestSkill, setBestSkill] = useState(null);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      try {
        const feedbackRes = await axios.get(
          `http://localhost:5000/api/performance?studentId=${user._id}`
        );

        const data = feedbackRes.data || [];

        if (data.length > 0) {
          const avgRating = data.reduce((sum, item) => sum + item.rating, 0) / data.length;
          if (avgRating >= 4.5) setGrade("A+");
          else if (avgRating >= 4) setGrade("A");
          else if (avgRating >= 3.5) setGrade("B+");
          else if (avgRating >= 3) setGrade("B");
          else if (avgRating >= 2) setGrade("C");
          else setGrade("D");

          const skillMap = {};
          data.forEach((item) => {
            if (!item.skill) return;
            if (!skillMap[item.skill]) skillMap[item.skill] = { total: 0, count: 0 };
            skillMap[item.skill].total += item.rating;
            skillMap[item.skill].count += 1;
          });

          const radarData = Object.entries(skillMap).map(([skill, val]) => ({
            skill,
            rating: parseFloat((val.total / val.count).toFixed(1)),
          }));

          setSkillData(radarData);

          const best = radarData.reduce((a, b) => (a.rating >= b.rating ? a : b), {});
          setBestSkill(best);

        } else {
          setGrade("N/A");
        }

        const mappedFeedback = data.map((item) => ({
          coach: item.coachName || item.coachId || "Coach",
          category: item.skill,
          rating: item.rating,
          message: item.comment,
          date: item.createdAt,
        }));

        setFeedback(mappedFeedback);
      } catch (feedbackErr) {
        console.error("Feedback fetch failed:", feedbackErr);
        setGrade("N/A");
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (count) => {
    return "★★★★★☆☆☆☆☆".slice(5 - count, 10 - count);
  };

  const getGradeLabel = (g) => {
    const labels = {
      "A+": "Outstanding", "A": "Excellent", "B+": "Very Good",
      "B": "Good", "C": "Average", "D": "Needs Improvement", "N/A": "No Data Yet",
    };
    return labels[g] || "Keep Improving";
  };

  const getGradeMessage = (g) => {
    const messages = {
      "A+": "Outstanding performance! You're in the top tier of your batch.",
      "A": "Excellent work! You're performing well above average.",
      "B+": "Very good progress. Keep pushing to reach the next level.",
      "B": "Good performance. Consistent practice will get you higher.",
      "C": "Average performance. Focus on weak areas with your coach.",
      "D": "Needs improvement. Talk to your coach for a focused plan.",
      "N/A": "No feedback received yet. Check back after your sessions.",
    };
    return messages[g] || "Focus on improving your skills with consistent practice.";
  };

  if (loading) {
    return <div className="progress-container">Loading...</div>;
  }

  return (
    <div className="progress-container">

      <div className="page-header">
        <h1>My Progress</h1>
        <p>Track your performance and growth</p>
      </div>

      {/* ALL 3 CARDS IN ONE HORIZONTAL ROW */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px", marginBottom: "24px" }}>

        {/* GRADE CARD */}
        <div className="card grade-card">
          <h3>Overall Grade</h3>
          <div className="grade">{grade}</div>
          <span className="grade-badge">{getGradeLabel(grade)}</span>
          <p>{getGradeMessage(grade)}</p>
        </div>

        {/* RADAR CHART */}
        <div className="card">
          <h3>Skills Radar</h3>
          <p style={{ opacity: 0.6, fontSize: "13px", marginBottom: "12px" }}>
            Average coach rating per skill
          </p>
          {skillData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={skillData}>
                <PolarGrid stroke="var(--border-color)" />
                <PolarAngleAxis
                  dataKey="skill"
                  tick={{ fontSize: 12, fill: "var(--text)" }}
                />
                <Tooltip
                  formatter={(value) => [`${value} / 5`, "Avg Rating"]}
                  contentStyle={{
                    background: "var(--card-bg)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    color: "var(--text)",
                  }}
                />
                <Radar
                  dataKey="rating"
                  stroke="#ff7a18"
                  fill="#ff7a18"
                  fillOpacity={0.3}
                  dot={{ r: 4, fill: "#ff7a18" }}
                />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ opacity: 0.6 }}>No skill data yet</p>
          )}
        </div>

        {/* BEST SKILL CARD */}
        <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
          <h3>🏅 Best Skill</h3>
          <p style={{ opacity: 0.6, fontSize: "13px", marginBottom: "20px" }}>
            Your highest rated skill by coach
          </p>

          {bestSkill ? (
            <>
              <div style={{
                background: "linear-gradient(135deg, #ff7a18, #ffb347)",
                borderRadius: "16px",
                padding: "28px 40px",
                marginBottom: "16px",
              }}>
                <div style={{ fontSize: "32px", fontWeight: "bold", color: "#fff" }}>
                  {bestSkill.skill}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "#ffc107", fontSize: "20px" }}>
                  {"★".repeat(Math.round(bestSkill.rating || 0))}
                  {"☆".repeat(5 - Math.round(bestSkill.rating || 0))}
                </span>
                <span style={{ fontWeight: "600", fontSize: "16px" }}>
                  {bestSkill.rating} / 5
                </span>
              </div>

              <p style={{ opacity: 0.6, fontSize: "13px", marginTop: "12px" }}>
                Keep building on your strengths!
              </p>
            </>
          ) : (
            <p style={{ opacity: 0.6 }}>No skill data yet</p>
          )}
        </div>

      </div>

      {/* COACH FEEDBACK */}
      <div className="card feedback-card">
        <h3>Coach Feedback</h3>

        {feedback.length === 0 ? (
          <p style={{ opacity: 0.6 }}>No feedback available</p>
        ) : (
          feedback.map((item, index) => (
            <div key={index} className="feedback-item">
              <div className="feedback-header">
                <div>
                  <strong>{item.coach}</strong>
                  <span className="category">{item.category}</span>
                </div>
                <div className="stars">
                  {renderStars(item.rating)}
                </div>
              </div>
              <p>{item.message}</p>
              <small>{new Date(item.date).toLocaleDateString()}</small>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyProgress;