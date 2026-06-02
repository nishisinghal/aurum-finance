import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  userId: { type: Number, required: true, index: true },
  desc: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: String, required: true },
  type: { type: String, required: true },
  cat: { type: String, required: true },
}, { timestamps: true });

export default mongoose.models.Transaction || mongoose.model("Transaction", TransactionSchema);
