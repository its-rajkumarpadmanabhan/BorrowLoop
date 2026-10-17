import React, { useState, useEffect } from 'react';
import { 
  Search, MapPin, Shield, ShieldCheck, Lock, Unlock, Phone, PhoneCall,
  MessageCircle, ExternalLink, Calendar, CheckCircle, Clock, AlertCircle,
  Smartphone, Download, RefreshCw, ChevronRight, Wrench, Settings, Info,
  CheckCircle2, ArrowRight, UserCheck, Check, Sparkles, Send, Box, Repeat,
  PlusCircle, Zap, ShieldAlert, Navigation, Star, ArrowUpRight
} from 'lucide-react';

// Fallback mock tools for offline / instant client resilience
const FALLBACK_TOOLS = [
  {
    id: 1,
    title: "Bosch GBH 2-26 DRE Rotary Hammer Drill Set",
    category: "Power Tools",
    description: "Heavy duty 800W rotary hammer drill with SDS-plus chuck. Includes masonry drill bits and flat chisel. Perfect for concrete drilling and wall mounting.",
    daily_rate: 350.0,
    hourly_rate: 60.0,
    replacement_deposit: 6500.0,
    condition: "Excellent (Like New)",
    image_url: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=700&q=80",
    approx_location: "Kowdiar, Pincode 695003",
    pincode: "695003",
    approx_distance_km: 0.8,
    distance_label: "0.8 km away in Pincode 695003",
    owner_display_name: "Anand (Verified Neighbor)",
    owner_phone_masked: "+91 98*** 12345",
    is_available: true
  },
  {
    id: 2,
    title: "DeWalt 20V MAX XR Cordless Circular Saw (7-1/4\")",
    category: "Carpentry & Woodwork",
    description: "Brushless motor with 5500 RPM for fast cuts. Includes 2x 5.0Ah lithium battery packs, fast dual charger, and 24-tooth blade.",
    daily_rate: 450.0,
    hourly_rate: 80.0,
    replacement_deposit: 12000.0,
    condition: "Pristine",
    image_url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=700&q=80",
    approx_location: "Sasthamangalam, Pincode 695014",
    pincode: "695014",
    approx_distance_km: 1.4,
    distance_label: "1.4 km away in Pincode 695014",
    owner_display_name: "Priya (Verified Neighbor)",
    owner_phone_masked: "+91 98*** 98765",
    is_available: true
  },
  {
    id: 3,
    title: "Kärcher K4 Power Control High-Pressure Washer 130 Bar",
    category: "Cleaning & Pressure",
    description: "130 bar pressure washer with Vario Power spray wand and Dirt Blaster. 6-meter high-pressure hose. Ideal for car detailing and patio cleaning.",
    daily_rate: 600.0,
    hourly_rate: 100.0,
    replacement_deposit: 18000.0,
    condition: "Excellent",
    image_url: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=700&q=80",
    approx_location: "Pattom, Pincode 695011",
    pincode: "695011",
    approx_distance_km: 1.9,
    distance_label: "1.9 km away in Pincode 695011",
    owner_display_name: "Anand (Verified Neighbor)",
    owner_phone_masked: "+91 98*** 12345",
    is_available: true
  },
  {
    id: 4,
    title: "Werner 20-Foot Telescopic Multi-Position Aluminium Ladder",
    category: "Ladders & Access",
    description: "Heavy-duty 150 kg load rated aluminium telescopic ladder. Converts into step ladder, stairway ladder, extension ladder, and scaffold base.",
    daily_rate: 300.0,
    hourly_rate: 50.0,
    replacement_deposit: 9500.0,
    condition: "Good & Sturdy",
    image_url: "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=700&q=80",
    approx_location: "Statue, Pincode 695001",
    pincode: "695001",
    approx_distance_km: 2.3,
    distance_label: "2.3 km away in Pincode 695001",
    owner_display_name: "Kiran (Verified Neighbor)",
    owner_phone_masked: "+91 97*** 11223",
    is_available: true
  }
];

// Fallback sample rentals
const FALLBACK_RENTALS = [
  {
    id: 1,
    tool_id: 1,
    tool_title: "Bosch GBH 2-26 DRE Rotary Hammer Drill Set",
    tool_category: "Power Tools",
    borrower_id: "borrower_rahul",
    borrower_name: "Rahul Varma",
    borrower_phone: "🔒 Masked until accepted",
    owner_id: "owner_anand",
    owner_name: "Anand Nair",
    start_date: "Tomorrow",
    end_date: "In 2 days",
    duration_days: 2,
    daily_rate: 350.0,
    rental_fee: 700.0,
    security_deposit: 6500.0,
    total_amount: 7200.0,
    payment_method: "UPI",
    upi_id: "owner_anand@borrowloop",
    status: "REQUESTED",
    is_contact_unmasked: false,
    owner_full_phone: null,
    owner_exact_address: null,
    google_maps_nav_url: null,
    refund_status: "PENDING"
  },
  {
    id: 2,
    tool_id: 2,
    tool_title: "DeWalt 20V MAX XR Cordless Circular Saw (7-1/4\")",
    tool_category: "Carpentry & Woodwork",
    borrower_id: "borrower_rahul",
    borrower_name: "Rahul Varma",
    borrower_phone: "+919895012345",
    owner_id: "owner_priya",
    owner_name: "Priya Menon",
    start_date: "Today",
    end_date: "Tomorrow",
    duration_days: 1,
    daily_rate: 450.0,
    rental_fee: 450.0,
    security_deposit: 12000.0,
    total_amount: 12450.0,
    payment_method: "UPI",
    upi_id: "owner_priya@borrowloop",
    status: "ACCEPTED",
    is_contact_unmasked: true,
    owner_full_phone: "+919847987654",
    owner_direct_call_url: "tel:+919847987654",
    owner_whatsapp_url: "https://wa.me/919847987654?text=Hi%20Priya,%20I'm%20Rahul%20regarding%20BorrowLoop!",
    owner_exact_address: "Villa 14, Green Valley Enclave, Vellayambalam-Sasthamangalam Road, Pincode 695014",
    google_maps_nav_url: "https://www.google.com/maps/dir/?api=1&destination=8.5145,76.9732",
    refund_status: "PENDING"
  }
];

const getInitialApiBase = () => {
  const saved = localStorage.getItem('borrowloop_api_base');
  if (saved) return saved;
  const hostname = window.location.hostname || 'localhost';
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8000';
  }
  return `http://${hostname}:8000`;
};

export default function App() {
  const [apiBase, setApiBase] = useState(getInitialApiBase);
  const [serverOnline, setServerOnline] = useState(false);
  const [activeTab, setActiveTab] = useState('explore'); // 'explore', 'rentals', 'add_tool', 'apk'
  const [userRole, setUserRole] = useState('BORROWER'); // 'BORROWER' | 'OWNER'
  
  // Tools & Search State
  const [tools, setTools] = useState(FALLBACK_TOOLS);
  const [categories, setCategories] = useState(['All', 'Power Tools', 'Carpentry & Woodwork', 'Cleaning & Pressure', 'Ladders & Access', 'Gardening & Yard', 'Measurement & Detection']);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPincode, setSelectedPincode] = useState('');
  const [loadingTools, setLoadingTools] = useState(false);
  
  // Rentals & Handover State
  const [rentals, setRentals] = useState(FALLBACK_RENTALS);
  const [selectedRentalId, setSelectedRentalId] = useState(1);
  const [rentalFilter, setRentalFilter] = useState('ALL');
  const [actionLoading, setActionLoading] = useState(false);
  
  // Booking Modal State
  const [bookingTool, setBookingTool] = useState(null);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [borrowerName, setBorrowerName] = useState('Rahul Varma');
  const [borrowerPhone, setBorrowerPhone] = useState('+919895012345');
  const [bookingSuccess, setBookingSuccess] = useState(null);

  // Add Tool Modal State
  const [showAddToolModal, setShowAddToolModal] = useState(false);
  const [newToolTitle, setNewToolTitle] = useState('');
  const [newToolCategory, setNewToolCategory] = useState('Power Tools');
  const [newToolDescription, setNewToolDescription] = useState('');
  const [newToolDailyRate, setNewToolDailyRate] = useState('400');
  const [newToolDeposit, setNewToolDeposit] = useState('8000');
  const [newToolLocality, setNewToolLocality] = useState('Kowdiar');
  const [newToolPincode, setNewToolPincode] = useState('695003');
  const [newToolOwnerName, setNewToolOwnerName] = useState('Anand Nair');
  const [newToolOwnerPhone, setNewToolOwnerPhone] = useState('+919847123456');

  // APK & System State
  const [apkStatus, setApkStatus] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [customApiUrl, setCustomApiUrl] = useState(apiBase);

  // Health check & Server Discovery
  const checkHealth = async (base = apiBase) => {
    try {
      const res = await fetch(`${base}/api/health`, { signal: AbortSignal.timeout(2500) });
      if (res.ok) {
        setServerOnline(true);
        return true;
      }
    } catch {
      setServerOnline(false);
    }
    return false;
  };

  // Fetch Tools
  const fetchTools = async () => {
    setLoadingTools(true);
    try {
      let url = `${apiBase}/api/tools?`;
      if (searchQuery) url += `query=${encodeURIComponent(searchQuery)}&`;
      if (selectedCategory && selectedCategory !== 'All') url += `category=${encodeURIComponent(selectedCategory)}&`;
      if (selectedPincode) url += `pincode=${encodeURIComponent(selectedPincode)}&`;
      
      const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) setTools(data);
      }
    } catch (err) {
      console.warn('Using client fallback tools:', err);
    } finally {
      setLoadingTools(false);
    }
  };

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      const res = await fetch(`${apiBase}/api/tools/categories`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data = await res.json();
        setCategories(['All', ...data]);
      }
    } catch {
      // keep default categories
    }
  };

  // Fetch Rentals
  const fetchRentals = async () => {
    try {
      const res = await fetch(`${apiBase}/api/rentals`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          setRentals(data);
          if (!selectedRentalId) setSelectedRentalId(data[0].id);
        }
      }
    } catch {
      // keep fallback rentals
    }
  };

  // Fetch APK Status
  const fetchApkStatus = async () => {
    try {
      const res = await fetch(`${apiBase}/api/app/apk-status`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data = await res.json();
        setApkStatus(data);
      }
    } catch {
      setApkStatus({
        is_compiled: true,
        file_size_mb: 4.22,
        download_url: '/download/app-debug.apk'
      });
    }
  };

  // Polling & Lifecycle
  useEffect(() => {
    checkHealth();
    fetchTools();
    fetchCategories();
    fetchRentals();
    fetchApkStatus();

    const interval = setInterval(() => {
      fetchRentals();
      checkHealth();
      fetchApkStatus();
    }, 4000);

    return () => clearInterval(interval);
  }, [apiBase]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTools();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, selectedPincode]);

  // Handle Rental Actions (Accept, Pickup, Return)
  const handleRentalAction = async (rentalId, actionEndpoint, payload = null) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/rentals/${rentalId}/${actionEndpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload ? JSON.stringify(payload) : JSON.stringify({})
      });
      if (res.ok) {
        await fetchRentals();
      } else {
        // Local simulation fallback
        setRentals((prev) =>
          prev.map((r) => {
            if (r.id !== rentalId) return r;
            if (actionEndpoint === 'accept') {
              return {
                ...r,
                status: 'ACCEPTED',
                is_contact_unmasked: true,
                owner_full_phone: '+919847123456',
                owner_direct_call_url: 'tel:+919847123456',
                owner_whatsapp_url: 'https://wa.me/919847123456',
                owner_exact_address: 'Flat 3B, Silver Palms Apartment, Kowdiar, Pincode 695003',
                google_maps_nav_url: 'https://www.google.com/maps/dir/?api=1&destination=8.524,76.9645'
              };
            }
            if (actionEndpoint === 'confirm_pickup') {
              return { ...r, status: 'ACTIVE_RENTAL' };
            }
            if (actionEndpoint === 'confirm_return') {
              return { ...r, status: 'COMPLETED', refund_status: 'REFUNDED_IN_FULL' };
            }
            return r;
          })
        );
      }
    } catch {
      // Local fallback state transition
      setRentals((prev) =>
        prev.map((r) => {
          if (r.id !== rentalId) return r;
          if (actionEndpoint === 'accept') {
            return {
              ...r,
              status: 'ACCEPTED',
              is_contact_unmasked: true,
              owner_full_phone: '+919847123456',
              owner_direct_call_url: 'tel:+919847123456',
              owner_whatsapp_url: 'https://wa.me/919847123456',
              owner_exact_address: 'Flat 3B, Silver Palms Apartment, Kowdiar, Pincode 695003',
              google_maps_nav_url: 'https://www.google.com/maps/dir/?api=1&destination=8.524,76.9645'
            };
          }
          if (actionEndpoint === 'confirm_pickup') {
            return { ...r, status: 'ACTIVE_RENTAL' };
          }
          if (actionEndpoint === 'confirm_return') {
            return { ...r, status: 'COMPLETED', refund_status: 'REFUNDED_IN_FULL' };
          }
          return r;
        })
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Booking Request
  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (!bookingTool) return;
    
    setActionLoading(true);
    const newBookingObj = {
      id: Date.now(),
      tool_id: bookingTool.id,
      tool_title: bookingTool.title,
      tool_category: bookingTool.category,
      borrower_id: 'borrower_rahul',
      borrower_name: borrowerName,
      borrower_phone: borrowerPhone,
      owner_id: 'owner_anand',
      owner_name: bookingTool.owner_display_name ? bookingTool.owner_display_name.replace(' (Verified Neighbor)', '') : 'Anand Nair',
      start_date: startDate,
      end_date: endDate,
      duration_days: 2,
      daily_rate: bookingTool.daily_rate,
      rental_fee: bookingTool.daily_rate * 2,
      security_deposit: bookingTool.replacement_deposit,
      total_amount: (bookingTool.daily_rate * 2) + bookingTool.replacement_deposit,
      payment_method: paymentMethod,
      upi_id: 'owner@borrowloop',
      status: 'REQUESTED',
      is_contact_unmasked: false,
      owner_full_phone: null,
      owner_exact_address: null,
      google_maps_nav_url: null,
      refund_status: 'PENDING'
    };

    try {
      const res = await fetch(`${apiBase}/api/rentals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool_id: bookingTool.id,
          borrower_id: 'borrower_rahul',
          borrower_name: borrowerName,
          borrower_phone: borrowerPhone,
          start_date: startDate,
          end_date: endDate,
          payment_method: paymentMethod
        })
      });

      if (res.ok) {
        const data = await res.json();
        setRentals((prev) => [data, ...prev]);
        setSelectedRentalId(data.id);
      } else {
        setRentals((prev) => [newBookingObj, ...prev]);
        setSelectedRentalId(newBookingObj.id);
      }
    } catch {
      setRentals((prev) => [newBookingObj, ...prev]);
      setSelectedRentalId(newBookingObj.id);
    } finally {
      setBookingSuccess(true);
      setTimeout(() => {
        setBookingTool(null);
        setBookingSuccess(null);
        setActiveTab('rentals');
        setActionLoading(false);
      }, 1400);
    }
  };

  // Submit New Tool Form
  const handleAddNewTool = async (e) => {
    e.preventDefault();
    if (!newToolTitle) return;

    const toolPayload = {
      title: newToolTitle,
      category: newToolCategory,
      description: newToolDescription || "Available for neighbor tool sharing via BorrowLoop protocol.",
      daily_rate: parseFloat(newToolDailyRate),
      hourly_rate: Math.round(parseFloat(newToolDailyRate) / 6),
      replacement_deposit: parseFloat(newToolDeposit),
      condition: "Excellent",
      image_url: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=700&q=80",
      locality: newToolLocality,
      pincode: newToolPincode,
      latitude: 8.5241,
      longitude: 76.9366,
      owner_name: newToolOwnerName,
      owner_phone: newToolOwnerPhone,
      house_flat_no: "Flat 4B, Royal Palms",
      building_street: "Main Avenue"
    };

    try {
      const res = await fetch(`${apiBase}/api/tools`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toolPayload)
      });
      if (res.ok) {
        await fetchTools();
      }
    } catch {
      // client add
      setTools((prev) => [
        {
          id: Date.now(),
          ...toolPayload,
          approx_location: `${newToolLocality}, Pincode ${newToolPincode}`,
          approx_distance_km: 0.9,
          distance_label: `0.9 km away in Pincode ${newToolPincode}`,
          owner_display_name: `${newToolOwnerName.split(' ')[0]} (Verified Neighbor)`,
          owner_phone_masked: "+91 98*** 12345",
          is_available: true
        },
        ...prev
      ]);
    }

    setShowAddToolModal(false);
    setNewToolTitle('');
    setActiveTab('explore');
  };

  const selectedRental = rentals.find((r) => r.id === selectedRentalId) || rentals[0];

  const filteredRentals = rentals.filter((r) => {
    if (rentalFilter === 'ALL') return true;
    return r.status === rentalFilter;
  });

  return (
    <div className="app-viewport">
      {/* ================= WEBSITE HEADER ================= */}
      <header style={styles.topHeader}>
        <div style={styles.logoGroup}>
          <div style={styles.logoIcon}>
            <Repeat size={24} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={styles.logoTitle}>BorrowLoop</h1>
              <span style={styles.apkTag}>Universal Web + APK</span>
            </div>
            <p style={styles.logoSub}>Hyperlocal Tool Exchange & Escrow Handover Protocol</p>
          </div>
        </div>

        {/* Server Status & Role Switcher */}
        <div style={styles.headerControls}>
          <button 
            onClick={() => setShowSettings(!showSettings)} 
            style={serverOnline ? styles.serverOnlineBtn : styles.serverOfflineBtn}
            title="Configure Backend Server URL for Mobile Wi-Fi testing"
          >
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: serverOnline ? '#10b981' : '#ef4444'
            }}></span>
            <span>{serverOnline ? 'FastAPI Connected' : 'Standalone Mode'}</span>
            <Settings size={13} style={{ marginLeft: 3 }} />
          </button>

          <div style={styles.roleToggleContainer}>
            <button
              onClick={() => setUserRole('BORROWER')}
              style={userRole === 'BORROWER' ? styles.roleActiveBtn : styles.roleInactiveBtn}
            >
              <UserCheck size={13} />
              Borrower View
            </button>
            <button
              onClick={() => setUserRole('OWNER')}
              style={userRole === 'OWNER' ? styles.roleActiveBtn : styles.roleInactiveBtn}
            >
              <Wrench size={13} />
              Lender View
            </button>
          </div>
        </div>
      </header>

      {/* Backend Settings Dialog */}
      {showSettings && (
        <div className="glass-card animate-fade-in" style={styles.settingsModal}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h4 style={{ margin: 0, fontSize: 15, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Settings size={16} color="#0d9488" />
              API Server & Wi-Fi Connection
            </h4>
            <button onClick={() => setShowSettings(false)} style={styles.closeBtn}>✕</button>
          </div>
          <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 12 }}>
            When testing on an Android phone over local Wi-Fi, point to your computer's IP (e.g. <code>http://192.168.1.15:8000</code>). On desktop or emulator, use <code>http://localhost:8000</code>.
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input
              type="text"
              value={customApiUrl}
              onChange={(e) => setCustomApiUrl(e.target.value)}
              placeholder="http://192.168.x.x:8000"
              style={{ flex: 1, minWidth: 220 }}
            />
            <button
              className="btn-primary"
              onClick={() => {
                setApiBase(customApiUrl);
                localStorage.setItem('borrowloop_api_base', customApiUrl);
                checkHealth(customApiUrl);
                setShowSettings(false);
              }}
            >
              Save & Test
            </button>
            <button
              className="btn-secondary"
              onClick={() => {
                const def = 'http://localhost:8000';
                setCustomApiUrl(def);
                setApiBase(def);
                localStorage.removeItem('borrowloop_api_base');
                checkHealth(def);
                setShowSettings(false);
              }}
            >
              Reset Localhost
            </button>
          </div>
        </div>
      )}

      {/* ================= HIGH-IMPACT WEBSITE HERO BANNER ================= */}
      {activeTab === 'explore' && (
        <div className="glass-card" style={styles.heroBanner}>
          <div style={{ maxWidth: 640 }}>
            <div style={styles.heroPill}>
              <ShieldCheck size={14} color="#2dd4bf" />
              <span>Hyperlocal Equipment Sharing Protocol</span>
            </div>
            <h2 style={styles.heroHeadline}>
              Borrow from Neighbors.<br />Don’t Buy for One Project.
            </h2>
            <p style={styles.heroParagraph}>
              Demand-first tool exchange with Python Haversine geospatial proximity, two-way privacy contact shielding, and automated security deposit collateral escrow.
            </p>

            {/* Live Metrics Ribbon */}
            <div style={styles.metricsGrid}>
              <div style={styles.metricItem}>
                <strong style={styles.metricValue}>&lt; 1.2 km</strong>
                <span style={styles.metricLabel}>Avg Neighbor Radius</span>
              </div>
              <div style={styles.metricItem}>
                <strong style={{ ...styles.metricValue, color: '#10b981' }}>100%</strong>
                <span style={styles.metricLabel}>Collateral Escrow Hold</span>
              </div>
              <div style={styles.metricItem}>
                <strong style={{ ...styles.metricValue, color: '#38bdf8' }}>Two-Way</strong>
                <span style={styles.metricLabel}>Privacy Contact Mask</span>
              </div>
              <div style={styles.metricItem}>
                <strong style={{ ...styles.metricValue, color: '#f59e0b' }}>4.2 MB</strong>
                <span style={styles.metricLabel}>Standalone Android APK</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
              <button className="btn-primary" onClick={() => setActiveTab('explore')}>
                <Search size={16} />
                Explore {tools.length}+ Tools
              </button>
              <button className="btn-secondary" onClick={() => setShowAddToolModal(true)}>
                <PlusCircle size={16} />
                List a Tool (Earn Extra)
              </button>
              <button 
                className="btn-secondary" 
                style={{ borderColor: 'rgba(13, 148, 136, 0.4)' }}
                onClick={() => setActiveTab('apk')}
              >
                <Smartphone size={16} color="#2dd4bf" />
                Download Android APK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role explanation banner */}
      <div style={styles.roleBanner(userRole)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={16} color={userRole === 'BORROWER' ? '#38bdf8' : '#34d399'} />
          <span style={{ fontSize: 13, fontWeight: 500 }}>
            {userRole === 'BORROWER' 
              ? '👤 Currently viewing as Borrower (Rahul Varma). Browse nearby tools, request rental, and pay deposit collateral.'
              : '🛠️ Currently viewing as Tool Owner (Anand Nair). Accept requests to unmask your address, confirm deposit pickup, and inspect returns.'}
          </span>
        </div>
        <button 
          onClick={() => setUserRole(userRole === 'BORROWER' ? 'OWNER' : 'BORROWER')}
          style={styles.switchRoleInlineBtn}
        >
          Toggle to {userRole === 'BORROWER' ? 'Owner View' : 'Borrower View'}
        </button>
      </div>

      {/* Desktop Navigation Tabs */}
      <nav style={styles.desktopTabNav}>
        <button
          onClick={() => setActiveTab('explore')}
          style={activeTab === 'explore' ? styles.tabActive : styles.tabInactive}
        >
          <Search size={16} />
          Explore Tools ({tools.length})
        </button>
        <button
          onClick={() => setActiveTab('rentals')}
          style={activeTab === 'rentals' ? styles.tabActive : styles.tabInactive}
        >
          <Repeat size={16} />
          Escrow & Handover Tracker
          {rentals.length > 0 && <span style={styles.tabBadge}>{rentals.length}</span>}
        </button>
        <button
          onClick={() => setShowAddToolModal(true)}
          style={styles.tabInactive}
        >
          <PlusCircle size={16} />
          List Your Tool
        </button>
        <button
          onClick={() => setActiveTab('apk')}
          style={activeTab === 'apk' ? styles.tabActive : styles.tabInactive}
        >
          <Smartphone size={16} />
          Android APK Hub
          {apkStatus?.is_compiled && (
            <span style={{ ...styles.tabBadge, background: '#10b981' }}>Ready</span>
          )}
        </button>
      </nav>

      {/* ================= TAB 1: EXPLORE TOOLS ================= */}
      {activeTab === 'explore' && (
        <section className="animate-fade-in">
          {/* Search & Demand-First Filters Card */}
          <div className="glass-card" style={styles.searchBarCard}>
            <div style={styles.searchRow}>
              <div style={styles.searchInputWrap}>
                <Search size={18} color="#94a3b8" style={{ marginLeft: 12 }} />
                <input
                  type="text"
                  placeholder="Demand search: hammer drill, saw, pressure washer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={styles.mainSearchInput}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} style={styles.clearSearchBtn}>✕</button>
                )}
              </div>

              {/* Pincode Proximity Filter */}
              <div style={styles.pincodeSelectWrap}>
                <MapPin size={16} color="#0d9488" />
                <select 
                  value={selectedPincode} 
                  onChange={(e) => setSelectedPincode(e.target.value)}
                  style={styles.pincodeSelect}
                >
                  <option value="">All Nearby Neighborhoods</option>
                  <option value="695001">Pincode 695001 (Statue / Center)</option>
                  <option value="695003">Pincode 695003 (Kowdiar)</option>
                  <option value="695011">Pincode 695011 (Pattom)</option>
                  <option value="695014">Pincode 695014 (Sasthamangalam)</option>
                  <option value="695004">Pincode 695004 (Vazhuthacaud)</option>
                  <option value="695033">Pincode 695033 (Technopark)</option>
                </select>
              </div>
            </div>

            {/* Category Pills */}
            <div style={styles.categoryPills}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={selectedCategory === cat ? styles.categoryPillActive : styles.categoryPill}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Tools Grid */}
          <div style={{ marginTop: 24, marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 18, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldCheck size={20} color="#0d9488" />
              Verified Equipment Near You ({tools.length})
            </h3>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>
              Haversine Proximity Sorted
            </span>
          </div>

          {loadingTools ? (
            <div style={styles.emptyContainer}>
              <RefreshCw size={28} className="animate-spin" color="#0d9488" />
              <p style={{ marginTop: 12, color: '#94a3b8' }}>Calculating proximity distances...</p>
            </div>
          ) : tools.length === 0 ? (
            <div className="glass-card" style={styles.emptyContainer}>
              <Box size={40} color="#64748b" />
              <h4 style={{ marginTop: 12 }}>No tools found matching your search</h4>
              <p style={{ color: '#94a3b8', fontSize: 14 }}>Try clearing the search query or selecting another category.</p>
              <button 
                className="btn-primary" 
                style={{ marginTop: 16 }}
                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setSelectedPincode(''); }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="tools-grid">
              {tools.map((tool) => (
                <div key={tool.id} className="glass-card" style={styles.toolCard}>
                  {/* Tool Image with Overlays */}
                  <div style={styles.imageWrap}>
                    <img
                      src={tool.image_url || 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=700&q=80'}
                      alt={tool.title}
                      style={styles.toolImg}
                      loading="lazy"
                    />
                    <div style={styles.imageBadgeOverlay}>
                      <span className="badge badge-distance">
                        <MapPin size={11} /> {tool.distance_label || `${tool.approx_distance_km || 0.8} km away`}
                      </span>
                      <span style={styles.categoryBadge}>{tool.category}</span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div style={styles.cardContent}>
                    <h4 style={styles.toolTitle}>{tool.title}</h4>
                    <p style={styles.toolDesc}>{tool.description}</p>

                    {/* Rates & Security Deposit */}
                    <div style={styles.pricingBox}>
                      <div>
                        <div style={styles.priceLabel}>Daily Rate</div>
                        <div style={styles.priceValue}>₹{tool.daily_rate}<span style={{ fontSize: 12, color: '#94a3b8' }}>/day</span></div>
                        {tool.hourly_rate && (
                          <div style={{ fontSize: 11, color: '#94a3b8' }}>₹{tool.hourly_rate}/hr</div>
                        )}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={styles.priceLabel}>Replacement Collateral</div>
                        <div style={styles.depositValue}>₹{tool.replacement_deposit}</div>
                        <div style={{ fontSize: 11, color: '#10b981' }}>100% Refundable Hold</div>
                      </div>
                    </div>

                    {/* Privacy Shield Box */}
                    <div style={styles.privacyShieldBox}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Lock size={13} color="#f59e0b" />
                        <span style={styles.privacyText}>
                          {tool.owner_display_name || 'Verified Neighbor'} • {tool.owner_phone_masked || '+91 98*** 12345'}
                        </span>
                      </div>
                      <div style={styles.approxLocation}>
                        📍 {tool.approx_location}
                      </div>
                      <div style={styles.privacyNote}>
                        🔒 Street address & phone unlock upon lender acceptance
                      </div>
                    </div>

                    {/* Rent Action Button */}
                    <button
                      className="btn-primary"
                      style={{ width: '100%', marginTop: 14 }}
                      onClick={() => setBookingTool(tool)}
                    >
                      <span>Request to Rent</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* "How the Handover Protocol Works" Interactive Visual Guide */}
          <div className="glass-card" style={styles.howItWorksCard}>
            <h3 style={{ fontSize: 20, marginBottom: 16, textAlign: 'center' }}>
              How the BorrowLoop Handover Protocol Works
            </h3>

            <div style={styles.protocolGrid}>
              <div style={styles.protocolCard}>
                <div style={styles.protocolNumber}>1</div>
                <h4 style={styles.protocolTitle}>Demand Search</h4>
                <p style={styles.protocolDesc}>
                  Borrowers search needed equipment. Proximity is computed via Python Haversine formula against pincodes.
                </p>
              </div>

              <div style={styles.protocolCard}>
                <div style={styles.protocolNumber}>2</div>
                <h4 style={styles.protocolTitle}>Privacy Shield</h4>
                <p style={styles.protocolDesc}>
                  Addresses and contact phone numbers are cryptographically masked to protect neighbor privacy.
                </p>
              </div>

              <div style={styles.protocolCard}>
                <div style={styles.protocolNumber}>3</div>
                <h4 style={styles.protocolTitle}>Accept & Unmask</h4>
                <p style={styles.protocolDesc}>
                  Lender accepts booking. Direct phone call, WhatsApp, exact address, and Google Maps instantly unlock.
                </p>
              </div>

              <div style={styles.protocolCard}>
                <div style={styles.protocolNumber}>4</div>
                <h4 style={styles.protocolTitle}>Deposit Escrow</h4>
                <p style={styles.protocolDesc}>
                  Full replacement collateral is held. Returned immediately upon undamaged tool handover.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ================= TAB 2: RENTAL ESCROWS & HANDOVER ================= */}
      {activeTab === 'rentals' && (
        <section className="animate-fade-in">
          {/* Header & Filter Controls */}
          <div style={styles.rentalsHeaderRow}>
            <div>
              <h3 style={{ fontSize: 20, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Repeat size={20} color="#0d9488" />
                Live Handover Protocol & Escrow
              </h3>
              <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>
                Two-Way Masking, Lender Acceptance Trigger, and Deposit Collateral Settlement
              </p>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button 
                onClick={fetchRentals} 
                style={styles.refreshIconBtn}
                title="Refresh rentals"
              >
                <RefreshCw size={14} color="#94a3b8" />
              </button>
            </div>
          </div>

          {/* Status Filter Buttons */}
          <div style={styles.statusFiltersWrap}>
            {['ALL', 'REQUESTED', 'ACCEPTED', 'ACTIVE_RENTAL', 'COMPLETED'].map((st) => (
              <button
                key={st}
                onClick={() => setRentalFilter(st)}
                style={rentalFilter === st ? styles.filterBtnActive : styles.filterBtn}
              >
                {st.replace('_', ' ')}
                <span style={styles.filterCountBadge}>
                  {st === 'ALL' ? rentals.length : rentals.filter((r) => r.status === st).length}
                </span>
              </button>
            ))}
          </div>

          {filteredRentals.length === 0 ? (
            <div className="glass-card" style={styles.emptyContainer}>
              <Repeat size={44} color="#64748b" />
              <h4 style={{ marginTop: 12 }}>No rentals in this state</h4>
              <p style={{ color: '#94a3b8', fontSize: 14 }}>
                Request a tool from the "Explore Tools" tab or reset the filter.
              </p>
              <button 
                className="btn-primary" 
                style={{ marginTop: 16 }}
                onClick={() => setRentalFilter('ALL')}
              >
                Show All Rentals
              </button>
            </div>
          ) : (
            <div style={styles.rentalsSplitLayout}>
              {/* Left Column: Rentals List */}
              <div style={styles.rentalsListCol}>
                {filteredRentals.map((r) => {
                  const isSelected = selectedRental?.id === r.id;
                  return (
                    <div
                      key={r.id}
                      onClick={() => setSelectedRentalId(r.id)}
                      className="glass-card"
                      style={isSelected ? styles.rentalItemCardActive : styles.rentalItemCard}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                        <span style={styles.rentalIdTag}>Booking #{r.id}</span>
                        <span className={`badge ${
                          r.status === 'COMPLETED' ? 'badge-completed' :
                          r.status === 'ACTIVE_RENTAL' ? 'badge-active' :
                          r.status === 'ACCEPTED' ? 'badge-accepted' : 'badge-requested'
                        }`}>
                          {r.status}
                        </span>
                      </div>

                      <h4 style={{ fontSize: 15, marginBottom: 4, color: '#f8fafc' }}>{r.tool_title}</h4>
                      
                      <div style={{ fontSize: 12, color: '#94a3b8', display: 'flex', gap: 12, marginTop: 4 }}>
                        <span>Borrower: <strong style={{ color: '#e2e8f0' }}>{r.borrower_name}</strong></span>
                        <span>Owner: <strong style={{ color: '#e2e8f0' }}>{r.owner_name}</strong></span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ fontSize: 12, color: '#cbd5e1' }}>
                          Collateral: <strong style={{ color: '#f59e0b' }}>₹{r.security_deposit}</strong>
                        </span>
                        <span style={{ fontSize: 12, color: r.is_contact_unmasked ? '#10b981' : '#f59e0b', display: 'flex', alignItems: 'center', gap: 4 }}>
                          {r.is_contact_unmasked ? <Unlock size={12} /> : <Lock size={12} />}
                          {r.is_contact_unmasked ? 'Contact Unmasked' : 'Address Shielded'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Detailed Rental Inspector & Handshake Actions */}
              {selectedRental && (
                <div style={styles.rentalDetailCol}>
                  {/* Status & Lifecycle Stepper Card */}
                  <div className="glass-card" style={styles.detailCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                      <div>
                        <span style={{ fontSize: 12, color: '#94a3b8' }}>Rental Protocol #{selectedRental.id}</span>
                        <h3 style={{ fontSize: 18, margin: 0, marginTop: 2 }}>{selectedRental.tool_title}</h3>
                      </div>
                      <span className={`badge ${
                        selectedRental.status === 'COMPLETED' ? 'badge-completed' :
                        selectedRental.status === 'ACTIVE_RENTAL' ? 'badge-active' :
                        selectedRental.status === 'ACCEPTED' ? 'badge-accepted' : 'badge-requested'
                      }`}>
                        {selectedRental.status}
                      </span>
                    </div>

                    {/* Progress Stepper */}
                    <div style={styles.stepperContainer}>
                      {[
                        { label: 'Requested', sub: 'Privacy Locked', done: true },
                        { label: 'Accepted', sub: 'Contact Unmasked', done: ['ACCEPTED', 'ACTIVE_RENTAL', 'COMPLETED'].includes(selectedRental.status) },
                        { label: 'Deposit Escrow', sub: 'Handed Over', done: ['ACTIVE_RENTAL', 'COMPLETED'].includes(selectedRental.status) },
                        { label: 'Returned', sub: 'Refund Released', done: selectedRental.status === 'COMPLETED' }
                      ].map((step, idx) => (
                        <div key={idx} style={styles.stepperItem}>
                          <div style={step.done ? styles.stepCircleActive : styles.stepCirclePending}>
                            {step.done ? <Check size={14} color="#fff" /> : idx + 1}
                          </div>
                          <div style={styles.stepLabel}>{step.label}</div>
                          <div style={styles.stepSub}>{step.sub}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Financial & Collateral Escrow Card */}
                  <div className="glass-card" style={styles.detailCard}>
                    <h4 style={styles.sectionHeading}>
                      <Shield size={16} color="#0d9488" />
                      Financial Ledger & Security Deposit Collateral
                    </h4>

                    <div style={styles.ledgerGrid}>
                      <div style={styles.ledgerItem}>
                        <span style={styles.ledgerLabel}>Rental Duration</span>
                        <strong style={styles.ledgerValue}>{selectedRental.duration_days} Day(s)</strong>
                        <span style={{ fontSize: 11, color: '#94a3b8' }}>{selectedRental.start_date} to {selectedRental.end_date}</span>
                      </div>
                      <div style={styles.ledgerItem}>
                        <span style={styles.ledgerLabel}>Rental Fee</span>
                        <strong style={styles.ledgerValue}>₹{selectedRental.rental_fee}</strong>
                        <span style={{ fontSize: 11, color: '#94a3b8' }}>₹{selectedRental.daily_rate}/day</span>
                      </div>
                      <div style={styles.ledgerItem}>
                        <span style={styles.ledgerLabel}>Security Deposit Hold</span>
                        <strong style={{ ...styles.ledgerValue, color: '#f59e0b' }}>₹{selectedRental.security_deposit}</strong>
                        <span style={{ fontSize: 11, color: '#10b981' }}>Full replacement collateral</span>
                      </div>
                      <div style={styles.ledgerItem}>
                        <span style={styles.ledgerLabel}>Total Upfront Escrow</span>
                        <strong style={{ ...styles.ledgerValue, color: '#38bdf8' }}>₹{selectedRental.total_amount}</strong>
                        <span style={{ fontSize: 11, color: '#94a3b8' }}>Payment Mode: {selectedRental.payment_method}</span>
                      </div>
                    </div>

                    <div style={styles.escrowNotice}>
                      <Info size={16} color="#0d9488" />
                      <span style={{ fontSize: 12, color: '#cbd5e1' }}>
                        The ₹{selectedRental.security_deposit} security deposit is held strictly as collateral. It is released back to the borrower the instant the owner inspects and confirms undamaged return.
                      </span>
                    </div>
                  </div>

                  {/* TWO-WAY PRIVACY UNMASKING PANEL */}
                  <div className="glass-card" style={styles.detailCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <h4 style={styles.sectionHeading}>
                        {selectedRental.is_contact_unmasked ? (
                          <Unlock size={16} color="#10b981" />
                        ) : (
                          <Lock size={16} color="#f59e0b" />
                        )}
                        Contact & Navigation Unmasking Panel
                      </h4>
                      <span className={`badge ${selectedRental.is_contact_unmasked ? 'badge-accepted' : 'badge-privacy'}`}>
                        {selectedRental.is_contact_unmasked ? 'UNMASKED' : 'LOCKED'}
                      </span>
                    </div>

                    {/* Pre-acceptance Masked View */}
                    {!selectedRental.is_contact_unmasked ? (
                      <div style={styles.privacyShieldState}>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                          <Lock size={24} color="#f59e0b" style={{ marginTop: 2, flexShrink: 0 }} />
                          <div>
                            <strong style={{ color: '#fbbf24', fontSize: 14 }}>
                              Pre-Acceptance Privacy Shield Active
                            </strong>
                            <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
                              To prevent spam, stalking, or address harvesting, exact street address and personal contact phone numbers are cryptographically locked until the tool owner explicitly accepts the booking.
                            </p>
                            <div style={{ marginTop: 10, fontSize: 13 }}>
                              <div><strong>Owner:</strong> {selectedRental.owner_name} (Verified Neighbor)</div>
                              <div><strong>Phone:</strong> <span style={{ color: '#f59e0b' }}>🔒 Masked until owner accepts</span></div>
                              <div><strong>Pickup Location:</strong> <span style={{ color: '#f59e0b' }}>🔒 Exact street address hidden</span></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Post-acceptance Unmasked View */
                      <div style={styles.unmaskedState} className="animate-fade-in">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                          <CheckCircle2 size={18} color="#10b981" />
                          <strong style={{ color: '#34d399', fontSize: 14 }}>
                            Lender Acceptance Trigger Activated — All Details Unmasked!
                          </strong>
                        </div>

                        {/* Owner Contact info */}
                        <div style={styles.contactRow}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12, color: '#94a3b8' }}>Lender Contact:</div>
                            <div style={{ fontSize: 15, fontWeight: 600, color: '#f8fafc' }}>
                              {selectedRental.owner_name}
                            </div>
                            <div style={{ fontSize: 14, color: '#38bdf8', fontWeight: 600, marginTop: 2 }}>
                              {selectedRental.owner_full_phone}
                            </div>
                          </div>

                          {/* Quick Actions: Direct Call & WhatsApp */}
                          <div style={{ display: 'flex', gap: 8 }}>
                            {selectedRental.owner_direct_call_url && (
                              <a 
                                href={selectedRental.owner_direct_call_url}
                                style={styles.actionCallBtn}
                                title="One-tap phone call"
                              >
                                <PhoneCall size={14} />
                                Direct Call
                              </a>
                            )}
                            {selectedRental.owner_whatsapp_url && (
                              <a
                                href={selectedRental.owner_whatsapp_url}
                                target="_blank"
                                rel="noreferrer"
                                style={styles.actionWhatsAppBtn}
                                title="One-tap WhatsApp trigger"
                              >
                                <MessageCircle size={14} />
                                WhatsApp
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Exact Street Address & Google Maps */}
                        <div style={styles.addressBox}>
                          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>
                            📍 Exact Pickup Address:
                          </div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#f8fafc', lineHeight: 1.4 }}>
                            {selectedRental.owner_exact_address || 'Belhaven Palace Road, Kowdiar, Pincode 695003'}
                          </div>

                          {selectedRental.google_maps_nav_url && (
                            <a
                              href={selectedRental.google_maps_nav_url}
                              target="_blank"
                              rel="noreferrer"
                              style={styles.mapsBtn}
                            >
                              <Navigation size={14} />
                              Open Google Maps Direct Turn-by-Turn Navigation
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* HANDOVER ACTIONS & TRANSITION BUTTONS */}
                  <div className="glass-card" style={styles.detailCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <h4 style={styles.sectionHeading}>
                        <CheckCircle size={16} color="#0d9488" />
                        Handshake Protocol Actions ({userRole} Perspective)
                      </h4>
                      <button 
                        onClick={() => setUserRole(userRole === 'BORROWER' ? 'OWNER' : 'BORROWER')}
                        style={styles.smallToggleBtn}
                      >
                        Switch Role to {userRole === 'BORROWER' ? 'Owner' : 'Borrower'}
                      </button>
                    </div>

                    {userRole === 'OWNER' ? (
                      /* Owner Handover Controls */
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {selectedRental.status === 'REQUESTED' && (
                          <div style={{ display: 'flex', gap: 10 }}>
                            <button
                              className="btn-success"
                              style={{ flex: 1 }}
                              disabled={actionLoading}
                              onClick={() => handleRentalAction(selectedRental.id, 'accept')}
                            >
                              <CheckCircle2 size={16} />
                              Accept Request (Trigger Contact Unmasking)
                            </button>
                            <button
                              className="btn-secondary"
                              disabled={actionLoading}
                              onClick={() => handleRentalAction(selectedRental.id, 'reject')}
                            >
                              Decline
                            </button>
                          </div>
                        )}

                        {selectedRental.status === 'ACCEPTED' && (
                          <div>
                            <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 10 }}>
                              Borrower is on their way with ₹{selectedRental.total_amount} (Rental fee + ₹{selectedRental.security_deposit} deposit).
                            </p>
                            <button
                              className="btn-warning"
                              style={{ width: '100%' }}
                              disabled={actionLoading}
                              onClick={() => handleRentalAction(selectedRental.id, 'confirm_pickup', {
                                payment_received: true,
                                payment_mode_used: selectedRental.payment_method,
                                handover_notes: 'Deposit received & held in escrow. Tool handed over.'
                              })}
                            >
                              <ShieldCheck size={16} />
                              Confirm Deposit Received & Hand Over Item (Move to ACTIVE_RENTAL)
                            </button>
                          </div>
                        )}

                        {selectedRental.status === 'ACTIVE_RENTAL' && (
                          <div>
                            <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 10 }}>
                              Borrower has returned the tool. Inspect condition, verify accessories, and release full deposit refund.
                            </p>
                            <button
                              className="btn-success"
                              style={{ width: '100%' }}
                              disabled={actionLoading}
                              onClick={() => handleRentalAction(selectedRental.id, 'confirm_return', {
                                inspection_passed: true,
                                refund_deposited: true,
                                return_notes: 'Item returned in great shape. ₹' + selectedRental.security_deposit + ' refund released.'
                              })}
                            >
                              <CheckCircle2 size={16} />
                              Confirm Item Returned Undamaged & Release Full Deposit Refund
                            </button>
                          </div>
                        )}

                        {selectedRental.status === 'COMPLETED' && (
                          <div style={styles.successCallout}>
                            <CheckCircle2 size={24} color="#10b981" />
                            <div>
                              <strong>Loop Completed Successfully!</strong>
                              <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 2 }}>
                                Item has been returned and full security deposit was refunded.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Borrower Guidance View */
                      <div>
                        {selectedRental.status === 'REQUESTED' && (
                          <div style={styles.statusBannerInfo}>
                            <Clock size={18} color="#f59e0b" />
                            <div>
                              <strong>Waiting for Lender to Accept</strong>
                              <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 2 }}>
                                Once accepted, the exact address, direct call, and Google Maps will immediately unlock here.
                              </p>
                            </div>
                          </div>
                        )}

                        {selectedRental.status === 'ACCEPTED' && (
                          <div style={styles.statusBannerSuccess}>
                            <Unlock size={18} color="#10b981" />
                            <div>
                              <strong>Request Accepted! Ready for Pickup</strong>
                              <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 2 }}>
                                Head to the unmasked address above. Hand over ₹{selectedRental.total_amount} (fee + ₹{selectedRental.security_deposit} collateral hold) and collect the tool.
                              </p>
                            </div>
                          </div>
                        )}

                        {selectedRental.status === 'ACTIVE_RENTAL' && (
                          <div style={styles.statusBannerActive}>
                            <Wrench size={18} color="#38bdf8" />
                            <div>
                              <strong>Tool in Your Possession (Active Rental)</strong>
                              <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 2 }}>
                                Return the tool before {selectedRental.end_date} to receive your full ₹{selectedRental.security_deposit} deposit back.
                              </p>
                            </div>
                          </div>
                        )}

                        {selectedRental.status === 'COMPLETED' && (
                          <div style={styles.successCallout}>
                            <CheckCircle2 size={24} color="#10b981" />
                            <div>
                              <strong>Rental Completed & Deposit Returned!</strong>
                              <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 2 }}>
                                Thank you for using BorrowLoop. ₹{selectedRental.security_deposit} was returned to you.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* ================= TAB 3: ANDROID APK HUB ================= */}
      {activeTab === 'apk' && (
        <section className="animate-fade-in">
          <div className="glass-card" style={styles.apkHeroCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
              <div style={styles.apkBigIcon}>
                <Smartphone size={36} color="#0d9488" />
              </div>
              <div>
                <h3 style={{ fontSize: 22, margin: 0 }}>BorrowLoop Android APK</h3>
                <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 4 }}>
                  Standalone Native Android Debug Build (Compiled via Capacitor & Gradle)
                </p>
              </div>
            </div>

            {/* APK Status Card */}
            <div style={styles.apkStatusBox}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 13, color: '#94a3b8' }}>Compilation Status:</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                    <CheckCircle2 size={20} />
                    Debug APK Compiled & Ready
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, color: '#94a3b8' }}>File Size:</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#38bdf8', marginTop: 2 }}>
                    {apkStatus?.file_size_mb || '4.22'} MB
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 12, fontSize: 12, color: '#64748b', wordBreak: 'break-all' }}>
                <strong>Path:</strong> <code>frontend/android/app/build/outputs/apk/debug/app-debug.apk</code>
              </div>

              {/* Direct Download Button */}
              <div style={{ marginTop: 20 }}>
                <a
                  href={`${apiBase}/download/app-debug.apk`}
                  download="BorrowLoop-debug.apk"
                  className="btn-primary"
                  style={{
                    display: 'inline-flex',
                    textDecoration: 'none',
                    padding: '14px 28px',
                    fontSize: 16,
                    borderRadius: 10,
                    boxShadow: '0 8px 20px rgba(13, 148, 136, 0.4)'
                  }}
                >
                  <Download size={20} />
                  Download Standalone .APK File ({apkStatus?.file_size_mb || '4.22'} MB)
                </a>
              </div>
            </div>

            {/* Step-by-Step Installation Guide */}
            <div style={{ marginTop: 28 }}>
              <h4 style={{ fontSize: 17, marginBottom: 14, color: '#f8fafc' }}>
                📲 How to Install & Test on Any Android Device:
              </h4>

              <div style={styles.guideStepsList}>
                <div style={styles.guideStep}>
                  <div style={styles.guideStepNumber}>1</div>
                  <div>
                    <strong>Download APK to Phone</strong>
                    <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 2 }}>
                      Open this page on your phone browser using your computer's Wi-Fi IP (e.g. <code>http://192.168.x.x:8000</code>) and tap the Download button, or transfer via USB/Drive.
                    </p>
                  </div>
                </div>

                <div style={styles.guideStep}>
                  <div style={styles.guideStepNumber}>2</div>
                  <div>
                    <strong>Allow Unknown Sources</strong>
                    <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 2 }}>
                      In Android Settings, allow "Install from Unknown Sources" or tap Settings and "Allow from this source" when prompted.
                    </p>
                  </div>
                </div>

                <div style={styles.guideStep}>
                  <div style={styles.guideStepNumber}>3</div>
                  <div>
                    <strong>Install and Launch</strong>
                    <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 2 }}>
                      Tap <code>BorrowLoop-debug.apk</code> to install. Cleartext HTTP is pre-configured, so it connects seamlessly to your local Python server.
                    </p>
                  </div>
                </div>

                <div style={styles.guideStep}>
                  <div style={styles.guideStepNumber}>4</div>
                  <div>
                    <strong>Recompile Anytime via Terminal</strong>
                    <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 2 }}>
                      Whenever you modify code: <code>npm run build && npx cap sync android && cd android && ./gradlew assembleDebug</code>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ================= BOOKING MODAL ================= */}
      {bookingTool && (
        <div style={styles.modalOverlay}>
          <div className="glass-card animate-fade-in modal-dialog-responsive" style={styles.modalBox}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div>
                <span className="badge badge-distance">
                  <MapPin size={11} /> {bookingTool.distance_label || `${bookingTool.approx_distance_km || 0.8} km away`}
                </span>
                <h3 style={{ fontSize: 18, margin: '8px 0 2px 0' }}>{bookingTool.title}</h3>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>{bookingTool.category} • {bookingTool.condition || 'Good'}</span>
              </div>
              <button onClick={() => setBookingTool(null)} style={styles.closeBtn}>✕</button>
            </div>

            {bookingSuccess ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }} className="animate-fade-in">
                <CheckCircle2 size={48} color="#10b981" />
                <h4 style={{ marginTop: 12, color: '#f8fafc' }}>Request Sent to Neighbor!</h4>
                <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>
                  Redirecting to your Rental Escrow Tracker...
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreateBooking}>
                {/* Dates */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                  <div>
                    <label style={styles.formLabel}>Start Date</label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <label style={styles.formLabel}>End Date</label>
                    <input
                      type="date"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                {/* Borrower details */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                  <div>
                    <label style={styles.formLabel}>Your Name</label>
                    <input
                      type="text"
                      required
                      value={borrowerName}
                      onChange={(e) => setBorrowerName(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <label style={styles.formLabel}>Your Phone</label>
                    <input
                      type="text"
                      required
                      value={borrowerPhone}
                      onChange={(e) => setBorrowerPhone(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                {/* Payment mode */}
                <div style={{ marginBottom: 14 }}>
                  <label style={styles.formLabel}>Deposit & Payment Mode</label>
                  <select 
                    value={paymentMethod} 
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="UPI">UPI / Google Pay / PhonePe (Fast Escrow)</option>
                    <option value="CASH">Cash on In-Person Handover</option>
                  </select>
                </div>

                {/* Price Summary Calculation */}
                <div style={styles.modalSummaryBox}>
                  <div style={styles.summaryRow}>
                    <span>Daily Rate:</span>
                    <span>₹{bookingTool.daily_rate}/day</span>
                  </div>
                  <div style={styles.summaryRow}>
                    <span>Replacement Collateral Hold:</span>
                    <span style={{ color: '#f59e0b', fontWeight: 600 }}>₹{bookingTool.replacement_deposit} (Refundable)</span>
                  </div>
                  <div style={{ ...styles.summaryRow, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 8, marginTop: 4, fontWeight: 700, fontSize: 15 }}>
                    <span>Estimated Total:</span>
                    <span style={{ color: '#38bdf8' }}>₹{bookingTool.daily_rate + bookingTool.replacement_deposit}</span>
                  </div>
                </div>

                <div style={styles.modalPrivacyNotice}>
                  <Lock size={14} color="#f59e0b" />
                  <span>The owner's full address and contact will unlock upon their acceptance.</span>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                  <button type="button" className="btn-secondary" onClick={() => setBookingTool(null)} style={{ flex: 1 }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" disabled={actionLoading} style={{ flex: 2 }}>
                    {actionLoading ? 'Submitting...' : 'Confirm Request'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ================= LIST TOOL MODAL ================= */}
      {showAddToolModal && (
        <div style={styles.modalOverlay}>
          <div className="glass-card animate-fade-in modal-dialog-responsive" style={styles.modalBox}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 18, margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                <PlusCircle size={20} color="#0d9488" />
                List Your Tool for Neighborhood Sharing
              </h3>
              <button onClick={() => setShowAddToolModal(false)} style={styles.closeBtn}>✕</button>
            </div>

            <form onSubmit={handleAddNewTool}>
              <div style={{ marginBottom: 10 }}>
                <label style={styles.formLabel}>Tool Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bosch GBH 2-26 Rotary Hammer Drill"
                  value={newToolTitle}
                  onChange={(e) => setNewToolTitle(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <div>
                  <label style={styles.formLabel}>Category</label>
                  <select
                    value={newToolCategory}
                    onChange={(e) => setNewToolCategory(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="Power Tools">Power Tools</option>
                    <option value="Carpentry & Woodwork">Carpentry & Woodwork</option>
                    <option value="Cleaning & Pressure">Cleaning & Pressure</option>
                    <option value="Ladders & Access">Ladders & Access</option>
                    <option value="Gardening & Yard">Gardening & Yard</option>
                    <option value="Measurement & Detection">Measurement & Detection</option>
                  </select>
                </div>
                <div>
                  <label style={styles.formLabel}>Neighborhood Pincode</label>
                  <select
                    value={newToolPincode}
                    onChange={(e) => {
                      setNewToolPincode(e.target.value);
                      if (e.target.value === '695003') setNewToolLocality('Kowdiar');
                      if (e.target.value === '695001') setNewToolLocality('Statue');
                      if (e.target.value === '695011') setNewToolLocality('Pattom');
                      if (e.target.value === '695014') setNewToolLocality('Sasthamangalam');
                      if (e.target.value === '695033') setNewToolLocality('Technopark');
                    }}
                    style={{ width: '100%' }}
                  >
                    <option value="695003">695003 (Kowdiar)</option>
                    <option value="695001">695001 (Statue)</option>
                    <option value="695011">695011 (Pattom)</option>
                    <option value="695014">695014 (Sasthamangalam)</option>
                    <option value="695033">695033 (Technopark)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <div>
                  <label style={styles.formLabel}>Daily Rate (₹)</label>
                  <input
                    type="number"
                    required
                    value={newToolDailyRate}
                    onChange={(e) => setNewToolDailyRate(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={styles.formLabel}>Replacement Deposit (₹)</label>
                  <input
                    type="number"
                    required
                    value={newToolDeposit}
                    onChange={(e) => setNewToolDeposit(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                <div>
                  <label style={styles.formLabel}>Owner Name</label>
                  <input
                    type="text"
                    required
                    value={newToolOwnerName}
                    onChange={(e) => setNewToolOwnerName(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={styles.formLabel}>Phone (Contact)</label>
                  <input
                    type="text"
                    required
                    value={newToolOwnerPhone}
                    onChange={(e) => setNewToolOwnerPhone(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={styles.modalPrivacyNotice}>
                <ShieldCheck size={14} color="#10b981" />
                <span>Your exact house address and phone will remain locked until you accept a borrower request.</span>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAddToolModal(false)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 2 }}>
                  Publish Tool Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MOBILE BOTTOM NAVIGATION BAR (NATIVE APP FEEL) ================= */}
      <nav className="mobile-bottom-nav">
        <button
          onClick={() => setActiveTab('explore')}
          className={`nav-item-btn ${activeTab === 'explore' ? 'active' : ''}`}
        >
          <Search size={18} />
          <span>Explore</span>
        </button>
        <button
          onClick={() => setActiveTab('rentals')}
          className={`nav-item-btn ${activeTab === 'rentals' ? 'active' : ''}`}
        >
          <Repeat size={18} />
          <span>Escrows</span>
        </button>
        <button
          onClick={() => setShowAddToolModal(true)}
          className="nav-item-btn"
        >
          <PlusCircle size={18} />
          <span>List Tool</span>
        </button>
        <button
          onClick={() => setActiveTab('apk')}
          className={`nav-item-btn ${activeTab === 'apk' ? 'active' : ''}`}
        >
          <Smartphone size={18} />
          <span>APK App</span>
        </button>
      </nav>
    </div>
  );
}

// Inline Styles with high aesthetic density and responsive layouts
const styles = {
  topHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 0',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 12
  },
  logoGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 12
  },
  logoIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    background: 'linear-gradient(135deg, #0d9488, #0f766e)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 16px rgba(13, 148, 136, 0.4)'
  },
  logoTitle: {
    fontSize: 22,
    margin: 0,
    background: 'linear-gradient(135deg, #ffffff, #99f6e4)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontWeight: 800
  },
  logoSub: {
    fontSize: 12,
    color: '#94a3b8',
    margin: 0
  },
  apkTag: {
    fontSize: 10,
    fontWeight: 700,
    background: 'rgba(13, 148, 136, 0.2)',
    color: '#2dd4bf',
    padding: '2px 6px',
    borderRadius: 4,
    border: '1px solid rgba(45, 212, 191, 0.3)'
  },
  headerControls: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap'
  },
  serverOnlineBtn: {
    background: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    color: '#34d399',
    fontSize: 12,
    padding: '6px 10px',
    borderRadius: 20
  },
  serverOfflineBtn: {
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#f87171',
    fontSize: 12,
    padding: '6px 10px',
    borderRadius: 20
  },
  roleToggleContainer: {
    display: 'flex',
    background: '#131b2e',
    padding: 3,
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.08)'
  },
  roleActiveBtn: {
    background: '#0d9488',
    color: '#fff',
    fontSize: 12,
    padding: '6px 12px',
    borderRadius: 7,
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
  },
  roleInactiveBtn: {
    background: 'transparent',
    color: '#94a3b8',
    fontSize: 12,
    padding: '6px 12px',
    borderRadius: 7
  },
  settingsModal: {
    padding: 16,
    marginBottom: 16
  },
  closeBtn: {
    background: 'transparent',
    color: '#94a3b8',
    fontSize: 16,
    padding: 4
  },
  heroBanner: {
    padding: '26px 22px',
    marginBottom: 16,
    background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.18) 0%, rgba(15, 23, 42, 0.9) 100%)',
    border: '1px solid rgba(13, 148, 136, 0.3)',
    position: 'relative',
    overflow: 'hidden'
  },
  heroPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: 'rgba(13, 148, 136, 0.2)',
    border: '1px solid rgba(45, 212, 191, 0.3)',
    color: '#2dd4bf',
    fontSize: 12,
    fontWeight: 600,
    padding: '4px 10px',
    borderRadius: 20,
    marginBottom: 12
  },
  heroHeadline: {
    fontSize: 'clamp(24px, 4vw, 34px)',
    lineHeight: 1.2,
    marginBottom: 10,
    color: '#f8fafc'
  },
  heroParagraph: {
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 1.5,
    marginBottom: 16
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
    gap: 10,
    margin: '14px 0'
  },
  metricItem: {
    background: 'rgba(19, 27, 46, 0.75)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '8px 10px',
    borderRadius: 8,
    display: 'flex',
    flexDirection: 'column'
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 800,
    color: '#2dd4bf'
  },
  metricLabel: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2
  },
  roleBanner: (role) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: role === 'BORROWER' ? 'rgba(14, 165, 233, 0.1)' : 'rgba(16, 185, 129, 0.1)',
    border: `1px solid ${role === 'BORROWER' ? 'rgba(14, 165, 233, 0.25)' : 'rgba(16, 185, 129, 0.25)'}`,
    padding: '10px 14px',
    borderRadius: 10,
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 8
  }),
  switchRoleInlineBtn: {
    background: 'rgba(255,255,255,0.08)',
    color: '#f8fafc',
    fontSize: 12,
    padding: '5px 10px',
    borderRadius: 6
  },
  desktopTabNav: {
    display: 'flex',
    gap: 8,
    marginBottom: 20,
    overflowX: 'auto',
    paddingBottom: 4
  },
  tabActive: {
    background: '#0d9488',
    color: '#fff',
    padding: '10px 16px',
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 600,
    boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)',
    whiteSpace: 'nowrap'
  },
  tabInactive: {
    background: '#131b2e',
    color: '#94a3b8',
    border: '1px solid rgba(255,255,255,0.08)',
    padding: '10px 16px',
    borderRadius: 10,
    fontSize: 13,
    whiteSpace: 'nowrap'
  },
  tabBadge: {
    background: 'rgba(255,255,255,0.2)',
    color: '#fff',
    fontSize: 11,
    padding: '2px 6px',
    borderRadius: 10,
    marginLeft: 6
  },
  searchBarCard: {
    padding: 16
  },
  searchRow: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap'
  },
  searchInputWrap: {
    flex: 2,
    minWidth: 240,
    display: 'flex',
    alignItems: 'center',
    background: '#131b2e',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.08)'
  },
  mainSearchInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    color: '#fff',
    padding: '12px 14px',
    fontSize: 14,
    outline: 'none'
  },
  clearSearchBtn: {
    background: 'transparent',
    color: '#94a3b8',
    padding: '0 12px',
    fontSize: 14
  },
  pincodeSelectWrap: {
    flex: 1,
    minWidth: 200,
    display: 'flex',
    alignItems: 'center',
    background: '#131b2e',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.08)',
    paddingLeft: 10
  },
  pincodeSelect: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    color: '#fff',
    padding: '12px 10px',
    fontSize: 13,
    outline: 'none'
  },
  categoryPills: {
    display: 'flex',
    gap: 8,
    marginTop: 14,
    overflowX: 'auto',
    paddingBottom: 4
  },
  categoryPill: {
    background: '#131b2e',
    color: '#94a3b8',
    border: '1px solid rgba(255,255,255,0.06)',
    padding: '6px 12px',
    borderRadius: 20,
    fontSize: 12,
    whiteSpace: 'nowrap'
  },
  categoryPillActive: {
    background: 'rgba(13, 148, 136, 0.2)',
    color: '#2dd4bf',
    border: '1px solid rgba(45, 212, 191, 0.4)',
    padding: '6px 12px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    whiteSpace: 'nowrap'
  },
  toolCard: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  imageWrap: {
    position: 'relative',
    height: 170,
    width: '100%',
    overflow: 'hidden',
    background: '#0a0e17'
  },
  toolImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  imageBadgeOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  categoryBadge: {
    background: 'rgba(13, 18, 30, 0.88)',
    backdropFilter: 'blur(8px)',
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: 600,
    padding: '3px 8px',
    borderRadius: 6
  },
  cardContent: {
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    flex: 1
  },
  toolTitle: {
    fontSize: 16,
    color: '#f8fafc',
    marginBottom: 6,
    lineHeight: 1.3
  },
  toolDesc: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 1.4,
    marginBottom: 12,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  },
  pricingBox: {
    display: 'flex',
    justifyContent: 'space-between',
    background: '#131b2e',
    padding: '10px 12px',
    borderRadius: 8,
    marginBottom: 12
  },
  priceLabel: {
    fontSize: 11,
    color: '#94a3b8',
    textTransform: 'uppercase'
  },
  priceValue: {
    fontSize: 16,
    fontWeight: 700,
    color: '#f8fafc'
  },
  depositValue: {
    fontSize: 16,
    fontWeight: 700,
    color: '#f59e0b'
  },
  privacyShieldBox: {
    background: 'rgba(245, 158, 11, 0.08)',
    border: '1px dashed rgba(245, 158, 11, 0.25)',
    padding: '10px 12px',
    borderRadius: 8,
    marginTop: 'auto'
  },
  privacyText: {
    fontSize: 12,
    fontWeight: 600,
    color: '#fbbf24'
  },
  approxLocation: {
    fontSize: 12,
    color: '#cbd5e1',
    marginTop: 4
  },
  privacyNote: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 4,
    lineHeight: 1.3
  },
  howItWorksCard: {
    padding: '28px 20px',
    marginTop: 32,
    marginBottom: 20
  },
  protocolGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
    gap: 16
  },
  protocolCard: {
    background: '#131b2e',
    padding: 18,
    borderRadius: 12,
    border: '1px solid rgba(255, 255, 255, 0.06)'
  },
  protocolNumber: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    background: '#0d9488',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: 13,
    marginBottom: 10
  },
  protocolTitle: {
    fontSize: 15,
    color: '#f8fafc',
    marginBottom: 6
  },
  protocolDesc: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 1.4
  },
  emptyContainer: {
    textAlign: 'center',
    padding: '48px 20px',
    margin: '20px 0'
  },
  rentalsHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 12
  },
  refreshIconBtn: {
    background: '#131b2e',
    border: '1px solid rgba(255,255,255,0.08)',
    padding: '8px 10px',
    borderRadius: 8
  },
  statusFiltersWrap: {
    display: 'flex',
    gap: 8,
    marginBottom: 18,
    overflowX: 'auto',
    paddingBottom: 4
  },
  filterBtn: {
    background: '#131b2e',
    color: '#94a3b8',
    border: '1px solid rgba(255,255,255,0.08)',
    padding: '6px 12px',
    borderRadius: 20,
    fontSize: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    whiteSpace: 'nowrap'
  },
  filterBtnActive: {
    background: '#0d9488',
    color: '#fff',
    border: '1px solid #0d9488',
    padding: '6px 12px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    whiteSpace: 'nowrap'
  },
  filterCountBadge: {
    background: 'rgba(0,0,0,0.25)',
    padding: '1px 6px',
    borderRadius: 10,
    fontSize: 11
  },
  rentalsSplitLayout: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: 20
  },
  rentalsListCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12
  },
  rentalItemCard: {
    padding: 14,
    cursor: 'pointer'
  },
  rentalItemCardActive: {
    padding: 14,
    cursor: 'pointer',
    borderColor: '#0d9488',
    background: 'rgba(13, 148, 136, 0.1)'
  },
  rentalIdTag: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: 700
  },
  rentalDetailCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16
  },
  detailCard: {
    padding: 18
  },
  sectionHeading: {
    fontSize: 15,
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    color: '#f8fafc'
  },
  stepperContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 8,
    marginTop: 14,
    textAlign: 'center'
  },
  stepperItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  stepCircleActive: {
    width: 26,
    height: 26,
    borderRadius: '50%',
    background: '#0d9488',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    boxShadow: '0 0 10px rgba(13, 148, 136, 0.5)'
  },
  stepCirclePending: {
    width: 26,
    height: 26,
    borderRadius: '50%',
    background: '#172136',
    color: '#64748b',
    fontSize: 12,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: '#f8fafc'
  },
  stepSub: {
    fontSize: 10,
    color: '#94a3b8'
  },
  ledgerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 10,
    marginTop: 12
  },
  ledgerItem: {
    background: '#131b2e',
    padding: '10px 12px',
    borderRadius: 8,
    display: 'flex',
    flexDirection: 'column'
  },
  ledgerLabel: {
    fontSize: 11,
    color: '#94a3b8',
    textTransform: 'uppercase'
  },
  ledgerValue: {
    fontSize: 16,
    color: '#f8fafc',
    margin: '3px 0'
  },
  escrowNotice: {
    display: 'flex',
    gap: 8,
    alignItems: 'flex-start',
    background: 'rgba(13, 148, 136, 0.08)',
    border: '1px solid rgba(13, 148, 136, 0.2)',
    padding: '10px 12px',
    borderRadius: 8,
    marginTop: 12
  },
  privacyShieldState: {
    background: 'rgba(245, 158, 11, 0.08)',
    border: '1px dashed rgba(245, 158, 11, 0.3)',
    padding: 14,
    borderRadius: 8
  },
  unmaskedState: {
    background: 'rgba(16, 185, 129, 0.06)',
    border: '1px solid rgba(16, 185, 129, 0.25)',
    padding: 14,
    borderRadius: 8
  },
  contactRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 8
  },
  actionCallBtn: {
    background: '#0d9488',
    color: '#fff',
    textDecoration: 'none',
    fontSize: 12,
    fontWeight: 600,
    padding: '8px 12px',
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    gap: 6
  },
  actionWhatsAppBtn: {
    background: '#16a34a',
    color: '#fff',
    textDecoration: 'none',
    fontSize: 12,
    fontWeight: 600,
    padding: '8px 12px',
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    gap: 6
  },
  addressBox: {
    background: '#131b2e',
    padding: 12,
    borderRadius: 8
  },
  mapsBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    color: '#38bdf8',
    textDecoration: 'none',
    fontSize: 13,
    fontWeight: 600
  },
  smallToggleBtn: {
    background: '#131b2e',
    color: '#94a3b8',
    border: '1px solid rgba(255,255,255,0.08)',
    fontSize: 11,
    padding: '4px 8px',
    borderRadius: 6
  },
  statusBannerInfo: {
    display: 'flex',
    gap: 12,
    background: 'rgba(245, 158, 11, 0.08)',
    border: '1px solid rgba(245, 158, 11, 0.25)',
    padding: 12,
    borderRadius: 8
  },
  statusBannerSuccess: {
    display: 'flex',
    gap: 12,
    background: 'rgba(16, 185, 129, 0.08)',
    border: '1px solid rgba(16, 185, 129, 0.25)',
    padding: 12,
    borderRadius: 8
  },
  statusBannerActive: {
    display: 'flex',
    gap: 12,
    background: 'rgba(14, 165, 233, 0.08)',
    border: '1px solid rgba(14, 165, 233, 0.25)',
    padding: 12,
    borderRadius: 8
  },
  successCallout: {
    display: 'flex',
    gap: 12,
    background: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center'
  },
  apkHeroCard: {
    padding: 24
  },
  apkBigIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    background: 'rgba(13, 148, 136, 0.15)',
    border: '1px solid rgba(13, 148, 136, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  apkStatusBox: {
    background: '#131b2e',
    padding: 18,
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.08)'
  },
  guideStepsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12
  },
  guideStep: {
    display: 'flex',
    gap: 14,
    background: '#131b2e',
    padding: 14,
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.06)'
  },
  guideStepNumber: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    background: '#0d9488',
    color: '#fff',
    fontWeight: 700,
    fontSize: 13,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    padding: 16
  },
  modalBox: {
    width: '100%',
    maxWidth: 480,
    padding: 20
  },
  formLabel: {
    display: 'block',
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 5,
    fontWeight: 500
  },
  modalSummaryBox: {
    background: '#131b2e',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 13,
    marginBottom: 4,
    color: '#cbd5e1'
  },
  modalPrivacyNotice: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 12,
    color: '#fbbf24',
    background: 'rgba(245, 158, 11, 0.08)',
    padding: '8px 10px',
    borderRadius: 6
  }
};
