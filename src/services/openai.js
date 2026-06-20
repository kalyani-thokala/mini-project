import axios from "axios";

const API_URL = "http://localhost:5000/api";

export async function generateAIQuestions(
  role,
  difficulty,
  type,
  count
) {
  try {
    const response = await axios.post(
      `${API_URL}/quiz/generate`,
      {
        role,
        difficulty,
        type,
        count,
      }
    );

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function generateAIFollowUp(
  question,
  answer
) {
  try {
    const response = await axios.post(
      `${API_URL}/quiz/followup`,
      {
        question,
        answer,
      }
    );

    return response.data.followUp;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function generateAIRoleTips(role) {
  try {
    const response = await axios.post(
      `${API_URL}/quiz/tips`,
      {
        role,
      }
    );

    return response.data.tips;
  } catch (error) {
    console.error(error);
    throw error;
  }
}