import User from "../models/User.js";

export const getLeaderboard = async (req, res) => {
  try {
    // Retrieve users who have opted into the leaderboard
    const optedInUsers = await User.find({ leaderboardOptIn: true })
      .select("fullName email avatar totalExams totalInterviews totalCodingChallenges averageScore")
      .lean();

    // Sort by average exam score
    const topExams = [...optedInUsers]
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 10);

    // Sort by mock interviews done
    const topInterviews = [...optedInUsers]
      .sort((a, b) => b.totalInterviews - a.totalInterviews)
      .slice(0, 10);

    // Sort by coding reviews completed
    const topCoding = [...optedInUsers]
      .sort((a, b) => b.totalCodingChallenges - a.totalCodingChallenges)
      .slice(0, 10);

    res.json({ topExams, topInterviews, topCoding });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleOptIn = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.leaderboardOptIn = !user.leaderboardOptIn;
    await user.save();

    res.json({
      message: `Leaderboard status updated successfully.`,
      leaderboardOptIn: user.leaderboardOptIn
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
