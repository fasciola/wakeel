import React, { useState } from 'react';
import { useDB } from '../store/DBContext';
import { Task } from '../types';
import { dictionary } from '../store/translations';
import { ListTodo, ShieldAlert, Sparkles, Plus, Check } from 'lucide-react';

export const TasksList: React.FC = () => {
  const { currentLanguage, tasks, companies, addTask, updateTask, deleteTask } = useDB();
  const t = dictionary[currentLanguage];
  const isRtl = currentLanguage === 'ar';

  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Input states
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCompany, setNewTaskCompany] = useState(companies[0]?.id || '');
  const [newTaskPriority, setNewTaskPriority] = useState<'Low' | 'Normal' | 'High' | 'Urgent'>('Normal');
  const [newTaskDue, setNewTaskDue] = useState('2026-07-30');

  const filteredTasks = tasks.filter(task => {
    const parentComp = companies.find(c => c.id === task.companyId);
    const parentName = parentComp ? parentComp.legalNameEn.toLowerCase() : '';
    
    const matchesSearch = 
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      parentName.includes(search.toLowerCase());

    const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
    const matchesStatus = statusFilter === 'All' || task.status === statusFilter;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  const handleAddNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle || !newTaskCompany) return;

    addTask({
      companyId: newTaskCompany,
      title: newTaskTitle,
      priority: newTaskPriority,
      status: 'To Do',
      dueDate: newTaskDue,
      assigneeId: 'u1'
    });

    setNewTaskTitle('');
  };

  const getPriorityColor = (prio: string) => {
    switch (prio) {
      case 'Urgent':
        return 'bg-red-100 text-red-800 font-extrabold';
      case 'High':
        return 'bg-amber-100 text-amber-800 font-semibold';
      case 'Normal':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans p-2">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-xl font-bold text-slate-950">{t.menuTasks}</h3>
        <p className="text-xs text-slate-500 mt-1">
          Monitor critical government filing deadlines, trademark extensions, and mandatory audit checklist timelines.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Interactive List */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4 text-xs">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-gray-100 pb-3">
            <h4 className="font-bold text-slate-950 text-sm">Active Tasks queued ({filteredTasks.length})</h4>
            
            <div className="flex flex-wrap gap-2">
              <select 
                value={priorityFilter} 
                onChange={e => setPriorityFilter(e.target.value)}
                className="p-1.5 border border-gray-200 rounded-lg bg-white"
              >
                <option value="All">All Priorities</option>
                <option value="Urgent">Urgent</option>
                <option value="High">High</option>
                <option value="Normal">Normal</option>
                <option value="Low">Low</option>
              </select>

              <select 
                value={statusFilter} 
                onChange={e => setStatusFilter(e.target.value)}
                className="p-1.5 border border-gray-200 rounded-lg bg-white"
              >
                <option value="All">All Statuses</option>
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto">
            {filteredTasks.map(task => {
              const comp = companies.find(c => c.id === task.companyId);
              return (
                <div key={task.id} className="p-4 bg-slate-50 hover:bg-slate-100/40 rounded-xl transition border border-gray-100 flex justify-between items-center text-xs">
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => updateTask(task.id, { status: task.status === 'Completed' ? 'To Do' : 'Completed' })}
                      className={`w-4 h-4 rounded border flex items-center justify-center font-bold text-[9px] ${
                        task.status === 'Completed' ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 bg-white'
                      }`}
                    >
                      {task.status === 'Completed' && '✓'}
                    </button>
                    
                    <div>
                      <span className={`font-extrabold block text-slate-900 ${task.status === 'Completed' ? 'line-through text-gray-400' : ''}`}>
                        {task.title}
                      </span>
                      <span className="text-[10px] text-indigo-600 font-bold block">{comp ? comp.legalNameEn : 'Archived Case'}</span>
                      <span className="text-[9.5px] text-gray-400 block">Due ceiling: {task.dueDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <button 
                      onClick={() => deleteTask(task.id)}
                      className="text-red-500 font-bold hover:text-red-700 font-bold text-[10px]"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Quick Action Form */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4 text-xs">
          <h4 className="font-bold text-slate-950 text-sm">Schedule Compliance task</h4>
          
          <form onSubmit={handleAddNewTask} className="space-y-3.5">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Company File</label>
              <select 
                value={newTaskCompany} 
                onChange={e => setNewTaskCompany(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-lg bg-white"
                required
              >
                {companies.map(c => (
                  <option key={c.id} value={c.id}>{c.legalNameEn}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Task Description Brief</label>
              <input 
                type="text" 
                placeholder="e.g. Schedule trademark extensions"
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-lg bg-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Priority</label>
                <select 
                  value={newTaskPriority} 
                  onChange={e => setNewTaskPriority(e.target.value as any)}
                  className="w-full p-2 border border-gray-200 rounded-lg bg-white"
                >
                  <option value="Low">Low</option>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent Priority</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Due ceiling date</label>
                <input 
                  type="date"
                  value={newTaskDue}
                  onChange={e => setNewTaskDue(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg bg-white"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition"
            >
              Add Compliance Task
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
