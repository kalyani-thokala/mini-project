import UserPerformance from "../models/UserPerformance.js";

export const updateUserTopicPerformance = async (userId, category, topic, wasCorrect, score) => {
  try {
    if (!topic || !category) return;

    let perf = await UserPerformance.findOne({ userId, category, topic });
    if (!perf) {
      perf = new UserPerformance({
        userId,
        category,
        topic,
        totalAttempts: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        averageScore: 0
      });
    }

    perf.totalAttempts += 1;
    if (wasCorrect) {
      perf.correctAnswers += 1;
    } else {
      perf.wrongAnswers += 1;
    }

    const val = score !== undefined ? score : (wasCorrect ? 100 : 0);
    perf.averageScore = Math.round(
      ((perf.averageScore * (perf.totalAttempts - 1)) + val) / perf.totalAttempts
    );
    perf.lastAttempt = new Date();

    await perf.save();
  } catch (error) {
    console.error("UserPerformance update failure:", error);
  }
};
