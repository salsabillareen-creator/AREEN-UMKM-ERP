// views/HR.tsx
import React, { useState } from 'react';
import { MOCK_EMPLOYEES } from '../constants';
import { Employee } from '../types';
import { PlusIcon, MessageIcon } from '../components/icons';

const HRIllustration: React.FC = () => (
     <div className="absolute top-0 right-0 h-full w-1/3 text-[var(--color-primary)]/10 dark:text-[var(--color-primary)]/5 pointer-events-none">
        <svg width="100%" height="100%" preserveAspectRatio="xMidYMid slice" viewBox="0 0 200 200">
            <defs>
                <pattern id="hr-pattern" patternUnits="userSpaceOnUse" width="40" height="40">
                    <circle cx="20" cy="20" r="2" fill="currentColor" />
                </pattern>
            </defs>
            <rect width="200" height="200" fill="url(#hr-pattern)" />
        </svg>
    </div>
);


// --- Employee Editor Component ---
interface EmployeeEditorProps {
    employee: Employee;
    onSave: (employee: Employee) => void;
    onCancel: () => void;
}

const EmployeeEditor: React.FC<EmployeeEditorProps> = ({ employee: initialEmployee, onSave, onCancel }) => {
    const [employee, setEmployee] = useState<Employee>(initialEmployee);
    const isNew = initialEmployee.name === '';
    const inputClass = "mt-1 block w-full px-3 py-2 bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm text-stone-800 dark:text-stone-200";
    
    const handleChange = (field: keyof Omit<Employee, 'id'>, value: string) => {
        setEmployee(prev => ({ ...prev, [field]: value }));
    };
    
    return (
        <div className="p-6">
            <div className="bg-white dark:bg-stone-800 shadow-lg rounded-xl p-8 max-w-2xl mx-auto">
                <div className="flex justify-between items-center mb-6 border-b dark:border-stone-700 pb-4">
                    <h2 className="text-2xl font-bold text-stone-800 dark:text-rose-100">{isNew ? 'Add New Employee' : 'Edit Employee'}</h2>
                    <div className="flex gap-2">
                        <button onClick={onCancel} className="bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-200 px-4 py-2 rounded-lg shadow-sm hover:bg-rose-50 dark:hover:bg-stone-600">Cancel</button>
                        <button onClick={() => onSave(employee)} className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg shadow hover:brightness-90">Save Employee</button>
                    </div>
                </div>
                 <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-stone-600 dark:text-stone-300">Full Name</label>
                        <input type="text" value={employee.name} onChange={e => handleChange('name', e.target.value)} className={inputClass} />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-medium text-stone-600 dark:text-stone-300">Role / Position</label>
                           <input type="text" value={employee.role} onChange={e => handleChange('role', e.target.value)} className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-stone-600 dark:text-stone-300">Department</label>
                            <input type="text" value={employee.department} onChange={e => handleChange('department', e.target.value)} className={inputClass} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-600 dark:text-stone-300">Email Address</label>
                        <input type="email" value={employee.email} onChange={e => handleChange('email', e.target.value)} className={inputClass} />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-stone-600 dark:text-stone-300">Avatar URL</label>
                        <input type="text" value={employee.avatarUrl} onChange={e => handleChange('avatarUrl', e.target.value)} className={inputClass} />
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- Employee Card Component ---
interface EmployeeCardProps {
    employee: Employee;
    onEdit: (employee: Employee) => void;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee, onEdit }) => {
    return (
        <div className="bg-white dark:bg-stone-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative group">
            <div className="h-24 bg-gradient-to-r from-[var(--color-primary)]/20 to-[var(--color-primary)]/5"></div>
            <div className="p-6 relative">
                <img className="absolute -top-12 left-1/2 -translate-x-1/2 h-20 w-20 rounded-full ring-4 ring-white dark:ring-stone-800" src={employee.avatarUrl} alt={employee.name} />
                <div className="text-center mt-8">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{employee.name}</h3>
                    <p className="text-[var(--color-primary)] font-semibold text-sm">{employee.role}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{employee.department}</p>
                </div>
                <div className="mt-4 border-t border-gray-200 dark:border-stone-700 pt-4 flex justify-center gap-4">
                     <a href={`mailto:${employee.email}`} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] transition-colors">
                        <MessageIcon className="w-4 h-4" />
                        Contact
                    </a>
                    <button onClick={() => onEdit(employee)} className="text-sm text-gray-600 dark:text-gray-300 hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)]">Edit</button>
                </div>
            </div>
        </div>
    );
};

// --- Main HR Component ---
const HR: React.FC = () => {
    const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

    const handleNewEmployee = () => {
        setEditingEmployee({
            id: `new-${Date.now()}`,
            name: '',
            role: '',
            department: '',
            email: '',
            avatarUrl: `https://i.pravatar.cc/150?u=${Date.now()}`
        });
    };
    
    const handleSaveEmployee = (employeeToSave: Employee) => {
        setEmployees(prev => {
            const isNew = !prev.some(e => e.id === employeeToSave.id);
            if (isNew) {
                const finalEmployee = { ...employeeToSave, id: `EMP-${String(prev.length + 1).padStart(3, '0')}`};
                return [finalEmployee, ...prev];
            } else {
                return prev.map(e => e.id === employeeToSave.id ? employeeToSave : e);
            }
        });
        setEditingEmployee(null);
    };

    if (editingEmployee) {
        return <EmployeeEditor employee={editingEmployee} onSave={handleSaveEmployee} onCancel={() => setEditingEmployee(null)} />;
    }

    return (
        <div className="p-6">
            <div className="relative bg-white dark:bg-stone-800/50 rounded-lg shadow-sm p-6 mb-6 border border-gray-200 dark:border-stone-700/50 overflow-hidden">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Employee Directory</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage all employees in your organization.</p>
                    </div>
                     <button onClick={handleNewEmployee} className="bg-[var(--color-primary)] text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 hover:brightness-95 transition shadow-md z-10">
                        <PlusIcon />
                        <span>Add Employee</span>
                    </button>
                </div>
                <HRIllustration />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {employees.map(employee => (
                    <EmployeeCard key={employee.id} employee={employee} onEdit={setEditingEmployee} />
                ))}
            </div>
        </div>
    );
};

export default HR;
