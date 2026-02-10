import fs from "fs";
import express from "express";

const FILE = "tasks.json";
const app = express();
app.use(express.json());


function loadTasks() {
  if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, JSON.stringify([]));
  return JSON.parse(fs.readFileSync(FILE));
}

function saveTasks(tasks) {
  fs.writeFileSync(FILE, JSON.stringify(tasks, null, 2));
}


const args = process.argv.slice(2);
const command = args[0];

if (command) {
  let tasks = loadTasks();


  if (command === "add") {
    const title = args.slice(1).join(" ");
    tasks.push({ id: Date.now(), title, status: "todo" });
    saveTasks(tasks);
    console.log("Task added");
    process.exit();
  }

 
  if (command === "list") {
    const status = args[1];
    const filtered = status ? tasks.filter(t => t.status === status) : tasks;
    console.log(filtered);
    process.exit();
  }

  
  if (command === "update") {
    const id = Number(args[1]);
    const newTitle = args.slice(2).join(" ");
    tasks = tasks.map(t => t.id === id ? { ...t, title: newTitle } : t);
    saveTasks(tasks);
    console.log("Task updated");
    process.exit();
  }

 
  if (command === "delete") {
    const id = Number(args[1]);
    tasks = tasks.filter(t => t.id !== id);
    saveTasks(tasks);
    console.log("Task deleted");
    process.exit();
  }


  if (command === "status") {
    const id = Number(args[1]);
    const status = args[2];
    tasks = tasks.map(t => t.id === id ? { ...t, status } : t);
    saveTasks(tasks);
    console.log("Status updated");
    process.exit();
  }
}


app.get("/tasks", (req, res) => {
  const { status } = req.query;
  const tasks = loadTasks();
  res.json(status ? tasks.filter(t => t.status === status) : tasks);
});


app.post("/tasks", (req, res) => {
  const tasks = loadTasks();
  const task = { id: Date.now(), title: req.body.title, status: "todo" };
  tasks.push(task);
  saveTasks(tasks);
  res.json(task);
});


app.put("/tasks/:id", (req, res) => {
  let tasks = loadTasks();
  tasks = tasks.map(t =>
    t.id == req.params.id ? { ...t, title: req.body.title } : t
  );
  saveTasks(tasks);
  res.json({ message: "Task updated" });
});


app.patch("/tasks/:id/status", (req, res) => {
  let tasks = loadTasks();
  tasks = tasks.map(t =>
    t.id == req.params.id ? { ...t, status: req.body.status } : t
  );
  saveTasks(tasks);
  res.json({ message: "Status changed" });
});


app.delete("/tasks/:id", (req, res) => {
  let tasks = loadTasks();
  tasks = tasks.filter(t => t.id != req.params.id);
  saveTasks(tasks);
  res.json({ message: "Task deleted" });
});

app.listen(3000, () => console.log("API running on http://localhost:3000"));
