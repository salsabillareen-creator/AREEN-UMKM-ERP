// views/Projects.tsx
import React, { useState, useMemo } from 'react';
import { MOCK_PROJECT, MOCK_PROJECT_STAGES, MOCK_EMPLOYEES } from '../constants';
import { Task, TaskStatus, TaskPriority, Employee, Project } from '../types';
import { PlusIcon, MoreHorizontalIcon, ChevronsUpIcon, ChevronUpIcon, EqualIcon } from '../components/icons';

const stageColors: { [key in TaskStatus]: string } = {
  [TaskStatus.ToDo]: 'border-t-gray-400',
  [TaskStatus.InProgress]: 'border-t-blue-500',
  [TaskStatus.Done]: 'border-t-green-500',
};

const priorityIcons: { [key in TaskPriority]: React.ReactNode } = {
    [TaskPriority.High]: <ChevronsUpIcon className="w-4 h-4 text-red-500" />,
    [TaskPriority.Medium]: <ChevronUpIcon className="w-4 h-4 text-yellow-500" />,
    [TaskPriority.Low]: <EqualIcon className="w-4 h-4 text-green-500" />,
};

// --- Task Editor Component ---
interface TaskEditorProps {
    task: Task;
    onSave: (task: Task) => void;
    onCancel: () => void;
}

const TaskEditor: React.FC<TaskEditorProps> = ({ task: initialTask, onSave, onCancel }) => {
    const [task, setTask] = useState<Task>(initialTask);
    const isNew = initialTask.title === '';
    const inputClass = "mt-1 block w-full px-3 py-2 bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm text-stone-800 dark:text-stone-200";

    const handleSave = () => onSave(task);
    const handleChange = (field: keyof Omit<Task, 'id'>, value: string) => {
        setTask(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="p-6">
            <div className="bg-white dark:bg-stone-800 shadow-lg rounded-xl p-8 max-w-2xl mx-auto">
                 <div className="flex justify-between items-center mb-6 border-b dark:border-stone-700 pb-4">
                    <h2 className="text-2xl font-bold text-stone-800 dark:text-rose-100">{isNew ? 'Create New Task' : 'Edit Task'}</h2>
                    <div className="flex gap-2">
                        <button onClick={onCancel} className="bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-200 px-4 py-2 rounded-lg shadow-sm hover:bg-rose-50 dark:hover:bg-stone-600">Cancel</button>
                        <button onClick={handleSave} className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg shadow hover:brightness-90">Save Task</button>
                    </div>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-stone-600 dark:text-stone-300">Task Title</label>
                        <input type="text" value={task.title} onChange={e => handleChange('title', e.target.value)} className={inputClass} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-medium text-stone-600 dark:text-stone-300">Assignee</label>
                            <select value={task.assigneeId} onChange={e => handleChange('assigneeId', e.target.value)} className={inputClass}>
                                {MOCK_EMPLOYEES.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-stone-600 dark:text-stone-300">Priority</label>
                             <select value={task.priority} onChange={e => handleChange('priority', e.target.value)} className={inputClass}>
                                {Object.values(TaskPriority).map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-600 dark:text-stone-300">Status</label>
                         <select value={task.status} onChange={e => handleChange('status', e.target.value)} className={inputClass}>
                            {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- Task Card Component ---
interface TaskCardProps {
    task: Task;
    assignee?: Employee;
    onEdit: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, assignee, onEdit }) => {
    return (
        <div className="bg-white dark:bg-stone-800 p-3 rounded-lg shadow-md mb-3 border border-gray-200 dark:border-stone-700/50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer" onClick={() => onEdit(task)}>
            <div className="flex justify-between items-start">
                <p className="font-semibold text-sm text-gray-800 dark:text-gray-100 pr-2">{task.title}</p>
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <MoreHorizontalIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="flex items-center justify-between mt-3">
                <div className="flex items-center space-x-1">
                    {priorityIcons[task.priority]}
                    <span className="text-xs text-gray-500 dark:text-gray-400">{task.priority}</span>
                </div>
                {assignee && (
                    <img
                        src={assignee.avatarUrl}
                        alt={assignee.name}
                        title={assignee.name}
                        className="w-6 h-6 rounded-full ring-2 ring-white dark:ring-stone-800"
                    />
                )}
            </div>
        </div>
    );
};

// --- Other Components ---
const ProjectIllustration: React.FC = () => (
    <svg width="100%" height="100%" viewBox="0 0 400 60" preserveAspectRatio="none" className="text-[var(--color-primary)]">
        <path d="M0 30 Q 50 10, 100 30 T 200 30 T 300 30 T 400 30" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="5 5" strokeOpacity="0.3">
            <animate attributeName="stroke-dashoffset" from="100" to="0" dur="10s" repeatCount="indefinite"/>
        </path>
        <path d="M0 35 Q 50 55, 100 35 T 200 35 T 300 35 T 400 35" stroke="currentColor" strokeWidth="2" fill="none" strokeOpacity="0.5" />
    </svg>
);

// --- Main Project Component ---
const Projects: React.FC = () => {
    const [project, setProject] = useState<Project>(MOCK_PROJECT);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    const employeeMap = useMemo(() =>
        MOCK_EMPLOYEES.reduce((acc, emp) => {
            acc[emp.id] = emp;
            return acc;
        }, {} as { [key: string]: Employee }),
    []);
    
    const handleNewTask = () => {
        setEditingTask({
            id: `new-${Date.now()}`,
            title: '',
            assigneeId: MOCK_EMPLOYEES[0]?.id || '',
            status: TaskStatus.ToDo,
            priority: TaskPriority.Medium,
        });
    };

    const handleEditTask = (task: Task) => {
        setEditingTask(task);
    };
    
    const handleSaveTask = (taskToSave: Task) => {
        setProject(prevProject => {
            const isNew = !prevProject.tasks.some(t => t.id === taskToSave.id);
            if (isNew) {
                const finalTask = { ...taskToSave, id: `TSK-${String(prevProject.tasks.length + 1).padStart(2, '0')}`};
                return { ...prevProject, tasks: [finalTask, ...prevProject.tasks] };
            } else {
                return { ...prevProject, tasks: prevProject.tasks.map(t => t.id === taskToSave.id ? taskToSave : t)};
            }
        });
        setEditingTask(null);
    };

    const handleCancelEdit = () => {
        setEditingTask(null);
    };

    if (editingTask) {
        return <TaskEditor task={editingTask} onSave={handleSaveTask} onCancel={handleCancelEdit} />;
    }

    const tasksByStage = MOCK_PROJECT_STAGES.map(stage => ({
        stage,
        tasks: project.tasks.filter(task => task.status === stage),
    }));

    return (
        <div className="p-6 h-full flex flex-col">
             <div className="bg-white dark:bg-stone-800/50 rounded-lg shadow-sm p-5 mb-6 border border-gray-200 dark:border-stone-700/50">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{project.name}</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Track progress across all tasks in the project pipeline.</p>
                    </div>
                    <button onClick={handleNewTask} className="bg-[var(--color-primary)] text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 hover:brightness-95 transition shadow-md">
                        <PlusIcon />
                        <span>New Task</span>
                    </button>
                </div>
                <div className="h-10 mt-2">
                    <ProjectIllustration />
                </div>
            </div>

            <div className="flex-grow flex space-x-4 overflow-x-auto pb-4">
                {tasksByStage.map(({ stage, tasks }) => (
                    <div key={stage} className="flex-shrink-0 w-80 bg-gray-100/70 dark:bg-stone-900/50 rounded-xl p-3 flex flex-col">
                        <div className={`px-2 py-1 mb-3 border-t-4 ${stageColors[stage]}`}>
                            <h3 className="font-bold text-gray-700 dark:text-gray-200">{stage}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{tasks.length} tasks</p>
                        </div>
                        <div className="flex-grow overflow-y-auto pr-1">
                            {tasks.map(task => (
                                <TaskCard key={task.id} task={task} assignee={employeeMap[task.assigneeId]} onEdit={handleEditTask} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Projects;
