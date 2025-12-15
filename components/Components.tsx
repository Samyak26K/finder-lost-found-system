import React from 'react';
import { ItemStatus, ItemType, Category } from '../types';

// --- Badges ---
export const StatusBadge: React.FC<{ status: ItemStatus }> = ({ status }) => {
  const styles = {
    [ItemStatus.REPORTED]: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    [ItemStatus.UNDER_REVIEW]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    [ItemStatus.MATCHED]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    [ItemStatus.RESOLVED]: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

export const TypeBadge: React.FC<{ type: ItemType }> = ({ type }) => {
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
      type === ItemType.LOST 
        ? 'bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50' 
        : 'bg-teal-50 text-teal-600 border border-teal-200 dark:bg-teal-900/20 dark:text-teal-400 dark:border-teal-900/50'
    }`}>
      {type}
    </span>
  );
};

// --- Form Elements ---
export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
    <input
      {...props}
      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-300 bg-white dark:bg-slate-700 dark:text-white"
    />
  </div>
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; options: string[] }> = ({ label, options, ...props }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
    <select
      {...props}
      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-300 bg-white dark:bg-slate-700 dark:text-white"
    >
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }> = ({ label, ...props }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
    <textarea
      {...props}
      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-300 bg-white dark:bg-slate-700 dark:text-white"
      rows={4}
    />
  </div>
);

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' }> = ({ variant = 'primary', className = '', ...props }) => {
  const baseStyle = "px-4 py-2 rounded-md font-medium text-sm transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
    secondary: "bg-white dark:bg-slate-700 text-gray-700 dark:text-white border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 focus:ring-indigo-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className} disabled:opacity-50 disabled:cursor-not-allowed`} {...props} />
  );
};