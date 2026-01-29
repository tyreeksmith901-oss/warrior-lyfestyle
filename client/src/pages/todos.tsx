import { useState } from "react";
import { Sidebar, MobileNav } from "@/components/Navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, CheckCircle2, Circle, Calendar, Flag, Pencil } from "lucide-react";
import { format } from "date-fns";
import type { Todo } from "@shared/schema";

export default function Todos() {
  const { data: todos = [], isLoading } = useQuery<Todo[]>({ queryKey: ["/api/todos"] });
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");

  const createTodo = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/todos", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
      resetForm();
      setIsOpen(false);
    }
  });

  const updateTodo = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => apiRequest("PUT", `/api/todos/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/todos"] })
  });

  const deleteTodo = useMutation({
    mutationFn: async (id: number) => apiRequest("DELETE", `/api/todos/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/todos"] })
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority("medium");
    setDueDate("");
  };

  const handleSubmit = () => {
    if (!title.trim()) return;
    createTodo.mutate({
      title: title.trim(),
      description: description.trim() || null,
      priority,
      dueDate: dueDate || null,
    });
  };

  const openEditDialog = (todo: Todo) => {
    setEditingTodo(todo);
    setTitle(todo.title);
    setDescription(todo.description || "");
    setPriority(todo.priority || "medium");
    setDueDate(todo.dueDate ? format(new Date(todo.dueDate), "yyyy-MM-dd") : "");
    setIsEditOpen(true);
  };

  const handleEditSubmit = () => {
    if (!editingTodo || !title.trim()) return;
    updateTodo.mutate({
      id: editingTodo.id,
      data: {
        title: title.trim(),
        description: description.trim() || null,
        priority,
        dueDate: dueDate || null,
      }
    }, {
      onSuccess: () => {
        setIsEditOpen(false);
        setEditingTodo(null);
        resetForm();
      }
    });
  };

  const toggleComplete = (todo: Todo) => {
    updateTodo.mutate({ id: todo.id, data: { completed: !todo.completed } });
  };

  const incompleteTodos = todos.filter(t => !t.completed);
  const completedTodos = todos.filter(t => t.completed);

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case "high": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "low": return "bg-green-500/20 text-green-400 border-green-500/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <MobileNav />
        <main className="flex-1 p-6 md:p-8 max-w-5xl mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight">To-Do List</h1>
              <p className="text-muted-foreground">Stay organized and track your tasks</p>
            </div>
            
            <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button className="warrior-gradient accent-text shadow-lg" data-testid="button-add-todo">
                  <Plus className="h-4 w-4 mr-2" /> Add Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Task</DialogTitle>
                  <DialogDescription>Create a new task to track</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label>Task Title *</Label>
                    <Input 
                      value={title} 
                      onChange={(e) => setTitle(e.target.value)} 
                      placeholder="What needs to be done?" 
                      data-testid="input-todo-title"
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea 
                      value={description} 
                      onChange={(e) => setDescription(e.target.value)} 
                      placeholder="Add more details..." 
                      rows={3}
                      data-testid="input-todo-description"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Priority</Label>
                      <Select value={priority} onValueChange={setPriority}>
                        <SelectTrigger data-testid="select-priority">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Due Date</Label>
                      <Input 
                        type="date" 
                        value={dueDate} 
                        onChange={(e) => setDueDate(e.target.value)} 
                        data-testid="input-due-date"
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={handleSubmit} 
                    disabled={!title.trim() || createTodo.isPending} 
                    className="w-full warrior-gradient accent-text"
                    data-testid="button-submit-todo"
                  >
                    {createTodo.isPending ? "Adding..." : "Add Task"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 mb-8">
            <Card className="warrior-gradient border-2 accent-border">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-8 w-8 accent-text" />
                  <div>
                    <p className="text-sm text-white/70">Tasks Remaining</p>
                    <p className="text-2xl font-bold accent-text" data-testid="text-remaining-count">{incompleteTodos.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Circle className="h-5 w-5 accent-text" />
                Active Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p>Loading...</p>
              ) : incompleteTodos.length > 0 ? (
                <div className="space-y-3">
                  {incompleteTodos.map((todo) => (
                    <div 
                      key={todo.id} 
                      className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg border-l-4 border-l-primary"
                      data-testid={`todo-item-${todo.id}`}
                    >
                      <Checkbox 
                        checked={todo.completed || false}
                        onCheckedChange={() => toggleComplete(todo)}
                        className="mt-1"
                        data-testid={`checkbox-todo-${todo.id}`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-medium">{todo.title}</p>
                          <Badge className={getPriorityColor(todo.priority)} variant="outline">
                            <Flag className="h-3 w-3 mr-1" />
                            {todo.priority}
                          </Badge>
                        </div>
                        {todo.description && (
                          <p className="text-sm text-muted-foreground mb-1">{todo.description}</p>
                        )}
                        {todo.dueDate && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            Due: {format(new Date(todo.dueDate), "MMM d, yyyy")}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => openEditDialog(todo)}
                          data-testid={`button-edit-todo-${todo.id}`}
                        >
                          <Pencil className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => deleteTodo.mutate(todo.id)}
                          data-testid={`button-delete-todo-${todo.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No active tasks. You're all caught up!</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Dialog open={isEditOpen} onOpenChange={(open) => { setIsEditOpen(open); if (!open) { setEditingTodo(null); resetForm(); } }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Task</DialogTitle>
                <DialogDescription>Update your task details</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Task Title *</Label>
                  <Input 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    placeholder="What needs to be done?" 
                    data-testid="input-edit-todo-title"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    placeholder="Add more details..." 
                    rows={3}
                    data-testid="input-edit-todo-description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Priority</Label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger data-testid="select-edit-priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Due Date</Label>
                    <Input 
                      type="date" 
                      value={dueDate} 
                      onChange={(e) => setDueDate(e.target.value)} 
                      data-testid="input-edit-due-date"
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleEditSubmit} 
                  disabled={!title.trim() || updateTodo.isPending} 
                  className="w-full warrior-gradient accent-text"
                  data-testid="button-save-todo"
                >
                  {updateTodo.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {completedTodos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="h-5 w-5" />
                  Completed ({completedTodos.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {completedTodos.map((todo) => (
                    <div 
                      key={todo.id} 
                      className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg opacity-60"
                      data-testid={`todo-completed-${todo.id}`}
                    >
                      <Checkbox 
                        checked={true}
                        onCheckedChange={() => toggleComplete(todo)}
                        data-testid={`checkbox-completed-${todo.id}`}
                      />
                      <p className="flex-1 line-through">{todo.title}</p>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => deleteTodo.mutate(todo.id)}
                        data-testid={`button-delete-completed-${todo.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
