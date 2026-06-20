import mongoose from "mongoose";

const questionTemplateSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    index: true
  },
  topic: {
    type: String,
    required: true,
    index: true
  },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    required: true
  },
  template: {
    type: String,
    required: true
  },
  variables: {
    type: mongoose.Schema.Types.Mixed, // e.g. { nameList: [...], minVal: 10, maxVal: 100 }
    required: true
  },
  explanationTemplate: {
    type: String,
    default: ""
  }
});

export default mongoose.model("QuestionTemplate", questionTemplateSchema, "questiontemplates");
