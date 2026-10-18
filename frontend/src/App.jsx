import React, { useState, useEffect } from 'react';
import { 
  Search, MapPin, Shield, ShieldCheck, Lock, Unlock, Phone, PhoneCall,
  MessageCircle, ExternalLink, Calendar, CheckCircle, Clock, AlertCircle,
  Smartphone, Download, RefreshCw, ChevronRight, Wrench, Settings, Info,
  CheckCircle2, ArrowRight, UserCheck, Check, Sparkles, Send, Box, Repeat,
  PlusCircle, Zap, ShieldAlert, Navigation, Star, ArrowUpRight, LogOut, User, Mail
} from 'lucide-react';

const isCapacitorApp = () => {
  return typeof window !== 'undefined' && (
    window.location.protocol === 'capacitor:' || 
    window.location.protocol === 'file:' || 
    Boolean(window.Capacitor?.isNativePlatform?.())
  );
};

const getInitialApiBase = () => {
  const saved = localStorage.getItem('borrowloop_api_base');
  if (saved) return saved;

  if (typeof window !== 'undefined') {
    if (isCapacitorApp()) {
      const hostname = window.location.hostname || 'localhost';
      return (hostname === 'localhost' || hostname === '127.0.0.1')
        ? 'http://localhost:8000'
        : `http://${hostname}:8000`;
    }

    if (window.location.port === '5173') {
      const hostname = window.location.hostname || 'localhost';
      return `http://${hostname}:8000`;
    }

    return window.location.origin;
  }

  return 'http://localhost:8000';
};

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('borrowloop_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export default function App() {
  const [apiBase, setApiBase] = useState(getInitialApiBase);
  const [currentUser, setCurrentUser] = useState(getStoredUser);
  const [activeTab, setActiveTab] = useState('explore'); // 'explore', 'rentals', 'apk'
  const [isMobileApp, setIsMobileApp] = useState(false);

  // Auth Form State (for initial login / register)
  const [authEmail, setAuthEmail] = useState('');
  const [authFullName, setAuthFullName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authLocality, setAuthLocality] = useState('');
  const [authPincode, setAuthPincode] = useState('');
  const [authUpiId, setAuthUpiId] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Tools & Search State (NO fake seed data)
  const [tools, setTools] = useState([]);
  const [categories, setCategories] = useState([
    'All', 'Power Tools', 'Carpentry & Woodwork', 'Cleaning & Pressure', 
    'Ladders & Access', 'Gardening & Yard', 'Measurement & Detection', 'Automotive'
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPincode, setSelectedPincode] = useState('');
  const [loadingTools, setLoadingTools] = useState(false);

  // Rentals State (NO fake seed data)
  const [rentals, setRentals] = useState([]);
  const [selectedRentalId, setSelectedRentalId] = useState(null);
  const [rentalRoleFilter, setRentalRoleFilter] = useState('ALL'); // 'ALL' | 'BORROWED' | 'OWNED'
  const [actionLoading, setActionLoading] = useState(false);

  // Booking Modal State
  const [bookingTool, setBookingTool] = useState(null);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [bookingError, setBookingError] = useState('');

  // Add Tool Modal State
  const [showAddToolModal, setShowAddToolModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Power Tools');
  const [newDescription, setNewDescription] = useState('');
  const [newDailyRate, setNewDailyRate] = useState('');
  const [newHourlyRate, setNewHourlyRate] = useState('');
  const [newDeposit, setNewDeposit] = useState('');
  const [newCondition, setNewCondition] = useState('Excellent');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newHouseFlat, setNewHouseFlat] = useState('');
  const [newStreet, setNewStreet] = useState('');
  const [newLocality, setNewLocality] = useState('');
  const [newPincode, setNewPincode] = useState('');
  const [addingTool, setAddingTool] = useState(false);
  const [addToolError, setAddToolError] = useState('');

  // APK Status
  const [apkStatus, setApkStatus] = useState(null);

  // Check if running in mobile app wrapper
  useEffect(() => {
    setIsMobileApp(isCapacitorApp());
  }, []);

  // Fetch Tools
  const fetchTools = async () => {
    setLoadingTools(true);
    try {
      let url = `${apiBase}/api/tools?`;
      if (searchQuery) url += `query=${encodeURIComponent(searchQuery)}&`;
      if (selectedCategory && selectedCategory !== 'All') url += `category=${encodeURIComponent(selectedCategory)}&`;
      if (selectedPincode) url += `pincode=${encodeURIComponent(selectedPincode)}&`;

      const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
      if (res.ok) {
        const data = await res.json();
        setTools(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.warn('Error fetching tools:', err);
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
        if (Array.isArray(data) && data.length > 0) {
          setCategories(['All', ...data]);
        }
      }
    } catch {
      // keep default list
    }
  };

  // Fetch Rentals
  const fetchRentals = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`${apiBase}/api/rentals`, { signal: AbortSignal.timeout(4000) });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setRentals(list);
        if (list.length > 0 && !selectedRentalId) {
          setSelectedRentalId(list[0].id);
        }
      }
    } catch {
      // empty state
    }
  };

  // Fetch APK Status (for web users)
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
        file_size_mb: 4.12,
        download_url: '/download/BorrowLoop-v1.0.apk'
      });
    }
  };

  // Polling & Lifecycle
  useEffect(() => {
    fetchTools();
    fetchCategories();
    fetchApkStatus();
  }, [apiBase]);

  useEffect(() => {
    if (currentUser) {
      fetchRentals();
      const interval = setInterval(fetchRentals, 4000);
      return () => clearInterval(interval);
    }
  }, [apiBase, currentUser]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTools();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, selectedPincode]);

  // Handle Login / Register Submission
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    const emailClean = authEmail.trim().toLowerCase();
    if (!emailClean || !emailClean.includes('@') || !emailClean.includes('.')) {
      setAuthError('Please enter a valid email address.');
      return;
    }
    if (!authFullName.trim()) {
      setAuthError('Please enter your full name.');
      return;
    }
    if (!authPhone.trim()) {
      setAuthError('Please enter your phone number.');
      return;
    }

    setAuthLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/auth/login-or-register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailClean,
          full_name: authFullName.trim(),
          phone: authPhone.trim(),
          locality: authLocality.trim() || 'Neighborhood',
          pincode: authPincode.trim() || '695001',
          upi_id: authUpiId.trim() || `${emailClean.split('@')[0]}@upi`
        })
      });

      if (res.ok) {
        const userData = await res.json();
        localStorage.setItem('borrowloop_user', JSON.stringify(userData));
        setCurrentUser(userData);
      } else {
        const err = await res.json();
        setAuthError(err.detail || 'Failed to authenticate. Please check your details.');
      }
    } catch (err) {
      // Offline / network fallback session
      const fallbackUser = {
        id: Date.now(),
        email: emailClean,
        full_name: authFullName.trim(),
        phone: authPhone.trim(),
        locality: authLocality.trim() || 'Neighborhood',
        pincode: authPincode.trim() || '695001',
        upi_id: authUpiId.trim() || `${emailClean.split('@')[0]}@upi`
      };
      localStorage.setItem('borrowloop_user', JSON.stringify(fallbackUser));
      setCurrentUser(fallbackUser);
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('borrowloop_user');
    setCurrentUser(null);
    setRentals([]);
  };

  // Handle Booking Creation
  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (!bookingTool || !currentUser) return;
    setBookingError('');

    // Self-borrowing check
    if (bookingTool.owner_id && bookingTool.owner_id.toLowerCase() === currentUser.email.toLowerCase()) {
      setBookingError('You cannot borrow your own equipment listing.');
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/rentals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool_id: bookingTool.id,
          borrower_id: currentUser.email,
          borrower_name: currentUser.full_name,
          borrower_phone: currentUser.phone,
          start_date: startDate,
          end_date: endDate,
          payment_method: paymentMethod
        })
      });

      if (res.ok) {
        const data = await res.json();
        setRentals((prev) => [data, ...prev]);
        setSelectedRentalId(data.id);
        setBookingSuccess(true);
        setTimeout(() => {
          setBookingTool(null);
          setBookingSuccess(null);
          setActiveTab('rentals');
        }, 1200);
      } else {
        const err = await res.json();
        setBookingError(err.detail || 'Failed to submit booking request.');
      }
    } catch {
      setBookingError('Unable to connect to server. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Rental State Machine Actions (Accept, Pickup, Return)
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
      }
    } catch (err) {
      console.error('Action error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Listing a New Tool
  const handleAddNewTool = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    setAddToolError('');

    if (!newTitle.trim()) {
      setAddToolError('Please enter a tool title.');
      return;
    }
    if (!newDailyRate || parseFloat(newDailyRate) <= 0) {
      setAddToolError('Please enter a valid daily rate.');
      return;
    }
    if (!newDeposit || parseFloat(newDeposit) <= 0) {
      setAddToolError('Please enter a replacement security deposit.');
      return;
    }

    setAddingTool(true);
    const toolPayload = {
      title: newTitle.trim(),
      category: newCategory,
      description: newDescription.trim() || 'Available for hyperlocal neighbor sharing with BorrowLoop escrow protection.',
      daily_rate: parseFloat(newDailyRate),
      hourly_rate: newHourlyRate ? parseFloat(newHourlyRate) : Math.round(parseFloat(newDailyRate) / 6),
      replacement_deposit: parseFloat(newDeposit),
      condition: newCondition,
      image_url: newImageUrl.trim() || 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=700&q=80',
      owner_id: currentUser.email,
      owner_name: currentUser.full_name,
      owner_phone: currentUser.phone,
      house_flat_no: newHouseFlat.trim() || 'Address on file',
      building_street: newStreet.trim() || 'Main Street',
      locality: newLocality.trim() || currentUser.locality || 'Locality',
      pincode: newPincode.trim() || currentUser.pincode || '695001',
      latitude: 8.5241,
      longitude: 76.9366
    };

    try {
      const res = await fetch(`${apiBase}/api/tools`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toolPayload)
      });
      if (res.ok) {
        await fetchTools();
        setShowAddToolModal(false);
        // Reset fields
        setNewTitle('');
        setNewDescription('');
        setNewDailyRate('');
        setNewHourlyRate('');
        setNewDeposit('');
        setNewImageUrl('');
        setNewHouseFlat('');
        setNewStreet('');
      } else {
        const err = await res.json();
        setAddToolError(err.detail || 'Failed to list tool.');
      }
    } catch {
      setAddToolError('Connection error while listing tool.');
    } finally {
      setAddingTool(false);
    }
  };

  // Filtered rentals based on role
  const displayedRentals = rentals.filter((r) => {
    if (!currentUser) return false;
    if (rentalRoleFilter === 'BORROWED') {
      return r.borrower_id?.toLowerCase() === currentUser.email?.toLowerCase();
    }
    if (rentalRoleFilter === 'OWNED') {
      return r.owner_id?.toLowerCase() === currentUser.email?.toLowerCase();
    }
    return true;
  });

  const activeRental = rentals.find((r) => r.id === selectedRentalId) || displayedRentals[0] || null;

  // -------------------------------------------------------------
  // RENDER: AUTHENTICATION SCREEN IF NOT LOGGED IN
  // -------------------------------------------------------------
  if (!currentUser) {
    return (
      <div style={styles.authContainer}>
        <div className="glass-card animate-fade-in" style={styles.authCard}>
          <div style={styles.authHeader}>
            <div style={styles.authLogoIcon}>
              <Repeat size={32} color="#fff" />
            </div>
            <h1 style={styles.authTitle}>BorrowLoop</h1>
            <p style={styles.authSub}>Hyperlocal Tool Exchange & Escrow Handover</p>
          </div>

          <div style={styles.authIntroBox}>
            <ShieldCheck size={20} color="#2dd4bf" />
            <span style={{ fontSize: 13, color: '#e2e8f0', lineHeight: 1.4 }}>
              Sign in with your email to borrow equipment from neighbors or list your tools to earn extra income securely.
            </span>
          </div>

          {authError && (
            <div style={styles.errorBox}>
              <AlertCircle size={16} color="#ef4444" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} style={styles.authForm}>
            <div style={styles.fieldGroup}>
              <label style={styles.fieldLabel}>
                <Mail size={14} color="#0d9488" /> Email Address (Required)
              </label>
              <input 
                type="email"
                placeholder="name@example.com"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                required
                autoFocus
                style={styles.fieldInput}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.fieldLabel}>
                <User size={14} color="#0d9488" /> Your Full Name (Required)
              </label>
              <input 
                type="text"
                placeholder="e.g. Anand Nair or Priya Menon"
                value={authFullName}
                onChange={(e) => setAuthFullName(e.target.value)}
                required
                style={styles.fieldInput}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.fieldLabel}>
                <Phone size={14} color="#0d9488" /> Phone Number (For Handover Calls & WhatsApp)
              </label>
              <input 
                type="tel"
                placeholder="+91 98471 23456"
                value={authPhone}
                onChange={(e) => setAuthPhone(e.target.value)}
                required
                style={styles.fieldInput}
              />
              <span style={{ fontSize: 11, color: '#64748b' }}>
                🔒 Your phone number is masked until an equipment booking is confirmed.
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel}>Locality / Area</label>
                <input 
                  type="text"
                  placeholder="e.g. Kowdiar"
                  value={authLocality}
                  onChange={(e) => setAuthLocality(e.target.value)}
                  style={styles.fieldInput}
                />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel}>Pincode</label>
                <input 
                  type="text"
                  placeholder="e.g. 695003"
                  value={authPincode}
                  onChange={(e) => setAuthPincode(e.target.value)}
                  style={styles.fieldInput}
                />
              </div>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.fieldLabel}>UPI ID (For Rental Payments / Security Deposit Return)</label>
              <input 
                type="text"
                placeholder="e.g. yourname@okaxis"
                value={authUpiId}
                onChange={(e) => setAuthUpiId(e.target.value)}
                style={styles.fieldInput}
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              disabled={authLoading}
              style={{ ...styles.submitBtn, marginTop: 12 }}
            >
              {authLoading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Continue to BorrowLoop <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: MAIN APPLICATION (LOGGED IN USER)
  // -------------------------------------------------------------
  return (
    <div className="app-viewport">
      {/* ================= WEBSITE HEADER ================= */}
      <header style={styles.topHeader}>
        <div style={styles.logoGroup}>
          <div style={styles.logoIcon}>
            <Repeat size={24} color="#fff" />
          </div>
          <div>
            <h1 style={styles.logoTitle}>BorrowLoop</h1>
            <p style={styles.logoSub}>Hyperlocal Tool Exchange & Escrow Handover</p>
          </div>
        </div>

        {/* User Profile & Logout */}
        <div style={styles.headerControls}>
          <div style={styles.userProfilePill} title={`Logged in as ${currentUser.email}`}>
            <UserCheck size={14} color="#2dd4bf" />
            <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#f8fafc' }}>
                {currentUser.full_name}
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>
                {currentUser.email}
              </div>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            style={styles.logoutBtn}
            title="Sign out of BorrowLoop"
          >
            <LogOut size={14} />
            <span className="hidden-mobile">Sign Out</span>
          </button>
        </div>
      </header>

      {/* ================= HIGH-IMPACT HERO BANNER ================= */}
      {activeTab === 'explore' && (
        <div className="glass-card" style={styles.heroBanner}>
          <div style={{ maxWidth: 640 }}>
            <div style={styles.heroPill}>
              <ShieldCheck size={14} color="#2dd4bf" />
              <span>Hyperlocal Community Tool Exchange</span>
            </div>
            <h2 style={styles.heroHeadline}>
              Borrow from Neighbors.<br />Don’t Buy for One Project.
            </h2>
            <p style={styles.heroParagraph}>
              Hyperlocal equipment exchange with geospatial proximity matching, two-way privacy contact shielding, and upfront security deposit collateral held in escrow.
            </p>

            <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
              <button className="btn-primary" onClick={() => setShowAddToolModal(true)}>
                <PlusCircle size={16} />
                List Your Tool (Earn Extra)
              </button>
              <button 
                className="btn-secondary" 
                onClick={() => setActiveTab('rentals')}
              >
                <Repeat size={16} />
                View Handover Tracker ({rentals.length})
              </button>
              {!isMobileApp && (
                <button 
                  className="btn-secondary" 
                  style={{ borderColor: 'rgba(13, 148, 136, 0.4)' }}
                  onClick={() => setActiveTab('apk')}
                >
                  <Smartphone size={16} color="#2dd4bf" />
                  Get Android App
                </button>
              )}
            </div>
          </div>
        </div>
      )}

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
        {!isMobileApp && (
          <button
            onClick={() => setActiveTab('apk')}
            style={activeTab === 'apk' ? styles.tabActive : styles.tabInactive}
          >
            <Smartphone size={16} />
            Android APK Hub
          </button>
        )}
      </nav>

      {/* ================= TAB 1: EXPLORE TOOLS ================= */}
      {activeTab === 'explore' && (
        <section style={{ marginTop: 20 }}>
          {/* Search & Category Filter Controls */}
          <div className="glass-card" style={styles.filterCard}>
            <div style={styles.searchRow}>
              <div style={styles.searchInputWrap}>
                <Search size={18} color="#94a3b8" />
                <input 
                  type="text"
                  placeholder="Search tools by title, brand, or purpose (e.g. drill, saw, ladder)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={styles.searchBox}
                />
              </div>
              <div style={styles.pincodeInputWrap}>
                <MapPin size={16} color="#0d9488" />
                <input 
                  type="text"
                  placeholder="Pincode (e.g. 695003)"
                  value={selectedPincode}
                  onChange={(e) => setSelectedPincode(e.target.value)}
                  style={styles.pincodeBox}
                />
              </div>
            </div>

            {/* Category Pills */}
            <div style={styles.categoryPills}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={selectedCategory === cat ? styles.categoryPillActive : styles.categoryPillInactive}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Tools Grid */}
          <div style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}>
                Available Neighborhood Tools 
                <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 400 }}>({tools.length} found)</span>
              </h3>
              <button 
                className="btn-secondary" 
                onClick={fetchTools} 
                disabled={loadingTools}
                style={{ fontSize: 12, padding: '6px 12px' }}
              >
                <RefreshCw size={13} className={loadingTools ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>

            {tools.length === 0 ? (
              <div className="glass-card" style={styles.emptyStateCard}>
                <div style={styles.emptyIconCircle}>
                  <Wrench size={36} color="#0d9488" />
                </div>
                <h4 style={{ fontSize: 18, color: '#f8fafc', marginBottom: 8 }}>
                  No tools listed yet in this area
                </h4>
                <p style={{ fontSize: 14, color: '#94a3b8', maxWidth: 460, margin: '0 auto 20px', lineHeight: 1.5 }}>
                  Be the first neighbor to list tools or equipment from your garage or shed and start earning rental income securely with escrow protection.
                </p>
                <button className="btn-primary" onClick={() => setShowAddToolModal(true)}>
                  <PlusCircle size={16} />
                  List Your First Tool
                </button>
              </div>
            ) : (
              <div className="tools-grid">
                {tools.map((tool) => {
                  const isMyTool = tool.owner_id?.toLowerCase() === currentUser.email?.toLowerCase();
                  return (
                    <div key={tool.id} className="glass-card" style={styles.toolCard}>
                      <div style={styles.toolImageWrap}>
                        <img 
                          src={tool.image_url || 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=700&q=80'}
                          alt={tool.title}
                          style={styles.toolImage}
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=700&q=80';
                          }}
                        />
                        <span style={styles.categoryBadge}>{tool.category}</span>
                        {isMyTool && (
                          <span style={styles.myToolBadge}>Your Listing</span>
                        )}
                      </div>

                      <div style={styles.toolCardBody}>
                        <h4 style={styles.toolTitle}>{tool.title}</h4>
                        <p style={styles.toolDesc}>{tool.description}</p>

                        {/* Location & Masked Phone */}
                        <div style={styles.metaRow}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#2dd4bf', fontSize: 12 }}>
                            <MapPin size={13} />
                            {tool.distance_label || tool.approx_location}
                          </span>
                        </div>

                        {/* Financial Ledger (Rates & Upfront Escrow Deposit) */}
                        <div style={styles.priceRow}>
                          <div>
                            <div style={styles.dailyPrice}>
                              ₹{tool.daily_rate} <span style={{ fontSize: 12, color: '#94a3b8' }}>/day</span>
                            </div>
                            {tool.hourly_rate && (
                              <div style={{ fontSize: 11, color: '#94a3b8' }}>
                                ₹{tool.hourly_rate}/hour
                              </div>
                            )}
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 11, color: '#94a3b8' }}>Security Escrow</div>
                            <div style={styles.depositPrice}>₹{tool.replacement_deposit}</div>
                          </div>
                        </div>

                        {/* Two-Way Privacy Notice */}
                        <div style={styles.privacyLockNotice}>
                          <Lock size={12} color="#f59e0b" />
                          <span>Address & contact locked until booking accepted</span>
                        </div>

                        {/* Action Button */}
                        <div style={{ marginTop: 14 }}>
                          {isMyTool ? (
                            <button 
                              className="btn-secondary" 
                              style={{ width: '100%', opacity: 0.8, cursor: 'default' }}
                              disabled
                            >
                              <CheckCircle2 size={15} color="#10b981" />
                              You Own This Tool
                            </button>
                          ) : (
                            <button
                              className="btn-primary"
                              style={{ width: '100%' }}
                              onClick={() => {
                                setBookingTool(tool);
                                setBookingError('');
                              }}
                            >
                              <Wrench size={15} />
                              Request to Borrow
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ================= TAB 2: ESCROW & HANDOVER TRACKER ================= */}
      {activeTab === 'rentals' && (
        <section style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h3 style={{ fontSize: 20, color: '#f8fafc', margin: 0 }}>
                Escrow & Handover Tracker
              </h3>
              <p style={{ fontSize: 13, color: '#94a3b8', margin: '4px 0 0 0' }}>
                Two-way contact unmasking, handover milestone verification, and security deposit escrow ledger.
              </p>
            </div>

            {/* Role Filter: Borrowed vs Owned */}
            <div style={styles.roleToggleContainer}>
              <button
                onClick={() => setRentalRoleFilter('ALL')}
                style={rentalRoleFilter === 'ALL' ? styles.roleActiveBtn : styles.roleInactiveBtn}
              >
                All ({rentals.length})
              </button>
              <button
                onClick={() => setRentalRoleFilter('BORROWED')}
                style={rentalRoleFilter === 'BORROWED' ? styles.roleActiveBtn : styles.roleInactiveBtn}
              >
                Borrowed by Me
              </button>
              <button
                onClick={() => setRentalRoleFilter('OWNED')}
                style={rentalRoleFilter === 'OWNED' ? styles.roleActiveBtn : styles.roleInactiveBtn}
              >
                Requests for My Tools
              </button>
            </div>
          </div>

          {displayedRentals.length === 0 ? (
            <div className="glass-card" style={styles.emptyStateCard}>
              <div style={styles.emptyIconCircle}>
                <Repeat size={36} color="#0d9488" />
              </div>
              <h4 style={{ fontSize: 18, color: '#f8fafc', marginBottom: 8 }}>
                No active rentals found
              </h4>
              <p style={{ fontSize: 14, color: '#94a3b8', maxWidth: 440, margin: '0 auto 20px', lineHeight: 1.5 }}>
                {rentalRoleFilter === 'BORROWED' 
                  ? "You haven't requested to borrow any equipment yet. Browse available tools to book one!"
                  : rentalRoleFilter === 'OWNED'
                  ? "No requests have been made for your tools yet. List more equipment to reach more neighbors!"
                  : "No rental bookings found. When you borrow or rent out tools, handover status and escrow tracking appear here."}
              </p>
              <button className="btn-primary" onClick={() => setActiveTab('explore')}>
                <Search size={16} />
                Explore Neighborhood Tools
              </button>
            </div>
          ) : (
            <div style={styles.rentalsLayout}>
              {/* Left Column: Rentals List */}
              <div style={styles.rentalsListCol}>
                {displayedRentals.map((r) => {
                  const isSelected = r.id === activeRental?.id;
                  const isBorrower = r.borrower_id?.toLowerCase() === currentUser.email?.toLowerCase();
                  return (
                    <div
                      key={r.id}
                      onClick={() => setSelectedRentalId(r.id)}
                      className="glass-card"
                      style={isSelected ? styles.rentalCardSelected : styles.rentalCard}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={styles.statusPill(r.status)}>
                          {r.status.replace('_', ' ')}
                        </span>
                        <span style={{ fontSize: 11, color: isBorrower ? '#38bdf8' : '#34d399', fontWeight: 600 }}>
                          {isBorrower ? '👤 Borrower' : '🛠️ Lender'}
                        </span>
                      </div>

                      <h4 style={{ fontSize: 15, color: '#f8fafc', margin: '8px 0 4px' }}>
                        {r.tool_title}
                      </h4>
                      <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>
                        {isBorrower ? `Owner: ${r.owner_name}` : `Borrower: ${r.borrower_name}`}
                      </p>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 12, color: '#cbd5e1' }}>
                        <span>₹{r.total_amount} (₹{r.security_deposit} Escrow)</span>
                        <span>{r.duration_days} day(s)</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Active Rental Detailed Handover & Escrow Console */}
              {activeRental && (
                <div className="glass-card" style={styles.rentalDetailCard}>
                  {/* Status Banner */}
                  <div style={styles.detailHeader}>
                    <div>
                      <span style={styles.statusPill(activeRental.status)}>
                        {activeRental.status.replace('_', ' ')}
                      </span>
                      <h3 style={{ fontSize: 20, color: '#f8fafc', margin: '10px 0 4px' }}>
                        {activeRental.tool_title}
                      </h3>
                      <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>
                        Booking ID #{activeRental.id} • {activeRental.duration_days} Day(s) • {activeRental.start_date} to {activeRental.end_date}
                      </p>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>Total Handover Escrow</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: '#10b981' }}>
                        ₹{activeRental.total_amount}
                      </div>
                      <div style={{ fontSize: 11, color: '#38bdf8' }}>
                        (Rental: ₹{activeRental.rental_fee} + Deposit: ₹{activeRental.security_deposit})
                      </div>
                    </div>
                  </div>

                  {/* TWO-WAY UNMASKING / CONTACT BOX */}
                  <div style={styles.unmaskedSection}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      {activeRental.is_contact_unmasked ? (
                        <>
                          <Unlock size={18} color="#10b981" />
                          <strong style={{ fontSize: 15, color: '#10b981' }}>
                            Handover Contact & Coordinates Unmasked
                          </strong>
                        </>
                      ) : (
                        <>
                          <Lock size={18} color="#f59e0b" />
                          <strong style={{ fontSize: 15, color: '#fbbf24' }}>
                            Two-Way Privacy Shield Active
                          </strong>
                        </>
                      )}
                    </div>

                    {activeRental.is_contact_unmasked ? (
                      <div style={styles.unmaskedContentGrid}>
                        {/* Lender Details for Borrower */}
                        <div style={styles.contactCard}>
                          <span style={{ fontSize: 11, textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700 }}>
                            Equipment Owner / Handover Location
                          </span>
                          <div style={{ fontSize: 15, fontWeight: 700, color: '#f8fafc', marginTop: 4 }}>
                            {activeRental.owner_name}
                          </div>
                          <div style={{ fontSize: 13, color: '#cbd5e1', marginTop: 4 }}>
                            📍 {activeRental.owner_exact_address || 'Exact address unmasked'}
                          </div>
                          <div style={{ fontSize: 13, color: '#2dd4bf', marginTop: 4 }}>
                            📞 {activeRental.owner_full_phone}
                          </div>

                          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                            {activeRental.owner_direct_call_url && (
                              <a href={activeRental.owner_direct_call_url} className="btn-primary" style={styles.actionBtnSm}>
                                <PhoneCall size={14} /> Call Owner
                              </a>
                            )}
                            {activeRental.owner_whatsapp_url && (
                              <a href={activeRental.owner_whatsapp_url} target="_blank" rel="noreferrer" className="btn-success" style={styles.actionBtnSm}>
                                <MessageCircle size={14} /> WhatsApp
                              </a>
                            )}
                            {activeRental.google_maps_nav_url && (
                              <a href={activeRental.google_maps_nav_url} target="_blank" rel="noreferrer" className="btn-secondary" style={styles.actionBtnSm}>
                                <Navigation size={14} /> Google Maps
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Borrower Details for Lender */}
                        <div style={styles.contactCard}>
                          <span style={{ fontSize: 11, textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700 }}>
                            Borrower Details
                          </span>
                          <div style={{ fontSize: 15, fontWeight: 700, color: '#f8fafc', marginTop: 4 }}>
                            {activeRental.borrower_name}
                          </div>
                          <div style={{ fontSize: 13, color: '#2dd4bf', marginTop: 4 }}>
                            📞 {activeRental.borrower_phone}
                          </div>
                          {activeRental.borrower_whatsapp_url && (
                            <div style={{ marginTop: 12 }}>
                              <a href={activeRental.borrower_whatsapp_url} target="_blank" rel="noreferrer" className="btn-success" style={styles.actionBtnSm}>
                                <MessageCircle size={14} /> WhatsApp Borrower
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p style={{ fontSize: 13, color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
                        Both parties' phone numbers and exact pickup address remain encrypted and locked. As soon as the tool owner accepts this request, phone numbers, WhatsApp links, and Google Maps directions will be instantly unmasked.
                      </p>
                    )}
                  </div>

                  {/* LIFECYCLE ACTION BUTTONS */}
                  <div style={styles.lifecycleActions}>
                    {/* Owner Accept */}
                    {activeRental.owner_id?.toLowerCase() === currentUser.email?.toLowerCase() && activeRental.status === 'REQUESTED' && (
                      <button 
                        className="btn-success"
                        onClick={() => handleRentalAction(activeRental.id, 'accept')}
                        disabled={actionLoading}
                        style={{ width: '100%' }}
                      >
                        <CheckCircle size={16} />
                        Accept Booking & Unmask My Address
                      </button>
                    )}

                    {/* Owner Confirm Handover */}
                    {activeRental.owner_id?.toLowerCase() === currentUser.email?.toLowerCase() && activeRental.status === 'ACCEPTED' && (
                      <button 
                        className="btn-primary"
                        onClick={() => handleRentalAction(activeRental.id, 'confirm_pickup', { payment_received: true })}
                        disabled={actionLoading}
                        style={{ width: '100%' }}
                      >
                        <ShieldCheck size={16} />
                        Confirm Tool Handover & Escrow Deposit Received
                      </button>
                    )}

                    {/* Borrower Return */}
                    {activeRental.borrower_id?.toLowerCase() === currentUser.email?.toLowerCase() && activeRental.status === 'ACTIVE_RENTAL' && (
                      <div style={styles.infoBanner}>
                        <Clock size={16} color="#38bdf8" />
                        <span>Rental active. Return equipment to owner before {activeRental.end_date}.</span>
                      </div>
                    )}

                    {/* Owner Confirm Return & Refund */}
                    {activeRental.owner_id?.toLowerCase() === currentUser.email?.toLowerCase() && activeRental.status === 'ACTIVE_RENTAL' && (
                      <button 
                        className="btn-success"
                        onClick={() => handleRentalAction(activeRental.id, 'confirm_return', { inspection_passed: true, refund_deposited: true })}
                        disabled={actionLoading}
                        style={{ width: '100%' }}
                      >
                        <CheckCircle2 size={16} />
                        Confirm Tool Return & Release Escrow Deposit (₹{activeRental.security_deposit})
                      </button>
                    )}

                    {activeRental.status === 'COMPLETED' && (
                      <div style={styles.completedBanner}>
                        <CheckCircle2 size={20} color="#10b981" />
                        <div>
                          <strong>Handover Protocol Successfully Completed</strong>
                          <div style={{ fontSize: 12, color: '#cbd5e1', marginTop: 2 }}>
                            Tool returned in good condition. Security deposit collateral of ₹{activeRental.security_deposit} has been released.
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* ================= TAB 3: ANDROID APK HUB (Web Visitors Only) ================= */}
      {activeTab === 'apk' && !isMobileApp && (
        <section style={{ marginTop: 20 }}>
          <div className="glass-card" style={styles.apkHubCard}>
            <div style={styles.apkIconLarge}>
              <Smartphone size={40} color="#0d9488" />
            </div>
            <h3 style={{ fontSize: 24, color: '#f8fafc', marginBottom: 8 }}>
              BorrowLoop Android APK Hub
            </h3>
            <p style={{ fontSize: 14, color: '#94a3b8', maxWidth: 540, margin: '0 auto 24px', lineHeight: 1.5 }}>
              BorrowLoop is built as a universal platform. You can use it right now in your web browser, or download and install the standalone native Android application.
            </p>

            <div style={styles.apkStatusBox}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: '#cbd5e1' }}>Build Status:</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#10b981', background: 'rgba(16, 185, 129, 0.15)', padding: '4px 10px', borderRadius: 20 }}>
                  Ready for Download
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                <span style={{ fontSize: 13, color: '#cbd5e1' }}>File Size:</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#38bdf8' }}>
                  {apkStatus?.file_size_mb || '4.12'} MB
                </span>
              </div>
            </div>

            <div style={{ marginTop: 24 }}>
              <a
                href={`${apiBase}${apkStatus?.download_url || '/download/BorrowLoop-v1.0.apk'}`}
                download="BorrowLoop-v1.0.apk"
                className="btn-primary"
                style={styles.apkDownloadBigBtn}
              >
                <Download size={20} />
                Download Standalone APK ({apkStatus?.file_size_mb || '4.12'} MB)
              </a>
            </div>

            <div style={styles.installInstructions}>
              <h4 style={{ fontSize: 15, color: '#f8fafc', marginBottom: 10 }}>
                📲 Quick Installation Instructions:
              </h4>
              <ol style={{ textAlign: 'left', fontSize: 13, color: '#cbd5e1', paddingLeft: 20, lineHeight: 1.6 }}>
                <li>Download the <code>BorrowLoop-v1.0.apk</code> file above.</li>
                <li>Tap the downloaded file on your Android device.</li>
                <li>If prompted, allow "Install Unknown Apps" for your browser.</li>
                <li>Tap Install and launch BorrowLoop!</li>
              </ol>
            </div>
          </div>
        </section>
      )}

      {/* ================= MODAL: REQUEST TO BORROW ================= */}
      {bookingTool && (
        <div style={styles.modalOverlay}>
          <div className="glass-card animate-fade-in" style={styles.modalCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Wrench size={18} color="#0d9488" />
                Request Equipment Rental
              </h3>
              <button onClick={() => setBookingTool(null)} style={styles.closeBtn}>✕</button>
            </div>

            <div style={styles.modalToolSummary}>
              <img 
                src={bookingTool.image_url || 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=700&q=80'} 
                alt={bookingTool.title}
                style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover' }}
              />
              <div>
                <h4 style={{ fontSize: 14, color: '#f8fafc', margin: 0 }}>{bookingTool.title}</h4>
                <div style={{ fontSize: 12, color: '#2dd4bf', marginTop: 2 }}>{bookingTool.approx_location}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Daily Rate: ₹{bookingTool.daily_rate}</div>
              </div>
            </div>

            {bookingError && (
              <div style={styles.errorBox}>
                <AlertCircle size={16} color="#ef4444" />
                <span>{bookingError}</span>
              </div>
            )}

            {bookingSuccess && (
              <div style={styles.successBox}>
                <CheckCircle2 size={16} color="#10b981" />
                <span>Rental request submitted! Forwarding to Escrow Tracker...</span>
              </div>
            )}

            <form onSubmit={handleCreateBooking} style={{ marginTop: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={styles.fieldGroup}>
                  <label style={styles.fieldLabel}>Start Date</label>
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    style={styles.fieldInput}
                  />
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.fieldLabel}>End Date</label>
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    style={styles.fieldInput}
                  />
                </div>
              </div>

              {/* Escrow Calculation Preview */}
              <div style={styles.escrowCalcBox}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#cbd5e1' }}>
                  <span>Rental Duration:</span>
                  <span>
                    {Math.max(1, Math.round((new Date(endDate) - new Date(startDate)) / 86400000) + 1)} Day(s)
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#cbd5e1', marginTop: 6 }}>
                  <span>Rental Fee:</span>
                  <span>₹{bookingTool.daily_rate * Math.max(1, Math.round((new Date(endDate) - new Date(startDate)) / 86400000) + 1)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#cbd5e1', marginTop: 6 }}>
                  <span>Security Collateral (Escrow Hold):</span>
                  <span>₹{bookingTool.replacement_deposit}</span>
                </div>
                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 700, color: '#10b981' }}>
                  <span>Total Escrow Amount:</span>
                  <span>
                    ₹{(bookingTool.daily_rate * Math.max(1, Math.round((new Date(endDate) - new Date(startDate)) / 86400000) + 1)) + bookingTool.replacement_deposit}
                  </span>
                </div>
              </div>

              <div style={{ marginTop: 14 }}>
                <label style={styles.fieldLabel}>Borrower Contact (Your Profile)</label>
                <div style={{ fontSize: 13, color: '#94a3b8', background: '#131b2e', padding: '10px 14px', borderRadius: 8 }}>
                  <strong>{currentUser.full_name}</strong> • {currentUser.email} • {currentUser.phone}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button type="button" className="btn-secondary" onClick={() => setBookingTool(null)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={actionLoading} style={{ flex: 2 }}>
                  {actionLoading ? 'Submitting...' : 'Confirm Rental Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: LIST A TOOL ================= */}
      {showAddToolModal && (
        <div style={styles.modalOverlay}>
          <div className="glass-card animate-fade-in" style={styles.modalCardLarge}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <PlusCircle size={18} color="#0d9488" />
                List Equipment for Rent
              </h3>
              <button onClick={() => setShowAddToolModal(false)} style={styles.closeBtn}>✕</button>
            </div>

            {addToolError && (
              <div style={styles.errorBox}>
                <AlertCircle size={16} color="#ef4444" />
                <span>{addToolError}</span>
              </div>
            )}

            <form onSubmit={handleAddNewTool} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel}>Equipment Title *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Bosch GBH 2-26 Rotary Hammer Drill Set"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  style={styles.fieldInput}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={styles.fieldGroup}>
                  <label style={styles.fieldLabel}>Category</label>
                  <select 
                    value={newCategory} 
                    onChange={(e) => setNewCategory(e.target.value)}
                    style={styles.fieldInput}
                  >
                    {categories.filter(c => c !== 'All').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.fieldLabel}>Condition</label>
                  <select 
                    value={newCondition} 
                    onChange={(e) => setNewCondition(e.target.value)}
                    style={styles.fieldInput}
                  >
                    <option value="Pristine (Like New)">Pristine (Like New)</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Good & Sturdy">Good & Sturdy</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div style={styles.fieldGroup}>
                  <label style={styles.fieldLabel}>Daily Rate (₹) *</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 400"
                    value={newDailyRate}
                    onChange={(e) => setNewDailyRate(e.target.value)}
                    required
                    style={styles.fieldInput}
                  />
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.fieldLabel}>Hourly Rate (₹)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 70"
                    value={newHourlyRate}
                    onChange={(e) => setNewHourlyRate(e.target.value)}
                    style={styles.fieldInput}
                  />
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.fieldLabel}>Deposit Collateral (₹) *</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 8000"
                    value={newDeposit}
                    onChange={(e) => setNewDeposit(e.target.value)}
                    required
                    style={styles.fieldInput}
                  />
                </div>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel}>Description & Included Accessories</label>
                <textarea 
                  rows={3}
                  placeholder="Mention drill bits, batteries, carrying case, safety precautions..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  style={{ ...styles.fieldInput, resize: 'vertical' }}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel}>Photo URL (Optional)</label>
                <input 
                  type="url" 
                  placeholder="https://images.unsplash.com/photo-..."
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  style={styles.fieldInput}
                />
              </div>

              {/* Handover Address (Privacy Shielded) */}
              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#f8fafc', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Lock size={14} color="#f59e0b" />
                  Pickup Address (Privacy-Shielded until Booking Acceptance)
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 10 }}>
                  This address is never shown publicly. Only neighbors whose requests you accept will receive this.
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <input 
                    type="text" 
                    placeholder="House / Flat No."
                    value={newHouseFlat}
                    onChange={(e) => setNewHouseFlat(e.target.value)}
                    style={styles.fieldInput}
                  />
                  <input 
                    type="text" 
                    placeholder="Building / Street"
                    value={newStreet}
                    onChange={(e) => setNewStreet(e.target.value)}
                    style={styles.fieldInput}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
                  <input 
                    type="text" 
                    placeholder="Locality"
                    value={newLocality}
                    onChange={(e) => setNewLocality(e.target.value)}
                    style={styles.fieldInput}
                  />
                  <input 
                    type="text" 
                    placeholder="Pincode"
                    value={newPincode}
                    onChange={(e) => setNewPincode(e.target.value)}
                    style={styles.fieldInput}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAddToolModal(false)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={addingTool} style={{ flex: 2 }}>
                  {addingTool ? 'Listing Tool...' : 'Publish Equipment Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MOBILE BOTTOM NAVIGATION ================= */}
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
          <span>Tracker</span>
          {rentals.length > 0 && (
            <span style={styles.mobileNavBadge}>{rentals.length}</span>
          )}
        </button>
        <button 
          onClick={() => setShowAddToolModal(true)}
          className="nav-item-btn"
        >
          <PlusCircle size={18} color="#2dd4bf" />
          <span>List Tool</span>
        </button>
        {!isMobileApp && (
          <button 
            onClick={() => setActiveTab('apk')}
            className={`nav-item-btn ${activeTab === 'apk' ? 'active' : ''}`}
          >
            <Smartphone size={18} />
            <span>APK</span>
          </button>
        )}
      </nav>
    </div>
  );
}

// -------------------------------------------------------------
// STYLES
// -------------------------------------------------------------
const styles = {
  authContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
    background: 'radial-gradient(circle at 50% 20%, rgba(13, 148, 136, 0.15) 0%, transparent 60%)'
  },
  authCard: {
    width: '100%',
    maxWidth: 480,
    padding: '32px 28px',
    borderRadius: 16
  },
  authHeader: {
    textAlign: 'center',
    marginBottom: 20
  },
  authLogoIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    background: 'linear-gradient(135deg, #0d9488, #059669)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 24px rgba(13, 148, 136, 0.4)',
    marginBottom: 12
  },
  authTitle: {
    fontSize: 26,
    fontWeight: 800,
    color: '#f8fafc',
    margin: 0
  },
  authSub: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4
  },
  authIntroBox: {
    background: 'rgba(13, 148, 136, 0.1)',
    border: '1px solid rgba(13, 148, 136, 0.25)',
    borderRadius: 10,
    padding: '12px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20
  },
  authForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: '#cbd5e1',
    display: 'flex',
    alignItems: 'center',
    gap: 6
  },
  fieldInput: {
    width: '100%',
    boxSizing: 'border-box'
  },
  submitBtn: {
    padding: '12px 20px',
    fontSize: 15,
    borderRadius: 8
  },
  topHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '18px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    flexWrap: 'wrap',
    gap: 12
  },
  logoGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 12
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    background: 'linear-gradient(135deg, #0d9488, #059669)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 14px rgba(13, 148, 136, 0.4)'
  },
  logoTitle: {
    fontSize: 20,
    fontWeight: 800,
    color: '#f8fafc',
    margin: 0
  },
  logoSub: {
    fontSize: 12,
    color: '#94a3b8',
    margin: 0
  },
  headerControls: {
    display: 'flex',
    alignItems: 'center',
    gap: 10
  },
  userProfilePill: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: '6px 14px'
  },
  logoutBtn: {
    background: 'rgba(239, 68, 68, 0.12)',
    color: '#f87171',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    padding: '7px 12px',
    borderRadius: 8,
    fontSize: 12
  },
  heroBanner: {
    padding: '32px 28px',
    marginTop: 20,
    borderRadius: 16,
    background: 'linear-gradient(135deg, rgba(13, 25, 48, 0.95), rgba(13, 148, 136, 0.15))',
    border: '1px solid rgba(13, 148, 136, 0.3)'
  },
  heroPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: 'rgba(13, 148, 136, 0.2)',
    color: '#2dd4bf',
    padding: '4px 12px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    marginBottom: 12
  },
  heroHeadline: {
    fontSize: 28,
    lineHeight: 1.25,
    color: '#f8fafc',
    margin: '0 0 10px'
  },
  heroParagraph: {
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 1.6,
    margin: 0
  },
  desktopTabNav: {
    display: 'flex',
    gap: 8,
    marginTop: 20,
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    paddingBottom: 12
  },
  tabActive: {
    background: 'rgba(13, 148, 136, 0.2)',
    color: '#2dd4bf',
    border: '1px solid rgba(13, 148, 136, 0.4)',
    padding: '10px 18px',
    borderRadius: 8,
    position: 'relative'
  },
  tabInactive: {
    background: 'transparent',
    color: '#94a3b8',
    border: '1px solid transparent',
    padding: '10px 18px',
    borderRadius: 8
  },
  tabBadge: {
    background: '#0d9488',
    color: '#fff',
    fontSize: 10,
    padding: '2px 6px',
    borderRadius: 10,
    marginLeft: 6
  },
  filterCard: {
    padding: '16px 20px',
    borderRadius: 12
  },
  searchRow: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap'
  },
  searchInputWrap: {
    flex: '1 1 280px',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: '#131b2e',
    borderRadius: 8,
    padding: '0 12px',
    border: '1px solid rgba(255, 255, 255, 0.08)'
  },
  searchBox: {
    border: 'none',
    background: 'transparent',
    padding: '10px 0',
    flex: 1
  },
  pincodeInputWrap: {
    width: '180px',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: '#131b2e',
    borderRadius: 8,
    padding: '0 12px',
    border: '1px solid rgba(255, 255, 255, 0.08)'
  },
  pincodeBox: {
    border: 'none',
    background: 'transparent',
    padding: '10px 0',
    width: '100%'
  },
  categoryPills: {
    display: 'flex',
    gap: 8,
    overflowX: 'auto',
    paddingTop: 14
  },
  categoryPillActive: {
    background: '#0d9488',
    color: '#fff',
    padding: '6px 14px',
    fontSize: 12,
    borderRadius: 20,
    whiteSpace: 'nowrap'
  },
  categoryPillInactive: {
    background: 'rgba(255, 255, 255, 0.05)',
    color: '#94a3b8',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '6px 14px',
    fontSize: 12,
    borderRadius: 20,
    whiteSpace: 'nowrap'
  },
  toolCard: {
    overflow: 'hidden',
    borderRadius: 14,
    display: 'flex',
    flexDirection: 'column'
  },
  toolImageWrap: {
    position: 'relative',
    height: 180,
    background: '#131b2e'
  },
  toolImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  categoryBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    background: 'rgba(10, 14, 23, 0.85)',
    backdropFilter: 'blur(8px)',
    color: '#2dd4bf',
    fontSize: 11,
    fontWeight: 600,
    padding: '4px 10px',
    borderRadius: 12
  },
  myToolBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    background: 'rgba(16, 185, 129, 0.9)',
    color: '#fff',
    fontSize: 11,
    fontWeight: 700,
    padding: '4px 10px',
    borderRadius: 12
  },
  toolCardBody: {
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    flex: 1
  },
  toolTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#f8fafc',
    margin: '0 0 6px',
    lineHeight: 1.3
  },
  toolDesc: {
    fontSize: 12,
    color: '#94a3b8',
    margin: '0 0 12px',
    lineHeight: 1.5,
    flex: 1
  },
  metaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  priceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    background: 'rgba(255, 255, 255, 0.03)',
    padding: '8px 12px',
    borderRadius: 8,
    marginBottom: 10
  },
  dailyPrice: {
    fontSize: 18,
    fontWeight: 800,
    color: '#f8fafc'
  },
  depositPrice: {
    fontSize: 14,
    fontWeight: 700,
    color: '#38bdf8'
  },
  privacyLockNotice: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 11,
    color: '#fbbf24',
    background: 'rgba(245, 158, 11, 0.08)',
    padding: '6px 10px',
    borderRadius: 6
  },
  emptyStateCard: {
    textAlign: 'center',
    padding: '48px 24px',
    borderRadius: 16
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: '50%',
    background: 'rgba(13, 148, 136, 0.12)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  roleToggleContainer: {
    display: 'flex',
    gap: 4,
    background: 'rgba(255, 255, 255, 0.05)',
    padding: 4,
    borderRadius: 8
  },
  roleActiveBtn: {
    background: '#0d9488',
    color: '#fff',
    fontSize: 12,
    padding: '6px 14px',
    borderRadius: 6
  },
  roleInactiveBtn: {
    background: 'transparent',
    color: '#94a3b8',
    fontSize: 12,
    padding: '6px 14px',
    borderRadius: 6
  },
  rentalsLayout: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: 18
  },
  rentalsListCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10
  },
  rentalCard: {
    padding: 14,
    borderRadius: 10,
    cursor: 'pointer'
  },
  rentalCardSelected: {
    padding: 14,
    borderRadius: 10,
    cursor: 'pointer',
    border: '1px solid #0d9488',
    background: 'rgba(13, 148, 136, 0.12)'
  },
  rentalDetailCard: {
    padding: 24,
    borderRadius: 14,
    display: 'flex',
    flexDirection: 'column',
    gap: 20
  },
  detailHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    paddingBottom: 16,
    flexWrap: 'wrap',
    gap: 12
  },
  unmaskedSection: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 16
  },
  unmaskedContentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: 12
  },
  contactCard: {
    background: '#131b2e',
    borderRadius: 10,
    padding: 14,
    border: '1px solid rgba(255, 255, 255, 0.06)'
  },
  actionBtnSm: {
    fontSize: 12,
    padding: '6px 12px',
    borderRadius: 6,
    textDecoration: 'none'
  },
  lifecycleActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10
  },
  infoBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'rgba(56, 189, 248, 0.1)',
    color: '#38bdf8',
    padding: '12px 16px',
    borderRadius: 8,
    fontSize: 13
  },
  completedBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    background: 'rgba(16, 185, 129, 0.12)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    color: '#10b981',
    padding: '14px 18px',
    borderRadius: 10
  },
  apkHubCard: {
    textAlign: 'center',
    padding: '40px 24px',
    borderRadius: 16
  },
  apkIconLarge: {
    width: 72,
    height: 72,
    borderRadius: 20,
    background: 'rgba(13, 148, 136, 0.12)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  apkStatusBox: {
    maxWidth: 380,
    margin: '0 auto',
    background: '#131b2e',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: '14px 18px'
  },
  apkDownloadBigBtn: {
    display: 'inline-flex',
    textDecoration: 'none',
    padding: '14px 28px',
    fontSize: 16,
    borderRadius: 10,
    boxShadow: '0 8px 24px rgba(13, 148, 136, 0.4)'
  },
  installInstructions: {
    maxWidth: 440,
    margin: '28px auto 0',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: 10,
    padding: '16px 20px'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    zIndex: 999
  },
  modalCard: {
    width: '100%',
    maxWidth: 500,
    padding: 24,
    borderRadius: 14,
    maxHeight: '90vh',
    overflowY: 'auto'
  },
  modalCardLarge: {
    width: '100%',
    maxWidth: 620,
    padding: 24,
    borderRadius: 14,
    maxHeight: '90vh',
    overflowY: 'auto'
  },
  modalToolSummary: {
    display: 'flex',
    gap: 12,
    background: '#131b2e',
    padding: 12,
    borderRadius: 10,
    marginBottom: 14
  },
  escrowCalcBox: {
    background: '#131b2e',
    borderRadius: 10,
    padding: 14,
    marginTop: 12,
    border: '1px solid rgba(255, 255, 255, 0.06)'
  },
  closeBtn: {
    background: 'transparent',
    color: '#94a3b8',
    fontSize: 18,
    padding: '4px 8px'
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'rgba(239, 68, 68, 0.12)',
    color: '#ef4444',
    padding: '10px 14px',
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 12
  },
  successBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'rgba(16, 185, 129, 0.12)',
    color: '#10b981',
    padding: '10px 14px',
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 12
  },
  mobileNavBadge: {
    position: 'absolute',
    top: 4,
    right: 18,
    background: '#0d9488',
    color: '#fff',
    fontSize: 9,
    padding: '1px 5px',
    borderRadius: 10
  },
  statusPill: (status) => {
    switch (status) {
      case 'ACCEPTED':
        return {
          background: 'rgba(56, 189, 248, 0.15)',
          color: '#38bdf8',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          fontSize: 11,
          fontWeight: 700,
          padding: '3px 9px',
          borderRadius: 20
        };
      case 'ACTIVE_RENTAL':
        return {
          background: 'rgba(16, 185, 129, 0.15)',
          color: '#34d399',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          fontSize: 11,
          fontWeight: 700,
          padding: '3px 9px',
          borderRadius: 20
        };
      case 'COMPLETED':
        return {
          background: 'rgba(168, 85, 247, 0.15)',
          color: '#c084fc',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          fontSize: 11,
          fontWeight: 700,
          padding: '3px 9px',
          borderRadius: 20
        };
      default:
        return {
          background: 'rgba(245, 158, 11, 0.15)',
          color: '#fbbf24',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          fontSize: 11,
          fontWeight: 700,
          padding: '3px 9px',
          borderRadius: 20
        };
    }
  }
};
