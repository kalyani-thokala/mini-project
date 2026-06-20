import mongoose from "mongoose";

const codingProblemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  constraints: {
    type: [String],
    default: []
  },
  examples: [
    {
      input: String,
      output: String,
      explanation: String
    }
  ],
  category: {
    type: String,
    enum: [
      "Arrays",
      "Strings",
      "Linked Lists",
      "Stacks",
      "Queues",
      "Trees",
      "Graphs",
      "Recursion",
      "Dynamic Programming"
    ],
    required: true
  },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    required: true
  },
  solution: {
    type: String,
    default: ""
  }
});

export default mongoose.model("CodingProblem", codingProblemSchema);
