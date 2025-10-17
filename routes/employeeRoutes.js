const router = require("express").Router();
const Employee = require("../models/Employee");

// GET all employees with optional search/filter
router.get("/", async (req, res) => {
  try {
    const { search, department, position } = req.query;
    let query = {};

    if (search) query.name = { $regex: search, $options: "i" };
    if (department) query.department = department;
    if (position) query.position = position;

    const employees = await Employee.find(query).sort({ createdAt: -1 });
    res.json(employees);
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch employees", error: e.message });
  }
});

// POST new employee
router.post("/", async (req, res) => {
  try {
    const employee = new Employee(req.body);
    await employee.save();
    res.json(employee);
  } catch (e) {
    res.status(500).json({ message: "Failed to add employee", error: e.message });
  }
});

// PUT update employee
router.put("/:id", async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(employee);
  } catch (e) {
    res.status(500).json({ message: "Failed to update employee", error: e.message });
  }
});

// DELETE employee
router.delete("/:id", async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.json({ message: "Employee deleted" });
  } catch (e) {
    res.status(500).json({ message: "Failed to delete employee", error: e.message });
  }
});

module.exports = router;
