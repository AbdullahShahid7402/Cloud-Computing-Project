import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AttachFile as AttachFileIcon,
} from '@mui/icons-material';
import axios from 'axios';

interface Task {
  id: number;
  title: string;
  description: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  attachment_url?: string;
}

const Dashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [open, setOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'medium',
    status: 'pending',
  });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/tasks`);
      setTasks(response.data);
    } catch (err) {
      setError('Failed to fetch tasks');
    }
  };

  const handleOpen = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description,
        due_date: task.due_date.split('T')[0],
        priority: task.priority,
        status: task.status,
      });
    } else {
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        due_date: '',
        priority: 'medium',
        status: 'pending',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingTask(null);
    setFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formDataObj = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataObj.append(key, value);
      });
      if (file) {
        formDataObj.append('attachment', file);
      }

      if (editingTask) {
        await axios.put(
          `${process.env.REACT_APP_API_URL}/tasks/${editingTask.id}`,
          formDataObj,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/tasks`, formDataObj, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      handleClose();
      fetchTasks();
    } catch (err) {
      setError('Failed to save task');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/tasks/${id}`);
      fetchTasks();
    } catch (err) {
      setError('Failed to delete task');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Tasks</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Task
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {tasks.map((task) => (
          <Grid item xs={12} sm={6} md={4} key={task.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {task.title}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  {task.description}
                </Typography>
                <Typography variant="body2">
                  Due: {new Date(task.due_date).toLocaleDateString()}
                </Typography>
                <Typography variant="body2">
                  Priority: {task.priority}
                </Typography>
                <Typography variant="body2">
                  Status: {task.status}
                </Typography>
                {task.attachment_url && (
                  <Box sx={{ mt: 1 }}>
                    <IconButton
                      size="small"
                      href={task.attachment_url}
                      target="_blank"
                    >
                      <AttachFileIcon />
                    </IconButton>
                  </Box>
                )}
              </CardContent>
              <CardActions>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => handleOpen(task)}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDelete(task.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingTask ? 'Edit Task' : 'Create New Task'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="Title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              margin="normal"
              multiline
              rows={3}
            />
            <TextField
              fullWidth
              label="Due Date"
              type="date"
              value={formData.due_date}
              onChange={(e) =>
                setFormData({ ...formData, due_date: e.target.value })
              }
              margin="normal"
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              fullWidth
              select
              label="Priority"
              value={formData.priority}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  priority: e.target.value as 'low' | 'medium' | 'high',
                })
              }
              margin="normal"
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </TextField>
            <TextField
              fullWidth
              select
              label="Status"
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as
                    | 'pending'
                    | 'in_progress'
                    | 'completed',
                })
              }
              margin="normal"
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </TextField>
            <Button
              component="label"
              startIcon={<AttachFileIcon />}
              sx={{ mt: 2 }}
            >
              Attach File
              <input
                type="file"
                hidden
                onChange={handleFileChange}
                accept="image/*,.pdf,.doc,.docx"
              />
            </Button>
            {file && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Selected file: {file.name}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingTask ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Dashboard; 