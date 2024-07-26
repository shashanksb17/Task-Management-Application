const TaskModel = require("../Model/taskModel");

const checkTaskOwnership = async (req, res, next) => {
  const { taskId } = req.params;
  const task = await TaskModel.findById(taskId);

  if (!task) return res.status(404).json({ message: "Task not found" });

  if (task.userId !== req.user.userID && task.userId !== req.user.googleId) {
    return res.status(403).json({ message: "Unauthorized access" });
  }

  next();
};

module.exports = { checkTaskOwnership };
