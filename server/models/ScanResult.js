import mongoose from 'mongoose';

const scanResultSchema = new mongoose.Schema({
  inputType: {
    type: String,
    required: true,
    enum: ["url", "email", "file", "identity"],
  },
  inputValue: {
    type: String,
    required: true,
  },
  riskScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  riskLevel: {
    type: String,
    required: true,
    enum: ["Low", "Medium", "High"],
  },
  reasons: {
    type: [String],
    default: [],
  },
  recommendations: {
    type: [String],
    default: [],
  },
  explanation: {
    type: String,
    default: "",
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true
});

const ScanResult = mongoose.model("ScanResult", scanResultSchema);

export default ScanResult;
