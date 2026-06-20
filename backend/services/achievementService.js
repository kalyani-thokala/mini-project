import User from "../models/User.js";
import Notification from "../models/Notification.js";

export const checkAndUnlockAchievements = async (userId, type, latestScore) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const unlocked = [];

    const addAchievement = async (name) => {
      const alreadyHas = user.achievements.some(a => a.name === name);
      if (!alreadyHas) {
        user.achievements.push({ name, unlockedAt: new Date() });
        unlocked.push(name);
        
        // Save notification
        await Notification.create({
          userId,
          title: "Achievement Unlocked!",
          message: `Congratulations! You unlocked the achievement: "${name}".`,
          type: "milestone"
        });
      }
    };

    // 1. First Exam / Score check
    if (type === "exam") {
      await addAchievement("First Exam");
      if (latestScore >= 90) {
        await addAchievement("90% Score");
      }
      if (latestScore >= 80) {
        await addAchievement("80% Score");
      }
    }

    // 2. First Interview
    if (type === "interview") {
      await addAchievement("First Interview");
    }

    // 3. First Coding Challenge
    if (type === "coding") {
      await addAchievement("First Coding Challenge");
    }

    // 4. Cumulative questions count
    const totalQuestionsAttempted = user.attemptedQuestions.length;
    if (totalQuestionsAttempted >= 100) {
      await addAchievement("100 Questions Solved");
    }

    if (unlocked.length > 0) {
      await user.save();
      console.log(`Unlocked achievements for user ${userId}:`, unlocked);
    }
  } catch (error) {
    console.error("Achievement unlock check failure:", error);
  }
};
