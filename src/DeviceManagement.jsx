// Device Management Component
// This file contains all device-related functionality including search, profiles, and history

import React, { useState, useEffect } from 'react';
import {
    Package,
    Search,
    Monitor,
    Laptop,
    Mouse,
    Printer,
    Headphones,
    Wifi,
    Edit,
    Trash2,
    History,
    ArrowLeft,
    PlusCircle,
    Loader2,
    AlertCircle,
    CheckCircle,
    Clock,
    User,
    Calendar,
    Shield,
    QrCode,
    X
} from 'lucide-react';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import {
    getFirestore,
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    orderBy
} from 'firebase/firestore';

const DEVICE_TYPES = [
    "Laptop", "Mouse", "Keyboard", "Headphone", "LAN", "Wifi/Router", "Monitor", "Printer", "Other"
];

const DEVICE_STATUS = ["Active", "Damaged", "Retired", "Under Repair"];

const DEPARTMENTS = [
    "L&D", "Admin", "IT", "LPA", "LPS", "Outsourcing", "Developer", "CA", "Marketing", "Broker"
];

export const DeviceManagement = ({ user, db, appId, initialDeviceId }) => {
    const [devices, setDevices] = useState([]);
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [deviceHistory, setDeviceHistory] = useState([]);
    const [relatedTickets, setRelatedTickets] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [showAddDevice, setShowAddDevice] = useState(false);
    const [showQrModal, setShowQrModal] = useState(false);
    const [editingDevice, setEditingDevice] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [activeTab, setActiveTab] = useState('specs');

    const [deviceForm, setDeviceForm] = useState({
        serialNumber: '',
        deviceType: DEVICE_TYPES[0],
        manufacturer: '',
        model: '',
        assignedTo: '',
        department: DEPARTMENTS[0],
        purchaseDate: '',
        status: 'Active'
    });

    // Load devices from Firebase
    useEffect(() => {
        if (!user) return;
        const devicesCollection = collection(db, 'artifacts', appId, 'public', 'data', 'devices');
        const unsubscribe = onSnapshot(devicesCollection, (snapshot) => {
            const fetchedDevices = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            fetchedDevices.sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));
            setDevices(fetchedDevices);
            setLoading(false);
        }, (err) => {
            console.error("Error loading devices:", err);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [user, db, appId]);

    // Load history for selected device
    useEffect(() => {
        if (!selectedDevice || !user) return;
        const historyCollection = collection(db, 'artifacts', appId, 'public', 'data', 'devices', selectedDevice.id, 'history');
        const historyQuery = query(historyCollection, orderBy('timestamp', 'desc'));

        const unsubscribe = onSnapshot(historyQuery, (snapshot) => {
            const history = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setDeviceHistory(history);
        });
        return () => unsubscribe();
    }, [selectedDevice, user, db, appId]);

    // Handle deep linking
    useEffect(() => {
        if (initialDeviceId && devices.length > 0) {
            const device = devices.find(d => d.id === initialDeviceId);
            if (device) {
                setSelectedDevice(device);
            }
        }
    }, [initialDeviceId, devices]);

    // Load related tickets for selected device
    useEffect(() => {
        if (!selectedDevice || !user) return;
        const ticketsCollection = collection(db, 'artifacts', appId, 'public', 'data', 'tickets');
        const unsubscribe = onSnapshot(ticketsCollection, (snapshot) => {
            const allTickets = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            // Filter tickets that match this device's serial number
            const related = allTickets.filter(t => t.serialNumber === selectedDevice.serialNumber);
            setRelatedTickets(related);
        });
        return () => unsubscribe();
    }, [selectedDevice, user, db, appId]);

    const addHistoryEntry = async (deviceId, changeType, changedFields) => {
        try {
            const historyCollection = collection(db, 'artifacts', appId, 'public', 'data', 'devices', deviceId, 'history');
            await addDoc(historyCollection, {
                timestamp: new Date().toISOString(),
                changeType,
                changedBy: user.email,
                ...changedFields
            });
        } catch (err) {
            console.error("Error adding history:", err);
        }
    };

    const handleAddDevice = async (e) => {
        e.preventDefault();
        if (!user) return;

        try {
            const devicesCollection = collection(db, 'artifacts', appId, 'public', 'data', 'devices');
            const newDevice = {
                ...deviceForm,
                dateCreated: new Date().toISOString(),
                lastModified: new Date().toISOString()
            };

            const docRef = await addDoc(devicesCollection, newDevice);

            // Add creation history
            await addHistoryEntry(docRef.id, 'Created', {
                description: `Device ${deviceForm.serialNumber} created`
            });

            resetDeviceForm();
            setShowAddDevice(false);
        } catch (err) {
            console.error("Error adding device:", err);
            alert(`Failed to add device: ${err.message}`);
        }
    };

    const handleUpdateDevice = async (e) => {
        e.preventDefault();
        console.log("Updating device...", editingDevice, deviceForm);
        if (!user || !editingDevice) {
            console.error("Missing user or editingDevice");
            return;
        }

        try {
            const deviceRef = doc(db, 'artifacts', appId, 'public', 'data', 'devices', editingDevice.id);
            const changes = {};
            const historyEntries = [];

            // Track changes
            Object.keys(deviceForm).forEach(key => {
                if (deviceForm[key] !== editingDevice[key]) {
                    changes[key] = deviceForm[key];
                    historyEntries.push({
                        fieldChanged: key,
                        oldValue: editingDevice[key] || 'N/A',
                        newValue: deviceForm[key],
                        description: `${key} changed from "${editingDevice[key] || 'N/A'}" to "${deviceForm[key]}"`
                    });
                }
            });

            console.log("Changes detected:", changes);

            if (Object.keys(changes).length > 0) {
                await updateDoc(deviceRef, {
                    ...changes,
                    lastModified: new Date().toISOString()
                });

                // Add history for each change
                for (const entry of historyEntries) {
                    await addHistoryEntry(editingDevice.id, 'Updated', entry);
                }
            } else {
                console.log("No changes to save.");
            }

            setEditingDevice(null);
            setShowAddDevice(false);
            if (selectedDevice && selectedDevice.id === editingDevice.id) {
                setSelectedDevice({ ...selectedDevice, ...changes });
            }
            resetDeviceForm();
        } catch (err) {
            console.error("Error updating device:", err);
            alert(`Failed to update device: ${err.message}`);
        }
    };

    const handleDeleteDevice = async (deviceId) => {
        if (!confirm("Are you sure you want to delete this device? This cannot be undone.")) return;

        setDeletingId(deviceId);
        try {
            await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'devices', deviceId));
            if (selectedDevice && selectedDevice.id === deviceId) {
                setSelectedDevice(null);
            }
        } catch (err) {
            console.error("Error deleting device:", err);
            alert(`Failed to delete: ${err.message}`);
        } finally {
            setDeletingId(null);
        }
    };

    const resetDeviceForm = () => {
        setDeviceForm({
            serialNumber: '',
            deviceType: DEVICE_TYPES[0],
            manufacturer: '',
            model: '',
            assignedTo: '',
            department: DEPARTMENTS[0],
            purchaseDate: '',
            status: 'Active'
        });
    };

    const handleEditClick = (device) => {
        setEditingDevice(device);
        setDeviceForm(device);
        setShowAddDevice(true);
    };

    const filteredDevices = devices.filter(device => {
        const searchLower = searchTerm.toLowerCase();
        return (
            (device.serialNumber || '').toLowerCase().includes(searchLower) ||
            (device.deviceType || '').toLowerCase().includes(searchLower) ||
            (device.assignedTo || '').toLowerCase().includes(searchLower) ||
            (device.department || '').toLowerCase().includes(searchLower) ||
            (device.manufacturer || '').toLowerCase().includes(searchLower) ||
            (device.model || '').toLowerCase().includes(searchLower)
        );
    });

    const getDeviceIcon = (type) => {
        switch (type) {
            case 'Laptop': return <Laptop className="w-6 h-6" />;
            case 'Mouse': return <Mouse className="w-6 h-6" />;
            case 'Monitor': return <Monitor className="w-6 h-6" />;
            case 'Printer': return <Printer className="w-6 h-6" />;
            case 'Headphone': return <Headphones className="w-6 h-6" />;
            case 'Wifi/Router': return <Wifi className="w-6 h-6" />;
            default: return <Package className="w-6 h-6" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Active': return 'bg-green-50 text-green-700 ring-1 ring-green-600/10';
            case 'Damaged': return 'bg-red-50 text-red-700 ring-1 ring-red-600/10';
            case 'Under Repair': return 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/10';
            case 'Retired': return 'bg-slate-50 text-slate-700 ring-1 ring-slate-600/10';
            default: return 'bg-gray-100 ring-1 ring-gray-200';
        }
    };

    const getChangeIcon = (changeType) => {
        switch (changeType) {
            case 'Created': return <PlusCircle className="w-4 h-4 text-green-600" />;
            case 'Updated': return <Edit className="w-4 h-4 text-blue-600" />;
            case 'Ticket Created': return <AlertCircle className="w-4 h-4 text-orange-600" />;
            case 'Ticket Resolved': return <CheckCircle className="w-4 h-4 text-emerald-600" />;
            default: return <History className="w-4 h-4 text-slate-400" />;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
            </div>
        );
    }

    // Add/Edit Device Form
    if (showAddDevice) {
        return (
            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => {
                            setShowAddDevice(false);
                            setEditingDevice(null);
                            resetDeviceForm();
                        }}
                        className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-2xl font-bold text-slate-900">
                        {editingDevice ? 'Edit Device' : 'Add New Device'}
                    </h2>
                </div>

                <form onSubmit={editingDevice ? handleUpdateDevice : handleAddDevice} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Serial Number *</label>
                            <input
                                type="text"
                                required
                                value={deviceForm.serialNumber}
                                onChange={(e) => setDeviceForm({ ...deviceForm, serialNumber: e.target.value })}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="e.g., LAPTOP-001"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Device Type *</label>
                            <select
                                value={deviceForm.deviceType}
                                onChange={(e) => setDeviceForm({ ...deviceForm, deviceType: e.target.value })}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                {DEVICE_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Manufacturer</label>
                            <input
                                type="text"
                                value={deviceForm.manufacturer}
                                onChange={(e) => setDeviceForm({ ...deviceForm, manufacturer: e.target.value })}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="e.g., Dell, HP, Logitech"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Model</label>
                            <input
                                type="text"
                                value={deviceForm.model}
                                onChange={(e) => setDeviceForm({ ...deviceForm, model: e.target.value })}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="e.g., Latitude 5420"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Assigned To</label>
                            <input
                                type="text"
                                value={deviceForm.assignedTo}
                                onChange={(e) => setDeviceForm({ ...deviceForm, assignedTo: e.target.value })}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="Employee name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Department *</label>
                            <select
                                value={deviceForm.department}
                                onChange={(e) => setDeviceForm({ ...deviceForm, department: e.target.value })}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Purchase Date</label>
                            <input
                                type="date"
                                value={deviceForm.purchaseDate}
                                onChange={(e) => setDeviceForm({ ...deviceForm, purchaseDate: e.target.value })}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Status *</label>
                            <select
                                value={deviceForm.status}
                                onChange={(e) => setDeviceForm({ ...deviceForm, status: e.target.value })}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                {DEVICE_STATUS.map(status => <option key={status} value={status}>{status}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-8">
                        <button
                            type="submit"
                            className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30"
                        >
                            {editingDevice ? 'Update Device' : 'Add Device'}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setShowAddDevice(false);
                                setEditingDevice(null);
                                resetDeviceForm();
                            }}
                            className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    // Device Profile View
    if (selectedDevice) {
        return (
            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setSelectedDevice(null)}
                        className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-2xl font-bold text-slate-900">Device Profile</h2>
                </div>

                {/* Device Info Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-indigo-50 rounded-xl text-indigo-600">
                                {getDeviceIcon(selectedDevice.deviceType)}
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900">{selectedDevice.serialNumber}</h3>
                                <p className="text-slate-500">{selectedDevice.deviceType}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleEditClick(selectedDevice)}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                            >
                                <Edit className="w-4 h-4" />
                                Edit
                            </button>
                            <button
                                onClick={() => setShowQrModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                            >
                                <QrCode className="w-4 h-4" />
                                Asset Tag
                            </button>
                            <button
                                onClick={() => handleDeleteDevice(selectedDevice.id)}
                                disabled={deletingId === selectedDevice.id}
                                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                            >
                                {deletingId === selectedDevice.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                Delete
                            </button>
                        </div>
                    </div>

                    {/* Tabs Navigation */}
                    <div className="flex border-b border-slate-200 mb-6">
                        <button
                            onClick={() => setActiveTab('specs')}
                            className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === 'specs' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Specifications
                            {activeTab === 'specs' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></div>}
                        </button>
                        <button
                            onClick={() => setActiveTab('tickets')}
                            className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === 'tickets' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Tickets <span className="ml-1.5 bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs">{relatedTickets.length}</span>
                            {activeTab === 'tickets' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></div>}
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === 'history' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            History
                            {activeTab === 'history' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></div>}
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 min-h-[400px]">
                        {activeTab === 'specs' && (
                            <div className="animate-fade-in">
                                <h4 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                    <Monitor className="w-5 h-5 text-indigo-500" />
                                    Device Specifications
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                    <div>
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Status</p>
                                        <span className={`inline-block px-3 py-1 rounded-md text-sm font-medium ${getStatusColor(selectedDevice.status)}`}>
                                            {selectedDevice.status}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Assigned To</p>
                                        <p className="text-slate-800 font-medium text-lg">{selectedDevice.assignedTo || 'Unassigned'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Department</p>
                                        <p className="text-slate-800 font-medium">{selectedDevice.department}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Purchase Date</p>
                                        <p className="text-slate-800 font-medium">{selectedDevice.purchaseDate || 'N/A'}</p>
                                    </div>
                                    {selectedDevice.manufacturer && (
                                        <div>
                                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Manufacturer</p>
                                            <p className="text-slate-800 font-medium">{selectedDevice.manufacturer}</p>
                                        </div>
                                    )}
                                    {selectedDevice.model && (
                                        <div>
                                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Model</p>
                                            <p className="text-slate-800 font-medium">{selectedDevice.model}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'tickets' && (
                            <div className="animate-fade-in">
                                <h4 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-indigo-500" />
                                    Related Tickets
                                </h4>
                                {relatedTickets.length > 0 ? (
                                    <div className="space-y-3">
                                        {relatedTickets.map(ticket => (
                                            <div key={ticket.id} className="flex items-start justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors border border-slate-100">
                                                <div className="flex-1">
                                                    {ticket.ticketId && (
                                                        <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md mb-2 inline-block">
                                                            {ticket.ticketId}
                                                        </div>
                                                    )}
                                                    <p className="font-semibold text-slate-800">{ticket.issueCategory || ticket.issueType}</p>
                                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                        <span className="text-xs text-slate-500 flex items-center gap-1"><Calendar size={12} /> {ticket.dateCreated}</span>
                                                        <span className="text-slate-300">•</span>
                                                        <span className="text-xs text-slate-500 flex items-center gap-1"><User size={12} /> {ticket.technician}</span>
                                                    </div>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${ticket.status === 'Repaired' || ticket.status === 'Resolved'
                                                    ? 'bg-green-50 text-green-700 ring-1 ring-green-600/10'
                                                    : 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/10'
                                                    }`}>
                                                    {ticket.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                        <Shield className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                        <p className="text-slate-500 font-medium">No tickets found for this device</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'history' && (
                            <div className="animate-fade-in">
                                <h4 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                    <History className="w-5 h-5 text-indigo-500" />
                                    Change History
                                </h4>
                                {deviceHistory.length > 0 ? (
                                    <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                                        {deviceHistory.map(entry => (
                                            <div key={entry.id} className="relative pl-8">
                                                <div className="absolute left-0 top-1 w-4.5 h-4.5 rounded-full bg-white border-2 border-indigo-100 flex items-center justify-center">
                                                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                                </div>
                                                <div className="flex items-start justify-between mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-slate-800">{entry.changeType}</span>
                                                        {getChangeIcon(entry.changeType)}
                                                    </div>
                                                    <span className="text-xs text-slate-400 font-mono">{new Date(entry.timestamp).toLocaleString()}</span>
                                                </div>
                                                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">{entry.description}</p>
                                                {entry.fieldChanged && (
                                                    <p className="text-xs text-slate-500 mt-2 ml-1">
                                                        <span className="font-medium text-slate-700">{entry.fieldChanged.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span> <span className="line-through text-slate-400">{entry.oldValue}</span> <span className="text-slate-400">→</span> <span className="text-indigo-600 font-medium">{entry.newValue}</span>
                                                    </p>
                                                )}
                                                <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1"><User size={10} /> {entry.changedBy}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                        <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                        <p className="text-slate-500 font-medium">No history available</p>
                                    </div>
                                )}
                            </div>
                        )}
                        {showQrModal && (
                            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                                <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
                                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                            <QrCode className="w-5 h-5 text-indigo-600" />
                                            Asset Tag
                                        </h3>
                                        <button
                                            onClick={() => setShowQrModal(false)}
                                            className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="p-8 flex flex-col items-center text-center" id="printable-qr">
                                        <div className="bg-white p-4 rounded-xl border-2 border-slate-900 mb-4">
                                            <QRCode
                                                value={`${window.location.origin}/?deviceId=${selectedDevice.id}`}
                                                size={180}
                                                level={"H"}
                                                includeMargin={true}
                                            />
                                        </div>
                                        <h4 className="text-xl font-bold text-slate-900 mb-1">{selectedDevice.serialNumber}</h4>
                                        <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-6">{selectedDevice.model || selectedDevice.deviceType}</p>

                                        <div className="w-full flex gap-3">
                                            <button
                                                onClick={() => {
                                                    const printContent = document.getElementById('printable-qr');
                                                    const win = window.open('', '', 'height=500,width=500');
                                                    win.document.write('<html><head><title>Asset Tag - ' + selectedDevice.serialNumber + '</title>');
                                                    win.document.write('<script src="https://cdn.tailwindcss.com"></script>');
                                                    win.document.write('</head><body class="flex flex-col items-center justify-center h-screen">');
                                                    win.document.write(printContent.innerHTML);
                                                    win.document.write('</body></html>');
                                                    win.document.close();
                                                    win.print();
                                                }}
                                                className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30"
                                            >
                                                Print Tag
                                            </button>
                                            <button
                                                onClick={() => setShowQrModal(false)}
                                                className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
                                            >
                                                Close
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Device List View
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Package className="w-7 h-7 text-indigo-600" />
                        Device Profiles
                        <span className="text-sm font-medium text-slate-500 ml-2 bg-slate-100 px-3 py-1 rounded-full">
                            ({filteredDevices.length})
                        </span>
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">Manage and track all devices</p>
                </div>
                <button
                    onClick={() => setShowAddDevice(true)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30"
                >
                    <PlusCircle className="w-4 h-4" />
                    Add Device
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by serial number, type, assigned user, department..."
                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                />
            </div>

            {/* Device Grid */}
            {filteredDevices.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDevices.map(device => (
                        <div
                            key={device.id}
                            onClick={() => setSelectedDevice(device)}
                            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                                        {getDeviceIcon(device.deviceType)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                            {device.serialNumber}
                                        </h3>
                                        <p className="text-xs text-slate-500">{device.deviceType}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Assigned:</span>
                                    <span className="font-medium text-slate-800">{device.assignedTo || 'Unassigned'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Department:</span>
                                    <span className="font-medium text-slate-800">{device.department}</span>
                                </div>
                                <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100">
                                    <span className="text-slate-500">Status:</span>
                                    <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${getStatusColor(device.status)}`}>
                                        {device.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
                    <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-400 font-medium">
                        {searchTerm ? 'No devices found matching your search' : 'No devices added yet'}
                    </p>
                    {!searchTerm && (
                        <button
                            onClick={() => setShowAddDevice(true)}
                            className="mt-4 inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold"
                        >
                            <PlusCircle className="w-4 h-4" />
                            Add your first device
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};
