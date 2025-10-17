const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: String,
  phone: String,
  email: String,
  dob: Date,
  idNumber: String,
  startDate: Date,
  department: { type: String, required: true },
  position: { type: String, required: true },
  qualName:String,
  majorSubject:String,
  InstituteName:String,
  Location:String,
  completion:String,
  performance:String,
  bankName: String,
  accountNumber: String,
  ifsc: String,
  taxId: String,
  adhaarCard:String,
  uanNumber:String,
  panCard:String,
  emergencyContact: String,
  emergencyNumber: String,
  department:String,
  position:String,
  photo: String, // Base64
}, { timestamps: true });

module.exports = mongoose.model("Employee", employeeSchema);
