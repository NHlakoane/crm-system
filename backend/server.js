const Lead = require("./models/Lead");


const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect("mongodb+srv://neo:pass%40word123@cluster0.u5qrm0j.mongodb.net/crm?retryWrites=true&w=majority")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// Test route
app.get("/", (req, res) => {
  res.send("CRM API running...");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});

// I added a new lead
app.post("/leads", async (req, res) => {
  try {
    const newLead = new Lead(req.body);
    await newLead.save();
    res.status(201).json(newLead);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all leads
app.get("/leads", async (req, res) => {
  try {
    const leads = await Lead.find();
    res.json(leads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update lead (status + notes)
app.put("/leads/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const lead = await Lead.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: "Failed to update status" });
  }
});

app.delete("/leads/:id", async (req, res) => {
  try {
    const deletedLead = await Lead.findByIdAndDelete(req.params.id);
    if (!deletedLead) return res.status(404).json({ message: "Lead not found" });
    res.status(200).json({ message: "Lead deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/leads/:id/notes", async (req, res) => {
  try {
    const updatedLead = await Lead.findByIdAndUpdate(
      req.params.id,
      { notes: req.body.notes },
      { new: true }
    );

    res.json(updatedLead);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});