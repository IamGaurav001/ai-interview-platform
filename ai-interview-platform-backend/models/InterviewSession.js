import mongoose from "mongoose";

const interviewSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    domain: {
      type: String,
      required: true,
      trim: true,
    },
    questions: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
    answers: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
    feedback: {
      type: Object,
      default: {},
    },
    score: {
      type: Number,
      default: 0,
      validate: {
        validator: function (value) {
          return !isNaN(value); 
        },
        message: "Score must be a valid number",
      },
    },
  },
  { timestamps: true }
);




interviewSessionSchema.pre("save", function (next) {
  if (isNaN(this.score) || this.score === null || this.score === undefined) {
    this.score = 0;
  }
  next();
});


const InterviewSession = mongoose.model(
  "InterviewSession",
  interviewSessionSchema
);
export default InterviewSession;
