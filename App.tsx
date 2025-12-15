import React, { useState, useEffect, useMemo } from 'react';
import { Item, ItemType, ItemStatus, User, UserRole, Category, MatchSuggestion } from './types';
import { INITIAL_ITEMS, CURRENT_USER, ADMIN_USER } from './services/mockData';
import { findSmartMatches } from './services/geminiService';
import { StatusBadge, TypeBadge, Button, Input, Select, Textarea } from './components/Components';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Search, 
  User as UserIcon, 
  LogOut, 
  MapPin, 
  Calendar, 
  CheckCircle,
  XCircle,
  BrainCircuit,
  Loader2,
  Image as ImageIcon,
  Upload,
  Pencil,
  Sun,
  Moon,
  ArrowLeft,
  Shield,
  AlertCircle,
  ChevronDown
} from 'lucide-react';

// --- AUTH DATA SIMULATION ---
const INITIAL_DB = [
  // Student Login
  { 
    user: { ...CURRENT_USER, id: 'student1', name: 'Alex Student', email: 'student@campus.edu' }, 
    password: 'password', 
    loginId: 'student@campus.edu' 
  },
  // Staff Login
  { 
    user: { ...CURRENT_USER, id: 'staff1', name: 'Sarah Staff', email: 'staff@campus.edu' }, 
    password: 'password', 
    loginId: 'staff@campus.edu' 
  },
  // Admin Login (Username: admin, Password: admin)
  {
    user: ADMIN_USER,
    password: 'admin',
    loginId: 'admin' 
  }
];

// --- VIEW COMPONENTS ---

// 1. LOGIN SCREEN
interface LoginScreenProps {
  onLogin: (id: string, pass: string, role: UserRole) => Promise<boolean>;
  onSignup: (name: string, email: string, pass: string, type: 'Student' | 'Staff') => Promise<void>;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onSignup }) => {
  const [view, setView] = useState<'login' | 'signup' | 'forgot'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Login Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'Student' | 'Staff' | 'Administrator'>('Student');

  // Signup Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPass, setNewPass] = useState('');
  const [newConfirmPass, setNewConfirmPass] = useState('');
  const [newType, setNewType] = useState<'Student' | 'Staff'>('Student');

  // Clear errors when view changes
  useEffect(() => {
    setError('');
    // Auto-fill dummy data based on role for easier testing
    if (view === 'login') {
      if (selectedRole === 'Administrator') {
        setEmail('');
        setPassword(''); 
      } else if (selectedRole === 'Student') {
        setEmail(''); 
        setPassword('');
      } else {
        setEmail('');
        setPassword('');
      }
    }
  }, [view, selectedRole]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Map dropdown selection to internal UserRole
    const targetRole = selectedRole === 'Administrator' ? UserRole.ADMIN : UserRole.USER;

    try {
      const success = await onLogin(email, password, targetRole);
      if (!success) {
        setError('Invalid credentials or incorrect role selected.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPass !== newConfirmPass) {
      setError('Passwords do not match.');
      return;
    }
    if (newPass.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      await onSignup(newName, newEmail, newPass, newType);
    } catch (err) {
      setError('Failed to create account.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert('Password reset link sent to your email.');
      setView('login');
    }, 1000);
  };

  const getPlaceholder = () => {
    if (selectedRole === 'Administrator') return "admin";
    if (selectedRole === 'Staff') return "staff@campus.edu";
    return "student@campus.edu";
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 font-sans text-slate-200">
      
      {/* App Logo / Header Area */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Finder</h1>
        <p className="text-cyan-400 font-medium">Campus Lost & Found Management System</p>
      </div>

      <div className="w-full max-w-md bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-2xl overflow-hidden p-8">
        
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-lg p-3 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        {/* --- VIEW: LOGIN --- */}
        {view === 'login' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Sign in</h2>
              <div className="relative">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as any)}
                  className="appearance-none bg-slate-700 text-white pl-4 pr-10 py-1.5 rounded-lg text-sm border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none cursor-pointer"
                >
                  <option value="Student">Student</option>
                  <option value="Staff">Staff</option>
                  <option value="Administrator">Administrator</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  {selectedRole === 'Administrator' ? 'Username' : 'Email'}
                </label>
                <input
                  type="text"
                  placeholder={getPlaceholder()}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Password</label>
                <input
                  type="password"
                  placeholder={selectedRole === 'Administrator' ? "admin" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-cyan-400 hover:bg-cyan-300 text-slate-900 font-bold py-3 rounded-lg transition-colors mt-2 flex justify-center items-center"
              >
                {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Sign in'}
              </button>
            </form>

            <div className="flex justify-between items-center mt-6 text-sm">
              <button onClick={() => setView('forgot')} className="text-cyan-400 hover:text-cyan-300 transition-colors">
                Forgot password?
              </button>
              <button onClick={() => setView('signup')} className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                Sign up
              </button>
            </div>
          </div>
        )}

        {/* --- VIEW: SIGN UP --- */}
        {view === 'signup' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-2xl font-bold text-white mb-6">Create Account</h2>
            
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">I am a...</label>
                <div className="relative">
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full appearance-none bg-slate-700/50 text-white pl-4 pr-10 py-3 rounded-lg text-sm border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none cursor-pointer"
                  >
                    <option value="Student">Student</option>
                    <option value="Staff">Staff Member</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Email</label>
                <input
                  type="email"
                  placeholder="you@campus.edu"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    required
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Confirm</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={newConfirmPass}
                    onChange={(e) => setNewConfirmPass(e.target.value)}
                    required
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-cyan-400 hover:bg-cyan-300 text-slate-900 font-bold py-3 rounded-lg transition-colors mt-4 flex justify-center items-center"
              >
                {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Sign Up'}
              </button>
            </form>

            <div className="text-center mt-6">
               <span className="text-slate-400 text-sm">Already have an account? </span>
               <button onClick={() => setView('login')} className="text-cyan-400 hover:text-cyan-300 font-medium text-sm transition-colors">
                 Sign in
               </button>
            </div>
          </div>
        )}

        {/* --- VIEW: FORGOT PASSWORD --- */}
        {view === 'forgot' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
             <h2 className="text-2xl font-bold text-white mb-4">Reset Password</h2>
             <p className="text-slate-400 mb-6 text-sm">Enter your email address and we'll send you a link to reset your password.</p>
             
             <form onSubmit={handleForgotSubmit} className="space-y-5">
               <div>
                 <label className="block text-sm font-semibold text-slate-300 mb-2">Email</label>
                 <input
                   type="email"
                   placeholder="you@campus.edu"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   required
                   className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                 />
               </div>
               
               <button
                 type="submit"
                 disabled={isLoading}
                 className="w-full bg-cyan-400 hover:bg-cyan-300 text-slate-900 font-bold py-3 rounded-lg transition-colors flex justify-center items-center"
               >
                 {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Send Reset Link'}
               </button>
             </form>

             <div className="text-center mt-6">
                <button onClick={() => setView('login')} className="text-cyan-400 hover:text-cyan-300 font-medium text-sm transition-colors flex items-center justify-center gap-2">
                  <ArrowLeft size={14} /> Back to Sign in
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 2. REPORT / EDIT FORM (Reusable)
const ReportItemForm: React.FC<{ 
  initialData?: Item;
  onSubmit: (item: Omit<Item, 'id' | 'status' | 'reporterId'>) => void;
  onCancel: () => void;
}> = ({ initialData, onSubmit, onCancel }) => {
  const [type, setType] = useState<ItemType>(initialData?.type || ItemType.LOST);
  const [title, setTitle] = useState(initialData?.title || '');
  const [category, setCategory] = useState<Category>(initialData?.category || Category.OTHER);
  const [description, setDescription] = useState(initialData?.description || '');
  const [location, setLocation] = useState(initialData?.location || '');
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [imageUrl, setImageUrl] = useState<string | undefined>(initialData?.imageUrl);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ type, title, category, description, location, date, imageUrl });
  };

  const isEditing = !!initialData;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6 max-w-2xl mx-auto transition-colors duration-300">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        {isEditing ? <Pencil className="h-6 w-6 text-indigo-600 dark:text-indigo-400" /> : <PlusCircle className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />}
        {isEditing ? 'Edit Item Details' : `Report a ${type === ItemType.LOST ? 'Lost' : 'Found'} Item`}
      </h2>
      
      <form onSubmit={handleSubmit}>
        {!isEditing && (
          <div className="flex gap-4 mb-6">
            <button
              type="button"
              onClick={() => setType(ItemType.LOST)}
              className={`flex-1 py-3 text-center rounded-lg border font-medium transition-colors duration-300 ${
                type === ItemType.LOST 
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-400' 
                  : 'border-gray-200 dark:border-slate-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'
              }`}
            >
              I Lost Something
            </button>
            <button
              type="button"
              onClick={() => setType(ItemType.FOUND)}
              className={`flex-1 py-3 text-center rounded-lg border font-medium transition-colors duration-300 ${
                type === ItemType.FOUND 
                  ? 'bg-teal-50 dark:bg-teal-900/20 border-teal-500 text-teal-700 dark:text-teal-400' 
                  : 'border-gray-200 dark:border-slate-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'
              }`}
            >
              I Found Something
            </button>
          </div>
        )}

        <Input label="What is it?" placeholder="e.g. Silver MacBook Pro" value={title} onChange={e => setTitle(e.target.value)} required />
        
        {/* Image Upload Section */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Upload Photo (Optional)</label>
          <div className="flex items-start gap-4">
            <div className="relative w-24 h-24 bg-gray-50 dark:bg-slate-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-600 flex items-center justify-center overflow-hidden hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors duration-300 group">
              {imageUrl ? (
                <>
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Upload className="text-white h-6 w-6" />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center">
                  <ImageIcon className="text-gray-400 dark:text-gray-500 h-6 w-6 mb-1" />
                  <span className="text-xs text-gray-400 dark:text-gray-500">Add</span>
                </div>
              )}
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 opacity-0 cursor-pointer" 
              />
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 py-1">
              <p>Helps match items faster.</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">JPG, PNG up to 5MB</p>
              {imageUrl && (
                <button 
                  type="button" 
                  onClick={() => setImageUrl(undefined)}
                  className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 mt-2 font-medium transition-colors duration-300"
                >
                  Remove photo
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select 
            label="Category" 
            value={category} 
            onChange={e => setCategory(e.target.value as Category)}
            options={Object.values(Category)}
          />
          <Input 
            label="Date" 
            type="date" 
            value={date} 
            onChange={e => setDate(e.target.value)} 
            required 
          />
        </div>

        <Input label="Where?" placeholder="e.g. Main Library, 2nd Floor" value={location} onChange={e => setLocation(e.target.value)} required />
        <Textarea label="Description" placeholder="Provide details like color, scratches, stickers, brands..." value={description} onChange={e => setDescription(e.target.value)} required />

        <div className="flex justify-end gap-3 mt-8">
          <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button type="submit">{isEditing ? 'Update Item' : 'Submit Report'}</Button>
        </div>
      </form>
    </div>
  );
};

// 3. ITEM LIST (Shared)
const ItemList: React.FC<{ items: Item[]; title: string; showActions?: boolean; onAction?: (id: string, action: string) => void }> = ({ items, title, showActions, onAction }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 transition-colors duration-300">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center transition-colors duration-300">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">{items.length} items</span>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-slate-700 transition-colors duration-300">
        {items.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">No items found.</div>
        ) : (
          items.map(item => (
            <div key={item.id} className="p-6 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-300">
              <div className="flex gap-4">
                {/* Image Thumbnail with Hover Preview */}
                {item.imageUrl && (
                  <div className="relative group shrink-0 cursor-zoom-in">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="w-20 h-20 object-cover rounded-md border border-gray-200 dark:border-slate-600 transition-colors duration-300"
                    />
                    {/* Tooltip Preview */}
                    <div className="hidden group-hover:block absolute top-0 left-full ml-2 z-50 w-64 p-2 bg-white dark:bg-slate-800 shadow-xl rounded-lg border border-gray-200 dark:border-slate-700 animate-in fade-in duration-200">
                      <img 
                        src={item.imageUrl} 
                        alt="Preview" 
                        className="w-full h-auto rounded"
                      />
                    </div>
                  </div>
                )}
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-2 items-center flex-wrap">
                      <TypeBadge type={item.type} />
                      <StatusBadge status={item.status} />
                      <h4 className="text-base font-semibold text-gray-900 dark:text-white">{item.title}</h4>
                    </div>
                    {item.date && <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{item.date}</span>}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">{item.description}</p>
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                    <span className="flex items-center gap-1"><MapPin size={12} /> {item.location}</span>
                    <span className="flex items-center gap-1"><Calendar size={12} /> {item.category}</span>
                  </div>
                  
                  {showActions && onAction && (
                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 flex-wrap transition-colors duration-300">
                       {item.status === ItemStatus.REPORTED && (
                         <Button variant="secondary" className="text-xs py-1" onClick={() => onAction(item.id, 'match')}>Find Matches</Button>
                       )}
                       {item.status !== ItemStatus.RESOLVED && (
                         <Button variant="primary" className="text-xs py-1 bg-green-600 hover:bg-green-700 border-transparent text-white" onClick={() => onAction(item.id, 'resolve')}>Mark Resolved</Button>
                       )}
                       {/* Admin Edit Button */}
                       <Button variant="secondary" className="text-xs py-1 flex items-center gap-1" onClick={() => onAction(item.id, 'edit')}>
                         <Pencil size={12} /> Edit
                       </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// 4. ADMIN DASHBOARD STATS
const AdminStats: React.FC<{ items: Item[] }> = ({ items }) => {
  const stats = useMemo(() => ({
    total: items.length,
    lost: items.filter(i => i.type === ItemType.LOST).length,
    found: items.filter(i => i.type === ItemType.FOUND).length,
    resolved: items.filter(i => i.status === ItemStatus.RESOLVED).length,
  }), [items]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {[
        { label: 'Total Reports', value: stats.total, color: 'text-indigo-600 dark:text-indigo-400' },
        { label: 'Lost Items', value: stats.lost, color: 'text-red-600 dark:text-red-400' },
        { label: 'Found Items', value: stats.found, color: 'text-teal-600 dark:text-teal-400' },
        { label: 'Resolved', value: stats.resolved, color: 'text-green-600 dark:text-green-400' },
      ].map((stat, idx) => (
        <div key={idx} className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 transition-colors duration-300">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
          <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
        </div>
      ))}
    </div>
  );
};

// 5. MATCHING INTERFACE (With Gemini)
const MatchInterface: React.FC<{ 
  targetItem: Item | null; 
  allItems: Item[]; 
  onClose: () => void;
  onConfirmMatch: (lostId: string, foundId: string) => void;
}> = ({ targetItem, allItems, onClose, onConfirmMatch }) => {
  const [suggestions, setSuggestions] = useState<MatchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  useEffect(() => {
    if (targetItem && !hasRun) {
      setLoading(true);
      findSmartMatches(targetItem, allItems)
        .then(matches => {
          setSuggestions(matches);
          setLoading(false);
          setHasRun(true);
        });
    }
  }, [targetItem, allItems, hasRun]);

  if (!targetItem) return null;

  return (
    <div className="fixed inset-0 bg-gray-600/50 dark:bg-black/60 flex items-center justify-center p-4 z-50 overflow-y-auto backdrop-blur-sm transition-colors duration-500">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border dark:border-slate-700 transition-colors duration-300">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BrainCircuit className="text-indigo-600 dark:text-indigo-400" />
            AI Smart Matching
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors duration-300">
            <XCircle size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 p-4 rounded-lg mb-6 flex gap-4 transition-colors duration-300">
             {targetItem.imageUrl && (
                <img 
                  src={targetItem.imageUrl} 
                  alt="Target" 
                  className="w-24 h-24 object-cover rounded-lg border border-indigo-200 dark:border-indigo-800 shrink-0 transition-colors duration-300" 
                />
             )}
            <div>
              <h4 className="text-xs font-semibold uppercase text-indigo-800 dark:text-indigo-300 mb-1">Target Item</h4>
              <p className="font-medium text-gray-900 dark:text-white">{targetItem.title}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">{targetItem.description}</p>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex gap-3">
                <span>{targetItem.location}</span>
                <span>{targetItem.date}</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-10 w-10 text-indigo-600 dark:text-indigo-400 animate-spin mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Analyzing semantic matches...</p>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No strong AI matches found based on description and context.
            </div>
          ) : (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white">Suggested Matches ({suggestions.length})</h4>
              {suggestions.map((suggestion, idx) => {
                 const matchedItem = allItems.find(i => i.id === (targetItem.type === ItemType.LOST ? suggestion.foundItemId : suggestion.lostItemId));
                 if(!matchedItem) return null;
                 
                 return (
                  <div key={idx} className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:border-indigo-300 dark:hover:border-indigo-500 transition-colors duration-300">
                    <div className="flex justify-between items-start gap-4">
                      {/* Match Image */}
                      {matchedItem.imageUrl && (
                        <img 
                          src={matchedItem.imageUrl} 
                          alt="Match" 
                          className="w-20 h-20 object-cover rounded-md border border-gray-200 dark:border-slate-700 shrink-0 transition-colors duration-300" 
                        />
                      )}
                      
                      <div className="flex-1">
                         <div className="flex items-center gap-2 mb-1">
                           <span className="font-bold text-gray-900 dark:text-white">{matchedItem.title}</span>
                           <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 px-2 py-0.5 rounded-full">
                             {Math.round(suggestion.confidence * 100)}% Match
                           </span>
                         </div>
                         <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{matchedItem.description}</p>
                         <div className="text-xs bg-gray-50 dark:bg-slate-700 p-2 rounded text-gray-700 dark:text-gray-300 transition-colors duration-300">
                           <span className="font-semibold">AI Reasoning:</span> {suggestion.reasoning}
                         </div>
                      </div>
                      <Button 
                        onClick={() => onConfirmMatch(suggestion.lostItemId, suggestion.foundItemId)}
                        className="ml-4 shrink-0"
                      >
                        Confirm Match
                      </Button>
                    </div>
                  </div>
                 );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


// --- MAIN APP LOGIC ---

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [items, setItems] = useState<Item[]>(INITIAL_ITEMS);
  const [view, setView] = useState<'dashboard' | 'report'>('dashboard');
  const [darkMode, setDarkMode] = useState(true);
  
  // Database State for Auth
  const [userDb, setUserDb] = useState(INITIAL_DB);

  // Admin State
  const [matchingTargetId, setMatchingTargetId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  // Toggle Theme Effect
  useEffect(() => {
    // Force dark mode if user is not logged in (Login Screen) OR if dark mode is explicitly enabled
    if (!currentUser || darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode, currentUser]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  // Computed
  const userItems = useMemo(() => items.filter(i => i.reporterId === currentUser?.id), [items, currentUser]);
  const unresolvedItems = useMemo(() => items.filter(i => i.status !== ItemStatus.RESOLVED), [items]);

  const handleLogout = () => {
    setCurrentUser(null);
    setView('dashboard');
    setMatchingTargetId(null);
    setEditingItem(null);
  };

  const handleLogin = async (id: string, pass: string, role: UserRole): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 800)); // Simulate delay
    
    // Find user in DB
    // Simple check: match credentials AND ensure the retrieved user has the role (or super admin access)
    // For this prototype: 
    // - If trying to login as ADMIN, user must have ADMIN role.
    // - If trying to login as USER (Student/Staff), user must have USER role.
    
    const record = userDb.find(u => u.loginId === id && u.password === pass);
    
    if (record) {
      if (role === UserRole.ADMIN && record.user.role !== UserRole.ADMIN) {
        return false; // Access denied
      }
      
      setCurrentUser(record.user);
      return true;
    }
    return false;
  };

  const handleSignup = async (name: string, email: string, pass: string, type: 'Student' | 'Staff'): Promise<void> => {
    await new Promise(r => setTimeout(r, 800)); // Simulate delay
    
    // Create new user object
    // Appending type to name for visibility in this demo since we don't have a separate field in User type
    const displayName = `${name} (${type})`; 
    
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: displayName,
      email: email,
      role: UserRole.USER,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
    };

    // Update DB
    setUserDb(prev => [...prev, { 
      user: newUser, 
      password: pass, 
      loginId: email 
    }]);

    // Auto login
    setCurrentUser(newUser);
  };

  const handleReportSubmit = (newItemData: Omit<Item, 'id' | 'status' | 'reporterId'>) => {
    const newItem: Item = {
      ...newItemData,
      id: Math.random().toString(36).substr(2, 9),
      status: ItemStatus.REPORTED,
      reporterId: currentUser!.id,
      // Use uploaded image if available, else default placeholder
      imageUrl: newItemData.imageUrl || `https://picsum.photos/seed/${Math.random()}/300/200`
    };
    setItems([newItem, ...items]);
    setView('dashboard');
  };

  const handleUpdateItem = (updatedData: Omit<Item, 'id' | 'status' | 'reporterId'>) => {
    if (!editingItem) return;
    
    setItems(items.map(i => {
      if (i.id === editingItem.id) {
        return {
          ...i,
          ...updatedData,
          imageUrl: updatedData.imageUrl || i.imageUrl // Keep old image if not updated/removed explicitly
        };
      }
      return i;
    }));
    setEditingItem(null);
  };

  const handleResolve = (id: string) => {
    setItems(items.map(i => i.id === id ? { ...i, status: ItemStatus.RESOLVED } : i));
  };

  const handleConfirmMatch = (lostId: string, foundId: string) => {
    setItems(items.map(i => {
      if (i.id === lostId) return { ...i, status: ItemStatus.MATCHED, matchedItemId: foundId };
      if (i.id === foundId) return { ...i, status: ItemStatus.MATCHED, matchedItemId: lostId };
      return i;
    }));
    setMatchingTargetId(null);
  };

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} onSignup={handleSignup} />;
  }

  const isUser = currentUser.role === UserRole.USER;
  const isAdmin = currentUser.role === UserRole.ADMIN;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-500 ease-in-out">
      {/* HEADER */}
      <header className="bg-white dark:bg-slate-800 shadow-sm z-10 sticky top-0 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded text-white">
              <Search size={20} />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">Finder</span>
            {isAdmin && <span className="ml-2 bg-gray-800 dark:bg-slate-700 text-white text-xs px-2 py-0.5 rounded">Admin</span>}
          </div>
          
          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-700 transition-colors duration-300"
              title="Toggle Theme"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <UserIcon size={16} />
              <span className="hidden sm:inline">{currentUser.name}</span>
            </div>
            <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors duration-300">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* VIEW: REPORT FORM */}
        {view === 'report' && (
          <ReportItemForm 
            onSubmit={handleReportSubmit} 
            onCancel={() => setView('dashboard')} 
          />
        )}

        {/* VIEW: DASHBOARDS */}
        {view === 'dashboard' && (
          <div className="space-y-6">
            
            {/* USER DASHBOARD HEADER */}
            {isUser && (
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Reports</h1>
                  <p className="text-gray-500 dark:text-gray-400">Track your lost and found items</p>
                </div>
                <Button onClick={() => setView('report')} className="flex items-center gap-2">
                  <PlusCircle size={18} /> Report New
                </Button>
              </div>
            )}

            {/* ADMIN DASHBOARD HEADER */}
            {isAdmin && (
               <div>
                 <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Admin Dashboard</h1>
                 <AdminStats items={items} />
                 
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">All Active Cases</h2>
                    <div className="flex gap-2">
                        {/* Filters could go here */}
                    </div>
                 </div>
               </div>
            )}

            {/* ITEM LISTS */}
            {isUser ? (
              <ItemList items={userItems} title="Your Submissions" />
            ) : (
              <div className="space-y-8">
                {/* Admin sees everything */}
                <ItemList 
                  items={unresolvedItems} 
                  title="Unresolved Items" 
                  showActions={true}
                  onAction={(id, action) => {
                    if (action === 'match') setMatchingTargetId(id);
                    if (action === 'resolve') handleResolve(id);
                    if (action === 'edit') setEditingItem(items.find(i => i.id === id) || null);
                  }}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODALS */}
      {isAdmin && matchingTargetId && (
        <MatchInterface 
          targetItem={items.find(i => i.id === matchingTargetId) || null}
          allItems={items}
          onClose={() => setMatchingTargetId(null)}
          onConfirmMatch={handleConfirmMatch}
        />
      )}

      {/* EDIT MODAL */}
      {isAdmin && editingItem && (
        <div className="fixed inset-0 bg-gray-600/50 dark:bg-black/60 flex items-center justify-center p-4 z-50 overflow-y-auto backdrop-blur-sm transition-colors duration-500">
          <div className="w-full max-w-2xl">
             <ReportItemForm 
               initialData={editingItem}
               onSubmit={handleUpdateItem}
               onCancel={() => setEditingItem(null)}
             />
          </div>
        </div>
      )}
    </div>
  );
}