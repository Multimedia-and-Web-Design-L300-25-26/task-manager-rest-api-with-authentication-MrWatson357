import express from "express";
import Task from "../models/Task.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply auth middleware to all task routes
router.use(authMiddleware);

// POST /api/tasks - Create a new task
router.post("/", async (req, res) => {
  try {
    const { title, description } = req.body;

    // Validate input
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    // Create task and link to the authenticated user (req.user._id)
    const task = new Task({
      title,
      description,
      owner: req.user._id,
    });

    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/tasks - Return only tasks belonging to the authenticated user
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find({ owner: req.user._id });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/tasks/:id - Delete a task (only if owned by the user)
router.delete("/:id", async (req, res) => {
  try {
    // Find the task and ensure the owner matches the logged-in user
    const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });
    
    if (!task) {
      return res.status(404).json({ message: "Task not found or unauthorized access" });
    }

    // Using .deleteOne() as .remove() is deprecated in newer Mongoose versions
    await task.deleteOne(); 
    res.json({ message: "Task removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;