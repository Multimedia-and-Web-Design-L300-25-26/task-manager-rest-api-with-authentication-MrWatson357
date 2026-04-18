import Task from "../models/Task.js";

// POST /api/tasks - Create a new task
export const createTask = async (req, res) => {
  try {
    const { title, description } = req.body;
    
    const task = new Task({
      title,
      description,
      owner: req.user._id // Links task to authenticated user
    });

    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: "Error creating task" });
  }
};

// GET /api/tasks - Return only tasks belonging to the user
export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ owner: req.user._id });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tasks" });
  }
};

// DELETE /api/tasks/:id - Only owner can delete
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ 
      _id: req.params.id, 
      owner: req.user._id 
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found or unauthorized" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting task" });
  }
};