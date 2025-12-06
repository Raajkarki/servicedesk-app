import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  List,
  Wrench,
  Monitor,
  Cpu,
  UserCheck,
  AlertCircle,
  CheckCircle,
  Clock,
  Search,
  Save,
  Trash2,
  Filter,
  Calendar,
  Download,
  Edit,
  Shield,
  Laptop,
  User,
  X,
  BarChart3,
  Cloud,
  Loader2,
  AlertTriangle,
  LogOut,
  Lock,
  Zap,
  Plug,
  Headphones,
  Mouse,
  Printer,
  Hammer,
  FileText,
  Phone,
  Globe,
  Mail,
  Key,
  LayoutGrid,
  ShieldAlert,
  Wifi,
  Settings,
  HardDrive,
  CheckSquare,
  PieChart,
  ArrowRight,
  Database,
  Cable,
  MemoryStick,

  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Pin
} from 'lucide-react';

// Firebase Imports
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  writeBatch,
  getDocs,
  query,
  where
} from 'firebase/firestore';

// Import Device Management Component
import { DeviceManagement } from './DeviceManagement';

// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyDCmTAUrmGeMpocOYVHQhhLsnYbFNz8IHI",
  authDomain: "servicedesk-app-6fc80.firebaseapp.com",
  projectId: "servicedesk-app-6fc80",
  storageBucket: "servicedesk-app-6fc80.firebasestorage.app",
  messagingSenderId: "190219767124",
  appId: "1:190219767124:web:7dd7dad25a0258ff464cc1",
  measurementId: "G-8XKC6XD8ER"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Use default ID if not provided by environment
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- CONSTANTS & LISTS ---
const TECHNICIANS = [
  "Lachhuman Subedi",
  "Puspa Raj Karki",
  "Prasant Regmi",
  "Alok Basnet",
  "Sanjib Bajgain"
];

const DEPARTMENTS = [
  "L&D", "Admin", "IT", "LPA", "LPS", "Outsourcing", "Developer", "CA", "Marketing", "Broker"
];

const DEVICE_TYPES = [
  "Laptop", "Mouse", "Keyboard", "Headphone", "LAN", "Wifi/Router", "Monitor", "Printer", "Other"
];

const HARDWARE_UPGRADES_LIST = [
  "Display", "Adapter", "LAN", "Mouse", "Headphone", "Keyboard",
  "Fan/Cooler", "Charger", "HDMI", "RAM", "Storage", "Battery"
];

const HARDWARE_CATEGORIES = [
  'Adapter / Charger', 'Battery / Power', 'Display / Screen',
  'Keyboard', 'Mouse / Trackpad', 'Headphone / Audio', 'LAN / Network',
  'Wifi / Router', 'Storage / Hard Drive', 'RAM / Memory', 'Fan / Cooling',
  'Motherboard', 'Printer / Scanner', 'Monitor (External)', 'HDMI / Cables',
  'Physical Damage'
];

const SOFTWARE_CATEGORIES = [
  'Nitro Pro PDF Editor', 'Dialpad', 'Mercury', 'Gmail/Google', 'Keeper',
  'Office 365', 'SentinelOne', 'VPN', 'Wifi',
  'Operating System', 'Jira'
];

// Extended Color Palette for Pie Chart
const PIE_COLORS = [
  '#6366f1', // Indigo
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#8b5cf6', // Violet
  '#14b8a6', // Teal
  '#f97316', // Orange
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#d946ef', // Fuchsia
  '#f43f5e'  // Rose
];

// --- COMPONENTS ---

// 1. SVG Pie Chart Component
const DepartmentPieChart = ({ data }) => {
  const total = data.reduce((acc, item) => acc + item.count, 0);

  if (total === 0) {
    return (
      <div className="h-72 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-2xl border border-slate-100">
        <PieChart size={48} className="mb-3 opacity-20" />
        <p className="text-sm font-medium">No data available for chart</p>
      </div>
    );
  }

  let currentAngle = 0;

  // Helper to calculate SVG path command for a slice
  const getCoordinatesForPercent = (percent) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100/80 transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-500" />
          Department Insights
        </h3>
        <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full flex items-center gap-1.5 animate-pulse border border-red-100">
          <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
          Live Data
        </span>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-center gap-10">
        {/* The Pie Chart SVG */}
        <div className="relative w-56 h-56 flex-shrink-0 group">
          <svg viewBox="-1.1 -1.1 2.2 2.2" className="transform -rotate-90 w-full h-full drop-shadow-xl">
            {data.map((slice, index) => {
              const startAngle = currentAngle;
              const sliceAngle = slice.count / total;
              currentAngle += sliceAngle;

              const [startX, startY] = getCoordinatesForPercent(startAngle);
              const [endX, endY] = getCoordinatesForPercent(currentAngle);

              const largeArcFlag = sliceAngle > 0.5 ? 1 : 0;

              const pathData = [
                `M 0 0`,
                `L ${startX} ${startY}`,
                `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                `Z`
              ].join(' ');

              return (
                <path
                  key={slice.name}
                  d={pathData}
                  fill={PIE_COLORS[index % PIE_COLORS.length]}
                  className="hover:opacity-90 transition-all duration-300 cursor-pointer hover:scale-105 origin-center"
                  stroke="white"
                  strokeWidth="0.02"
                >
                  <title>{`${slice.name}: ${slice.count} tickets`}</title>
                </path>
              );
            })}
          </svg>
          {/* Inner Circle for Donut Effect */}
          <div className="absolute inset-0 m-auto w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-inner">
            <div className="text-center">
              <span className="block text-2xl font-bold text-slate-800">{total}</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Tickets</span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-1 gap-y-2 text-sm w-full max-w-md px-4">
          {data.map((slice, index) => (
            <div key={slice.name} className="flex items-center justify-between group cursor-default p-1 hover:bg-slate-50 rounded-lg transition-colors">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span
                  className="w-3 h-3 rounded-full ring-2 ring-white shadow-sm flex-shrink-0"
                  style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                ></span>
                <span className="text-slate-600 font-medium group-hover:text-slate-900 transition-colors truncate" title={slice.name}>{slice.name}</span>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                <span className="font-bold text-slate-700">{slice.count}</span>
                <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-full">
                  {Math.round((slice.count / total) * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('dashboard');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const [deletingIds, setDeletingIds] = useState([]);

  const [timeFilter, setTimeFilter] = useState('All Time');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created'); // created, solved, damaged
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const [editingId, setEditingId] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [statsModal, setStatsModal] = useState({ isOpen: false, type: null });
  const [initialDeviceId, setInitialDeviceId] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Check for deep link on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const deviceId = params.get('deviceId');
    if (deviceId) {
      setInitialDeviceId(deviceId);
      setView('devices');
      // Clean up URL without refreshing
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const [formData, setFormData] = useState({
    serialNumber: '',
    department: DEPARTMENTS[0],
    requestingPerson: '',
    technician: TECHNICIANS[0],
    issueType: 'Hardware',
    deviceType: DEVICE_TYPES[0],
    issueCategory: '',
    status: 'Pending',
    priority: 'Medium',
    upgrades: [],
    receiverName: '',
    receiverDept: '',
    description: ''
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const ticketsCollection = collection(db, 'artifacts', appId, 'public', 'data', 'tickets');

    const unsubscribe = onSnapshot(ticketsCollection, (snapshot) => {
      const fetchedTickets = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Sort: Pinned First, then by selected sort field (descending - recent first)
      fetchedTickets.sort((a, b) => {
        if (a.isPinned === b.isPinned) {
          // Sort by selected date field
          let dateA, dateB;
          if (sortBy === 'solved') {
            dateA = new Date(a.dateSolved || a.dateCreated || a.timestamp).getTime();
            dateB = new Date(b.dateSolved || b.dateCreated || b.timestamp).getTime();
          } else if (sortBy === 'damaged') {
            dateA = new Date(a.dateDamaged || a.dateCreated || a.timestamp).getTime();
            dateB = new Date(b.dateDamaged || b.dateCreated || b.timestamp).getTime();
          } else { // 'created' or default
            dateA = new Date(a.timestamp || a.dateCreated).getTime();
            dateB = new Date(b.timestamp || b.dateCreated).getTime();
          }
          return dateB - dateA; // Recent first (descending)
        }
        return a.isPinned ? -1 : 1;
      });

      setTickets(fetchedTickets);
      setLoading(false);
      setErrorMsg(null);
    }, (err) => {
      console.error("Data sync error:", err);
      if (err.code === 'permission-denied') {
        setErrorMsg("Permission Denied: Check Firestore Rules in Firebase Console.");
      } else {
        setErrorMsg(`Sync Error: ${err.message}`);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    setCurrentPage(1);
    // Close stats modal when view changes
    setStatsModal({ isOpen: false, type: null });
  }, [timeFilter, searchTerm, view, sortBy]);



  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setErrorMsg(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error("Login Error:", err);
      let msg = "Failed to login.";
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        msg = "Invalid email or password. Ensure this user is created in Firebase Console.";
      } else if (err.code === 'auth/too-many-requests') {
        msg = "Too many failed attempts. Try again later.";
      } else if (err.code === 'auth/operation-not-allowed') {
        msg = "Login disabled. Enable 'Email/Password' in Firebase Console -> Auth.";
      }
      alert(msg);
      setErrorMsg(msg);
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await signOut(auth);
      setTickets([]);
      setView('dashboard');
    } catch (err) {
      console.error("Logout Error:", err);
    } finally {
      setLogoutLoading(false);
    }
  };

  const handleTypeChange = (newType) => {
    setFormData(prev => ({
      ...prev,
      issueType: newType,
      status: newType === 'Hardware' ? 'Pending' : 'Open',
      deviceType: newType === 'Hardware' ? DEVICE_TYPES[0] : 'N/A',
      upgrades: [],
      // Reset category if switching types
      issueCategory: newType === 'Hardware' ? '' : 'Nitro Pro PDF Editor'
    }));
  };

  const getFilteredTickets = () => {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const startOfYear = new Date(new Date().getFullYear(), 0, 1);

    // "Today" logic
    const today = new Date().toISOString().split('T')[0];

    return tickets.filter(ticket => {
      const tDate = new Date(ticket.dateCreated);
      const tDateString = ticket.dateCreated; // Assuming format YYYY-MM-DD

      let timeMatch = true;
      if (timeFilter === 'Today') timeMatch = tDateString === today;
      else if (timeFilter === 'This Week') timeMatch = tDate >= startOfWeek;
      else if (timeFilter === 'This Month') timeMatch = tDate >= startOfMonth;
      else if (timeFilter === 'This Year') timeMatch = tDate >= startOfYear;

      const searchLower = searchTerm.toLowerCase();
      const searchMatch =
        (ticket.ticketId || '').toLowerCase().includes(searchLower) ||
        (ticket.serialNumber || '').toLowerCase().includes(searchLower) ||
        (ticket.technician || '').toLowerCase().includes(searchLower) ||
        (ticket.department || '').toLowerCase().includes(searchLower) ||
        (ticket.requestingPerson && ticket.requestingPerson.toLowerCase().includes(searchLower)) ||
        (ticket.issueCategory || '').toLowerCase().includes(searchLower);

      return timeMatch && searchMatch;
    });
  };

  const filteredTickets = getFilteredTickets();

  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTickets = filteredTickets.slice(startIndex, startIndex + itemsPerPage);
  const nextPage = () => setCurrentPage(p => Math.min(totalPages, p + 1));
  const prevPage = () => setCurrentPage(p => Math.max(1, p - 1));

  const stats = {
    total: filteredTickets.length,
    critical: filteredTickets.filter(t => ['Damaged', 'Open'].includes(t.status)).length,
    completed: filteredTickets.filter(t => ['Repaired', 'Resolved'].includes(t.status)).length,
    working: filteredTickets.filter(t => ['Pending', 'In Progress'].includes(t.status)).length,
    hardware: filteredTickets.filter(t => t.issueType === 'Hardware').length,
    software: filteredTickets.filter(t => t.issueType === 'Software').length,
  };

  const getDetailedStats = (type) => {
    const relevantTickets = filteredTickets.filter(t => t.issueType === type);
    const counts = {};
    relevantTickets.forEach(t => {
      // For hardware without category, use device type (Laptop, Mouse, etc.)
      // For software without category, show 'Uncategorized'
      const cat = t.issueCategory || (t.issueType === 'Hardware' ? t.deviceType : 'Uncategorized');
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts).map(([category, count]) => ({ category, count })).sort((a, b) => b.count - a.count);
  };

  const getDepartmentStats = () => {
    const counts = {};
    filteredTickets.forEach(t => {
      const dept = t.department || 'Unknown';
      counts[dept] = (counts[dept] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  };

  const departmentData = getDepartmentStats();

  const getCategoryIcon = (category) => {
    switch (category) {
      // Hardware Categories
      case 'Adapter / Charger': return <Plug size={16} className="text-orange-500" />;
      case 'Headphone / Audio': return <Headphones size={16} className="text-purple-500" />;
      case 'Mouse / Trackpad': return <Mouse size={16} className="text-gray-500" />;
      case 'Keyboard': return <Keyboard size={16} className="text-slate-500" />;
      case 'Monitor (External)':
      case 'Display / Screen': return <Monitor size={16} className="text-blue-500" />;
      case 'Printer / Scanner': return <Printer size={16} className="text-slate-600" />;
      case 'Physical Damage': return <Hammer size={16} className="text-red-500" />;
      case 'Fan / Cooling': return <Cpu size={16} className="text-cyan-500" />;
      case 'Battery / Power': return <Zap size={16} className="text-green-500" />;
      case 'Storage / Hard Drive': return <HardDrive size={16} className="text-gray-600" />;
      case 'RAM / Memory': return <Database size={16} className="text-indigo-500" />;
      case 'LAN / Network':
      case 'Wifi / Router': return <Wifi size={16} className="text-blue-400" />;
      case 'HDMI / Cables': return <Plug size={16} className="text-gray-700" />;
      case 'Motherboard': return <Cpu size={16} className="text-emerald-600" />;
      // Software Categories
      case 'Nitro Pro PDF Editor': return <FileText size={16} className="text-red-600" />;
      case 'Dialpad': return <Phone size={16} className="text-green-500" />;
      case 'Mercury': return <Globe size={16} className="text-blue-400" />;
      case 'Gmail/Google': return <Mail size={16} className="text-red-500" />;
      case 'Keeper': return <Key size={16} className="text-yellow-600" />;
      case 'Office 365': return <LayoutGrid size={16} className="text-orange-600" />;
      case 'SentinelOne': return <ShieldAlert size={16} className="text-purple-600" />;
      case 'VPN': return <Lock size={16} className="text-indigo-500" />;
      case 'Microsoft Office': return <LayoutGrid size={16} className="text-blue-600" />;
      case 'Adobe Photoshop': return <Image size={16} className="text-blue-500" />;
      case 'Windows OS': return <Monitor size={16} className="text-cyan-600" />;
      // Device Types (for hardware without specific category)
      case 'Laptop': return <Laptop size={16} className="text-slate-700" />;
      case 'Desktop': return <Monitor size={16} className="text-slate-600" />;
      case 'Mouse': return <Mouse size={16} className="text-gray-500" />;
      case 'Monitor': return <Monitor size={16} className="text-blue-500" />;
      case 'Printer': return <Printer size={16} className="text-slate-600" />;
      case 'Headphones': return <Headphones size={16} className="text-purple-500" />;
      default: return <FileText size={16} className="text-slate-400" />;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'issueType') {
      handleTypeChange(value);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => {
    setFormData({
      serialNumber: '',
      department: DEPARTMENTS[0],
      requestingPerson: '',
      technician: TECHNICIANS[0],
      issueType: 'Hardware',
      deviceType: DEVICE_TYPES[0],
      issueCategory: '',
      status: 'Pending',
      priority: 'Medium',
      upgrades: [],
      receiverName: '',
      receiverDept: '',
      description: '',
      dateDamaged: null,
      dateSolved: null,
      datePending: null
    });
    setEditingId(null);
  };

  const handleEditClick = (ticket, e) => {
    if (e) e.stopPropagation();
    setFormData(ticket);
    setEditingId(ticket.id);
    setView('new');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { alert("You are not authenticated."); return; }
    try {
      let finalData = { ...formData };
      if (editingId) {
        const ticketRef = doc(db, 'artifacts', appId, 'public', 'data', 'tickets', editingId);

        // Date tracking logic for updates
        const updates = { ...finalData, lastModified: new Date().toISOString() };
        if (finalData.status === 'Pending' && !finalData.datePending) {
          updates.datePending = new Date().toISOString().split('T')[0];
        }
        if ((finalData.status === 'Resolved' || finalData.status === 'Repaired') && !finalData.dateSolved) {
          updates.dateSolved = new Date().toISOString().split('T')[0];
        }
        if (finalData.status === 'Damaged' && !finalData.dateDamaged) {
          updates.dateDamaged = new Date().toISOString().split('T')[0];
        }

        await updateDoc(ticketRef, updates);
      } else {
        // Generate Ticket ID
        const existingIds = tickets
          .map(t => t.ticketId)
          .filter(id => id && id.startsWith('#HLE'))
          .map(id => parseInt(id.replace('#HLE', ''), 10));

        const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
        const nextId = `#HLE${String(maxId + 1).padStart(3, '0')}`;

        // Auto-link device for Software tickets
        let linkedSerial = finalData.serialNumber;
        if (finalData.issueType === 'Software' && finalData.requestingPerson) {
          try {
            const devicesCollection = collection(db, 'artifacts', appId, 'public', 'data', 'devices');
            const q = query(devicesCollection, where("assignedTo", "==", finalData.requestingPerson));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
              // Use the first matching device
              linkedSerial = querySnapshot.docs[0].data().serialNumber;
            }
          } catch (err) {
            console.error("Error linking device:", err);
          }
        }

        const newTicket = {
          ...finalData,
          serialNumber: linkedSerial, // Update serial number if linked
          ticketId: nextId,
          isPinned: false, // Default to not pinned
          dateCreated: new Date().toISOString().split('T')[0],
          datePending: finalData.status === 'Pending' ? new Date().toISOString().split('T')[0] : null,
          dateSolved: (finalData.status === 'Resolved' || finalData.status === 'Repaired') ? new Date().toISOString().split('T')[0] : null,
          dateDamaged: finalData.status === 'Damaged' ? new Date().toISOString().split('T')[0] : null,
          timestamp: new Date().toISOString()
        };
        const ticketsCollection = collection(db, 'artifacts', appId, 'public', 'data', 'tickets');
        await addDoc(ticketsCollection, newTicket);
      }
      setShowToast(true); setTimeout(() => setShowToast(false), 3000); setView('list'); resetForm();
    } catch (err) {
      console.error("Error saving ticket:", err);
      alert(`Failed to save: ${err.message}`);
    }
  };

  const togglePin = async (id, currentStatus, e) => {
    if (e) e.stopPropagation();
    if (!user) return;
    try {
      const ticketRef = doc(db, 'artifacts', appId, 'public', 'data', 'tickets', id);
      await updateDoc(ticketRef, { isPinned: !currentStatus });
    } catch (err) {
      console.error("Error updating pin status:", err);
    }
  };

  const deleteTicket = async (id, e) => {
    if (e) e.stopPropagation();
    if (!user) return;
    if (confirm("Are you sure you want to delete this record? This cannot be undone.")) {
      setDeletingIds(prev => [...prev, id]);
      try {
        const ticketRef = doc(db, 'artifacts', appId, 'public', 'data', 'tickets', id);
        await deleteDoc(ticketRef);
      } catch (err) {
        console.error("Error deleting:", err);
        alert(`Failed to delete: ${err.message}`);
      } finally {
        setDeletingIds(prev => prev.filter(pid => pid !== id));
      }
    }
  };

  const markComplete = async (id, currentType, e) => {
    if (e) e.stopPropagation();
    if (!user) return;
    try {
      const ticketRef = doc(db, 'artifacts', appId, 'public', 'data', 'tickets', id);
      const newStatus = currentType === 'Hardware' ? 'Repaired' : 'Resolved';
      await updateDoc(ticketRef, {
        status: newStatus,
        dateSolved: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };



  const exportCSV = () => {
    const headers = ["Ticket ID", "Serial Number", "Requesting Person", "Department", "Technician", "Issue Type", "Device Type", "Issue Category", "Status", "Priority", "Date Created", "Date Pending", "Date Solved", "Date Damaged"];
    const rows = filteredTickets.map(t => [
      t.ticketId || t.id,
      t.serialNumber,
      t.requestingPerson,
      t.department,
      t.technician,
      t.issueType,
      t.deviceType,
      t.issueCategory || (t.issueType === 'Hardware' ? t.deviceType : 'Software Issue'),
      t.status,
      t.priority,
      t.dateCreated,
      t.datePending || '',
      t.dateSolved || '',
      t.dateDamaged || ''
    ]);
    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `service_desk_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const StatusBadge = ({ status }) => {
    const colors = {
      Damaged: "bg-red-50 text-red-700 ring-1 ring-red-600/10",
      Repaired: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10",
      Pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/10",
      Open: "bg-rose-50 text-rose-700 ring-1 ring-rose-600/10",
      Resolved: "bg-teal-50 text-teal-700 ring-1 ring-teal-600/10",
      "In Progress": "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/10"
    };
    return (
      <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${colors[status] || "bg-gray-100 ring-1 ring-gray-200"}`}>
        {status}
      </span>
    );
  };

  const PriorityBadge = ({ priority }) => {
    const colors = {
      High: "text-orange-700 bg-orange-50 ring-1 ring-orange-600/20",
      Medium: "text-blue-700 bg-blue-50 ring-1 ring-blue-600/20",
      Low: "text-slate-600 bg-slate-100 ring-1 ring-slate-200",
    };
    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${colors[priority] || colors.Low}`}>
        {priority}
      </span>
    );
  };

  const StatsModal = () => {
    if (!statsModal.isOpen) return null;
    const data = getDetailedStats(statsModal.type);
    const typeColor = statsModal.type === 'Hardware' ? 'blue' : 'indigo';
    const maxCount = Math.max(...data.map(d => d.count), 1);

    return (
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden transform transition-all scale-100">
          <div className={`p-5 border-b border-${typeColor}-100 bg-${typeColor}-50/50 flex justify-between items-center`}>
            <div className="flex items-center gap-2 text-slate-800"><BarChart3 className={`w-5 h-5 text-${typeColor}-600`} /><h3 className="font-bold text-lg">{statsModal.type} Analysis</h3></div>
            <button onClick={() => setStatsModal({ isOpen: false, type: null })} className="p-1 rounded-full hover:bg-black/5 transition-colors text-slate-400 hover:text-slate-600"><X size={20} /></button>
          </div>
          <div className="p-8 max-h-[70vh] overflow-y-auto">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-6 text-center">Frequency by Category</p>
            {data.length > 0 ? (
              <div className="flex flex-row items-end justify-center gap-4 w-full h-64 px-4">
                {data.map((item, idx) => {
                  const percent = (item.count / maxCount) * 100;
                  const isHardware = statsModal.type === 'Hardware';
                  const barGradient = isHardware
                    ? "bg-gradient-to-t from-blue-500 to-cyan-400"
                    : "bg-gradient-to-t from-emerald-500 to-lime-400";

                  return (
                    <div key={idx} className="flex flex-col items-center gap-2 relative group h-full justify-end w-16">
                      <div className="relative w-full flex items-end justify-center h-full">
                        <div
                          className={`w-full rounded-t-lg ${barGradient} transition-all duration-1000 ease-out shadow-sm group-hover:shadow-md flex items-end justify-center`}
                          style={{ height: `${percent}%`, minHeight: '4px' }}
                        >
                          <span className="mb-2 text-[10px] font-bold text-white drop-shadow-sm">{item.count}</span>
                        </div>
                      </div>
                      <div className="text-center text-[10px] font-semibold text-slate-500 truncate w-full group-hover:text-slate-800 transition-colors" title={item.category}>
                        {item.category}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (<div className="text-center py-8 text-slate-400 italic">No {statsModal.type.toLowerCase()} issues recorded yet.</div>)}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-indigo-500" />
        <p className="animate-pulse font-medium">Loading System...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 flex items-center justify-center p-4 font-sans text-slate-800 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-300/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-300/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Main login card */}
        <div className="relative z-10 w-full max-w-md animate-fade-in">
          <div className="bg-white/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-10 relative overflow-hidden">
            {/* Subtle inner glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent rounded-3xl pointer-events-none"></div>

            <div className="relative z-10">
              {/* Logo Section */}
              <div className="text-center mb-8">
                <div className="inline-block mb-6">
                  <div className="w-24 h-24 mx-auto bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/50">
                    <img src="/logo.png" alt="Alaya Logo" className="w-full h-full object-contain" />
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-slate-800 mb-3">Alaya IT Workshop</h1>

              </div>

              {/* Welcome message */}
              <div className="text-center mb-8">
                <h2 className="text-xl font-semibold text-slate-700 mb-1">Welcome Back</h2>
                <p className="text-slate-500 text-sm">Please sign in to access the dashboard</p>
              </div>

              {/* Error message */}
              {errorMsg && (
                <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-xl text-sm text-red-700 flex items-start gap-3 animate-fade-in shadow-sm">
                  <AlertTriangle size={18} className="shrink-0 mt-0.5" /><span>{errorMsg}</span>
                </div>
              )}

              {/* Login form */}
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Email Address</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-white/50 backdrop-blur-sm border border-white/80 rounded-xl focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400 outline-none transition-all hover:bg-white/70 focus:bg-white/90 shadow-sm text-slate-800"
                      placeholder="staff@alaya.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-white/50 backdrop-blur-sm border border-white/80 rounded-xl focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400 outline-none transition-all hover:bg-white/70 focus:bg-white/90 shadow-sm text-slate-800"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 rounded-xl font-bold hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0 mt-6"
                >
                  {authLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <><Shield size={18} /> Sign In <ArrowRight size={18} /></>}
                </button>
              </form>

              {/* Footer */}
              <div className="text-center mt-8 text-xs text-slate-500">
                © 2025 Alaya Internal Tool
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800 relative">
      {showToast && (
        <div className="fixed top-6 right-6 z-50 bg-white border border-green-100 text-slate-800 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 animate-bounce-in">
          <div className="bg-green-100 p-2 rounded-full"><CheckCircle className="w-6 h-6 text-green-600" /></div>
          <div><h4 className="font-bold text-sm text-slate-900">Success</h4><p className="text-xs text-slate-500">Operation completed successfully.</p></div>
        </div>
      )}
      <StatsModal />
      <aside className={`fixed left-0 top-0 h-full bg-white border-r border-slate-200 shadow-xl z-50 flex flex-col transition-all duration-300 hidden md:flex ${isSidebarCollapsed ? 'w-20' : 'w-72'}`}>
        <div className={`p-6 border-b border-slate-100 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
              <img src="/logo.png" alt="Alaya" className="w-full h-full object-contain p-1.5" />
            </div>
            {!isSidebarCollapsed && (
              <div className="animate-fade-in">
                <h1 className="text-lg font-bold leading-tight text-slate-900">Alaya</h1>
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest bg-indigo-50 px-1.5 py-0.5 rounded">IT WORKSHOP</span>
              </div>
            )}
          </div>
          <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="absolute -right-3 top-8 bg-white border border-slate-200 p-1 rounded-full shadow-sm text-slate-400 hover:text-indigo-600 transition-colors">
            {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'list', icon: List, label: 'All Tickets' },
            { id: 'new', icon: PlusCircle, label: 'New Request' },
            { id: 'devices', icon: Monitor, label: 'Device Profiles' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => { setView(item.id); resetForm(); }}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-medium text-sm group relative ${view === item.id ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'} ${isSidebarCollapsed ? 'justify-center' : ''}`}
              title={isSidebarCollapsed ? item.label : ''}
            >
              <item.icon className={`w-5 h-5 ${view === item.id ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
              {!isSidebarCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className={`flex items-center gap-3 mb-4 ${isSidebarCollapsed ? 'justify-center' : 'px-2'}`}>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-md shrink-0">
              {user.email ? user.email[0].toUpperCase() : 'U'}
            </div>
            {!isSidebarCollapsed && (
              <div className="overflow-hidden animate-fade-in">
                <p className="text-xs font-semibold text-slate-800 truncate">{user.email}</p>
                <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Online
                </p>
              </div>
            )}
          </div>

          <div className={isSidebarCollapsed ? 'flex flex-col gap-2 items-center' : ''}>
            <button onClick={handleLogout} disabled={logoutLoading} className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-100 hover:bg-red-50 text-xs font-semibold transition-all disabled:opacity-50 ${isSidebarCollapsed ? 'w-9 h-9 p-0' : 'w-full'}`} title="Sign Out">
              {logoutLoading ? <Loader2 className="animate-spin w-3 h-3" /> : <LogOut size={16} />}
              {!isSidebarCollapsed && "Sign Out"}
            </button>

          </div>
        </div>
      </aside>

      <div className="md:hidden fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-slate-200 z-30 p-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-50 rounded-lg p-1.5 border border-indigo-100"><img src="/logo.png" alt="Alaya" className="w-full h-full object-contain" /></div>
          <div><h1 className="text-base font-bold text-slate-900 leading-none">Alaya</h1><span className="text-[10px] font-semibold text-indigo-500 uppercase tracking-wider">IT Workshop</span></div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setView('dashboard')} className="p-2 rounded-lg bg-slate-50 text-slate-600"><LayoutDashboard size={20} /></button>
          <button onClick={() => setView('list')} className="p-2 rounded-lg bg-slate-50 text-slate-600"><List size={20} /></button>
          <button onClick={() => setView('new')} className="p-2 rounded-lg bg-indigo-50 text-indigo-600"><PlusCircle size={20} /></button>
          <button onClick={() => setView('devices')} className="p-2 rounded-lg bg-slate-50 text-slate-600"><Monitor size={20} /></button>
          <button onClick={handleLogout} disabled={logoutLoading} className="p-2 rounded-lg bg-red-50 text-red-500">{logoutLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <LogOut size={20} />}</button>
        </div>
      </div>

      <main className={`flex-1 p-6 md:p-10 mt-20 md:mt-0 overflow-y-auto bg-slate-50 transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-72'}`}>
        {view === 'dashboard' && (
          <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h2>
                <p className="text-slate-500 text-sm mt-1">Monitor your service desk performance.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-indigo-500 flex items-center justify-between hover:shadow-md transition-shadow">
                <div><p className="text-sm font-medium text-slate-500">Total Requests</p><p className="text-3xl font-bold text-slate-800">{stats.total}</p></div>
                <div className="p-3 bg-indigo-100 rounded-lg text-indigo-600"><FileText className="w-8 h-8" /></div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500 flex items-center justify-between hover:shadow-md transition-shadow">
                <div><p className="text-sm font-medium text-slate-500">Critical Issues</p><p className="text-3xl font-bold text-slate-800">{stats.critical}</p></div>
                <div className="p-3 bg-red-100 rounded-lg text-red-600"><AlertCircle className="w-8 h-8" /></div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500 flex items-center justify-between hover:shadow-md transition-shadow">
                <div><p className="text-sm font-medium text-slate-500">Pending Maintenance</p><p className="text-3xl font-bold text-slate-800">{stats.working}</p></div>
                <div className="p-3 bg-yellow-100 rounded-lg text-yellow-600"><Clock className="w-8 h-8" /></div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500 flex items-center justify-between hover:shadow-md transition-shadow">
                <div><p className="text-sm font-medium text-slate-500">Repaired & Closed</p><p className="text-3xl font-bold text-slate-800">{stats.completed}</p></div>
                <div className="p-3 bg-green-100 rounded-lg text-green-600"><CheckCircle className="w-8 h-8" /></div>
              </div>
            </div >

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-full"><h3 className="text-lg font-bold text-slate-800 mb-2">Category Breakdown</h3><p className="text-sm text-slate-500 mb-4">Click cards to view detailed analysis</p></div>
                <div onClick={() => setStatsModal({ isOpen: true, type: 'Hardware' })} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between hover:border-blue-400 hover:ring-4 hover:ring-blue-50 transition-all cursor-pointer group relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500"><Monitor size={100} /></div>
                  <div className="relative z-10"><p className="text-sm font-medium text-slate-500 group-hover:text-blue-600 transition-colors">Hardware Issues</p><p className="text-3xl font-bold text-slate-900 mt-1">{stats.hardware}</p><p className="text-xs text-slate-400 mt-2 font-medium">Physical devices & peripherals</p></div>
                  <div className="p-4 bg-blue-50 rounded-xl text-blue-600 group-hover:scale-110 transition-transform relative z-10 shadow-sm border border-blue-100"><Monitor className="w-8 h-8" /></div>
                </div>
                <div onClick={() => setStatsModal({ isOpen: true, type: 'Software' })} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between hover:border-indigo-400 hover:ring-4 hover:ring-indigo-50 transition-all cursor-pointer group relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500"><Shield size={100} /></div>
                  <div className="relative z-10"><p className="text-sm font-medium text-slate-500 group-hover:text-indigo-600 transition-colors">Software Issues</p><p className="text-3xl font-bold text-slate-900 mt-1">{stats.software}</p><p className="text-xs text-slate-400 mt-2 font-medium">OS, Apps, & Licensing</p></div>
                  <div className="p-4 bg-indigo-50 rounded-xl text-indigo-600 group-hover:scale-110 transition-transform relative z-10 shadow-sm border border-indigo-100"><Shield className="w-8 h-8" /></div>
                </div>
              </div>
              <div className="lg:col-span-1"><DepartmentPieChart data={departmentData} /></div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-800">Recent Activity</h3>
                <div className="flex items-center gap-3">
                  <label htmlFor="dashboardTimeFilter" className="text-xs font-semibold text-slate-500 uppercase">Filter:</label>
                  <select
                    id="dashboardTimeFilter"
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value)}
                    className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  >
                    <option value="Today">Today</option>
                    <option value="This Week">This Week</option>
                    <option value="This Month">This Month</option>
                    <option value="This Year">This Year</option>
                    <option value="All Time">All Time</option>
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50/80 text-slate-800 font-bold border-b border-slate-200 uppercase tracking-wider text-xs">
                    <tr><th className="px-6 py-4">Ticket ID</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Device Info</th><th className="px-6 py-4">Requester</th><th className="px-6 py-4">Priority</th><th className="px-6 py-4">Issue Category</th><th className="px-6 py-4">Technician</th><th className="px-6 py-4">Timeline</th><th className="px-6 py-4 text-right">Actions</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTickets.slice(0, 5).map(ticket => (
                      <tr key={ticket.id} className={`transition-colors group ${ticket.isPinned ? 'bg-yellow-100/60 hover:bg-yellow-100/80' : 'hover:bg-slate-50/80'}`}>
                        <td className="px-6 py-4">
                          {ticket.ticketId ? <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">{ticket.ticketId}</span> : <span className="text-xs text-slate-400">-</span>}
                        </td>
                        <td className="px-6 py-4"><StatusBadge status={ticket.status} /></td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{ticket.serialNumber}</div>{ticket.deviceType !== 'N/A' && <div className="text-xs text-slate-500 flex items-center gap-1 mt-1"><Laptop size={10} /> {ticket.deviceType}</div>}
                        </td>
                        <td className="px-6 py-4"><div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">{ticket.requestingPerson ? ticket.requestingPerson[0] : 'U'}</div><div><span className="block text-slate-700 font-medium">{ticket.requestingPerson || 'Unknown'}</span><span className="text-xs text-slate-400">{ticket.department}</span></div></div></td>
                        <td className="px-6 py-4"><PriorityBadge priority={ticket.priority} /></td>
                        <td className="px-6 py-4"><div className="text-slate-800 font-medium flex items-center gap-2"><span className="p-1 bg-slate-100 rounded text-slate-500">{getCategoryIcon(ticket.issueCategory)}</span>{ticket.issueCategory || (ticket.issueType === 'Hardware' ? ticket.deviceType : 'Software Issue')}</div><div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mt-1 ml-8 flex items-center gap-1">{ticket.issueType === 'Hardware' ? <Monitor size={10} /> : <Shield size={10} />}{ticket.issueType}</div></td>
                        <td className="px-6 py-4"><span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full">{ticket.technician ? ticket.technician.split(' ')[0] : 'Unassigned'}</span></td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1 text-[10px]">
                            <div className="flex items-center gap-1 text-slate-500"><span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> Opened: <span className="font-medium text-slate-700">{ticket.dateCreated}</span></div>
                            {ticket.dateDamaged && <div className="flex items-center gap-1 text-slate-500"><span className="w-1.5 h-1.5 rounded-full bg-red-400"></span> Damaged: <span className="font-medium text-slate-700">{ticket.dateDamaged}</span></div>}
                            {ticket.dateSolved && <div className="flex items-center gap-1 text-slate-500"><span className="w-1.5 h-1.5 rounded-full bg-green-400"></span> Solved: <span className="font-medium text-slate-700">{ticket.dateSolved}</span></div>}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={(e) => togglePin(ticket.id, ticket.isPinned, e)} title={ticket.isPinned ? "Unpin" : "Pin"} className={`p-2 rounded-lg transition-colors ${ticket.isPinned ? "text-yellow-600 bg-yellow-100" : "text-slate-400 hover:text-yellow-500 hover:bg-yellow-50"}`}><Pin className={`w-4 h-4 ${ticket.isPinned ? "fill-current" : ""}`} /></button>
                            <button onClick={(e) => handleEditClick(ticket, e)} title="Edit Details" className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                            {['Repaired', 'Resolved'].includes(ticket.status) ? (
                              <button disabled className="p-2 text-slate-300 cursor-not-allowed" title="Already Complete"><CheckCircle className="w-4 h-4" /></button>
                            ) : (
                              <button onClick={(e) => markComplete(ticket.id, ticket.issueType, e)} title="Mark Complete" className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"><CheckCircle className="w-4 h-4" /></button>
                            )}

                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredTickets.length === 0 && <tr><td colSpan="9" className="px-6 py-12 text-center text-slate-400 font-medium">No tickets found matching your search.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="text-center text-slate-400 text-xs mt-4 pb-4">Manage and track all support requests efficiently.</div>
          </div >
        )
        }

        {/* --- NEW/EDIT TICKET VIEW --- */}
        {
          view === 'new' && (
            <div className="max-w-4xl mx-auto animate-fade-in pb-10">
              <div className="flex items-center justify-between mb-8">
                <div><h2 className="text-3xl font-bold text-slate-900">{editingId ? 'Update Ticket' : 'New Request'}</h2><p className="text-slate-500 mt-1">Fill in the details below to track the service request.</p></div>
                <button onClick={() => { setView('list'); resetForm(); }} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"><X size={24} /></button>
              </div>

              <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Technician</label><select required name="technician" value={formData.technician} onChange={handleInputChange} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all">{TECHNICIANS.map(tech => <option key={tech} value={tech}>{tech}</option>)}</select></div>
                  <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Requester Department</label><select name="department" value={formData.department} onChange={handleInputChange} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all">{DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}</select></div>
                  <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Requester Name</label><input required name="requestingPerson" value={formData.requestingPerson} onChange={handleInputChange} type="text" className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" placeholder="e.g. Otto Dargan" /></div>
                </div>

                <div className="border-t border-slate-100 pt-8">
                  <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-600"><AlertCircle size={18} /></div> Classification</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="md:col-span-1"><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Issue Type</label><select name="issueType" value={formData.issueType} onChange={handleInputChange} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"><option value="Hardware">Hardware</option><option value="Software">Software</option></select></div>

                    <div className="md:col-span-1"><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Priority</label><select name="priority" value={formData.priority} onChange={handleInputChange} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"><option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option></select></div>

                    {formData.issueType === 'Software' ? (
                      <div className="md:col-span-1 animate-fade-in"><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Target Software</label><select name="issueCategory" value={formData.issueCategory} onChange={handleInputChange} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all">{SOFTWARE_CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
                    ) : (
                      <div className="md:col-span-1 animate-fade-in"><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">Target Device</label><select name="deviceType" value={formData.deviceType} onChange={handleInputChange} className="w-full p-3 border border-slate-200 rounded-xl bg-indigo-50/50 focus:bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-indigo-900 font-medium">{DEVICE_TYPES.map(dt => <option key={dt} value={dt}>{dt}</option>)}</select></div>
                    )}

                    {formData.issueType === 'Hardware' && (
                      <div className="md:col-span-1 animate-fade-in"><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Serial Number</label><input required name="serialNumber" value={formData.serialNumber} onChange={handleInputChange} type="text" className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono text-sm" placeholder="e.g. SN-1234-XYZ" /></div>
                    )}

                    {/* Specific Category for Hardware: Explicitly HIDDEN/REMOVED per request */}

                    <div className="col-span-full"><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description / Notes</label><textarea name="description" value={formData.description} onChange={handleInputChange} className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 h-32 resize-none transition-all" placeholder="Describe the issue in detail..." /></div>
                  </div>
                </div>

                <div className={`border-t border-slate-100 pt-8`}>
                  <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><div className={`p-1.5 rounded-lg ${formData.issueType === 'Hardware' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>{formData.issueType === 'Hardware' ? <Cpu size={18} /> : <Shield size={18} />}</div>Status</h3>
                  <div className="mb-4"><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Current Status</label><select name="status" value={formData.status} onChange={handleInputChange} className="w-full md:w-1/2 p-3 border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium">{formData.issueType === 'Hardware' ? (<><option value="Pending">Pending Maintenance</option><option value="Damaged">Damaged</option><option value="Repaired">Repaired</option></>) : (<><option value="Open">Open (New Issue)</option><option value="In Progress">In Progress (Debugging)</option><option value="Resolved">Resolved (Fixed)</option></>)}</select></div>
                </div>

                <div className="border-t border-slate-100 pt-8">
                  <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg"><UserCheck size={18} /></div> Handover Details</h3>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <p className="text-xs text-slate-500 mb-4 font-medium">Fill this section only when the device is ready to be returned.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Receiver Name</label><input name="receiverName" value={formData.receiverName} onChange={handleInputChange} type="text" className="w-full p-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" placeholder="Received by..." /></div>
                      <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Receiver Dept</label><select name="receiverDept" value={formData.receiverDept} onChange={handleInputChange} className="w-full p-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"><option value="">Select Department...</option>{DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}</select></div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4 pb-2">
                  {editingId && ['Open', 'Pending'].includes(formData.status) && (
                    <button type="button" onClick={(e) => deleteTicket(editingId, e)} className="px-6 py-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-medium transition-all flex items-center gap-2">
                      <Trash2 className="w-4 h-4" /> Delete Ticket
                    </button>
                  )}
                  <button type="button" onClick={() => { setView('list'); resetForm(); }} className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium transition-all">Cancel</button>
                  <button type="submit" className="px-8 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 flex items-center gap-2 transition-transform active:scale-95"><Save className="w-5 h-5" /> {editingId ? 'Update Record' : 'Save Record'}</button>
                </div>
              </form>
            </div>
          )
        }

        {/* --- LIST VIEW --- */}
        {
          view === 'list' && (
            <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div><h2 className="text-2xl font-bold text-slate-900">All Service Tickets <span className="text-sm font-medium text-slate-500 ml-2 bg-slate-100 px-2 py-1 rounded-full">({filteredTickets.length})</span></h2>
                  <p className="text-slate-500 text-sm mt-1">Filter and search through all tickets</p>
                </div>
                <button onClick={exportCSV} className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/30">
                  <Download className="w-4 h-4" /> Export CSV
                </button>
              </div>

              {/* Time Filter Buttons */}
              <div className="flex flex-wrap items-center gap-2 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <Calendar className="w-5 h-5 text-slate-400" />
                <span className="text-sm font-semibold text-slate-600 mr-2">Time Period:</span>
                {['Today', 'This Week', 'This Month', 'This Year', 'All Time'].map(filter => (
                  <button
                    key={filter}
                    onClick={() => setTimeFilter(filter)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${timeFilter === filter
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by ticket ID, serial number, person name, category..."
                  className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm bg-white"
                />
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50/80 text-slate-800 font-bold border-b border-slate-200 uppercase tracking-wider text-xs">
                      <tr><th className="px-6 py-4">Ticket ID</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Device Info</th><th className="px-6 py-4">Requester</th><th className="px-6 py-4">Priority</th><th className="px-6 py-4">Issue Category</th><th className="px-6 py-4">Technician</th><th className="px-6 py-4">Timeline</th><th className="px-6 py-4 text-right">Actions</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedTickets.map((ticket) => (
                        <tr key={ticket.id} className={`transition-colors group ${ticket.isPinned ? 'bg-yellow-100/60 hover:bg-yellow-100/80' : 'hover:bg-slate-50/80'}`}>
                          <td className="px-6 py-4">
                            {ticket.ticketId && <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md inline-block">{ticket.ticketId}</div>}
                          </td>
                          <td className="px-6 py-4"><StatusBadge status={ticket.status} /></td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{ticket.serialNumber}</div>{ticket.deviceType !== 'N/A' && <div className="text-xs text-slate-500 flex items-center gap-1 mt-1"><Laptop size={10} /> {ticket.deviceType}</div>}
                          </td>
                          <td className="px-6 py-4"><div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">{ticket.requestingPerson ? ticket.requestingPerson[0] : 'U'}</div><div><span className="block text-slate-700 font-medium">{ticket.requestingPerson || 'Unknown'}</span><span className="text-xs text-slate-400">{ticket.department}</span></div></div></td>
                          <td className="px-6 py-4"><PriorityBadge priority={ticket.priority} /></td>
                          <td className="px-6 py-4"><div className="text-slate-800 font-medium flex items-center gap-2"><span className="p-1 bg-slate-100 rounded text-slate-500">{getCategoryIcon(ticket.issueCategory)}</span>{ticket.issueCategory || (ticket.issueType === 'Hardware' ? ticket.deviceType : 'Software Issue')}</div><div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mt-1 ml-8 flex items-center gap-1">{ticket.issueType === 'Hardware' ? <Monitor size={10} /> : <Shield size={10} />}{ticket.issueType}</div></td>
                          <td className="px-6 py-4"><span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full">{ticket.technician ? ticket.technician.split(' ')[0] : 'Unassigned'}</span></td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1 text-[10px]">
                              <div className="flex items-center gap-1 text-slate-500"><span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> Opened: <span className="font-medium text-slate-700">{ticket.dateCreated}</span></div>
                              {ticket.dateDamaged && <div className="flex items-center gap-1 text-slate-500"><span className="w-1.5 h-1.5 rounded-full bg-red-400"></span> Damaged: <span className="font-medium text-slate-700">{ticket.dateDamaged}</span></div>}
                              {ticket.dateSolved && <div className="flex items-center gap-1 text-slate-500"><span className="w-1.5 h-1.5 rounded-full bg-green-400"></span> Solved: <span className="font-medium text-slate-700">{ticket.dateSolved}</span></div>}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={(e) => togglePin(ticket.id, ticket.isPinned, e)} title={ticket.isPinned ? "Unpin" : "Pin"} className={`p-2 rounded-lg transition-colors ${ticket.isPinned ? "text-yellow-600 bg-yellow-100" : "text-slate-400 hover:text-yellow-500 hover:bg-yellow-50"}`}><Pin className={`w-4 h-4 ${ticket.isPinned ? "fill-current" : ""}`} /></button>
                              <button onClick={(e) => handleEditClick(ticket, e)} title="Edit Details" className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                              {['Repaired', 'Resolved'].includes(ticket.status) ? (
                                <button disabled className="p-2 text-slate-300 cursor-not-allowed" title="Already Complete"><CheckCircle className="w-4 h-4" /></button>
                              ) : (
                                <button onClick={(e) => markComplete(ticket.id, ticket.issueType, e)} title="Mark Complete" className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"><CheckCircle className="w-4 h-4" /></button>
                              )}

                            </div>
                          </td>
                        </tr>
                      ))}
                      {paginatedTickets.length === 0 && <tr><td colSpan="9" className="px-6 py-12 text-center text-slate-400 font-medium">No tickets found matching your search.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between p-4 border-t border-slate-200 bg-white rounded-b-2xl gap-4">
                <div className="text-slate-500 text-sm flex flex-col md:flex-row gap-1 md:gap-4 items-center">
                  <span>Showing <span className="font-bold text-slate-800">{Math.min(startIndex + 1, filteredTickets.length)}</span> to <span className="font-bold text-slate-800">{Math.min(startIndex + itemsPerPage, filteredTickets.length)}</span> of <span className="font-bold text-slate-800">{filteredTickets.length}</span> entries</span>
                  <span className="hidden md:inline text-slate-300">|</span>
                  <span className="italic">Manage and track all support requests efficiently.</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="text-sm font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    Page {currentPage} of {Math.max(1, totalPages)}
                  </span>
                  <button
                    onClick={nextPage}
                    disabled={currentPage >= totalPages}
                    className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          )
        }

        {/* --- DEVICES VIEW --- */}
        {
          view === 'devices' && (
            <div className="max-w-7xl mx-auto">
              <DeviceManagement user={user} db={db} appId={appId} initialDeviceId={initialDeviceId} />
            </div>
          )
        }
      </main >

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes bounceIn { 0% { transform: scale(0.9); opacity: 0; } 60% { transform: scale(1.05); opacity: 1; } 100% { transform: scale(1); } }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        .animate-bounce-in { animation: bounceIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
      `}</style>
    </div >
  );
}
