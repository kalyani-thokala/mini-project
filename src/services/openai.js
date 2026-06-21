import API from "./api";

export async function generateAIQuestions(
  role,
  difficulty,
  type,
  count
) {
  const response = await API.post("/quiz/generate", {
    role,
    difficulty,
    type,
    count
  });

  return response.data;
}

export async function generateAIFollowUp(
  question,
  answer
) {
  const response = await API.post("/quiz/followup", {
    question,
    answer
  });

  return response.data.followUp;
}

export async function generateAIRoleTips(role) {
  const response = await API.post("/quiz/tips", { role });
  return response.data.tips;
}
