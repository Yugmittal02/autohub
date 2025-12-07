import React, { useState, useEffect } from "react";

// === 1. LOCK SCREEN COMPONENT ===
const LockScreen = ({ onUnlock }) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    // LocalStorage se saved PIN nikalo (Default: 1234)
    const storedPin = localStorage.getItem("appPin") || "1234";

    if (pin === storedPin) {
      onUnlock(); // App unlock function call karo
    } else {
      setError("❌ Incorrect PIN!");
      setPin("");
    }
  };

  return (
    <div style={styles.lockContainer}>
      <h1 style={{ fontSize: "50px" }}>🔒</h1>
      <h2>Security Check</h2>
      <p>Enter PIN to access Dashboard</p>
      
      <input
        type="password"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        placeholder="Enter PIN"
        maxLength={4}
        style={styles.input}
        onKeyPress={(e) => e.key === "Enter" && handleLogin()}
      />
      
      <button onClick={handleLogin} style={styles.btnDanger}>
        UNLOCK
      </button>
      
      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
    </div>
  );
};

// === 2. MAIN APP COMPONENT ===
const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Settings State
  const [newPin, setNewPin] = useState("");

  // Check on mount (Optional: agar pehle se login session rakhna ho)
  useEffect(() => {
    if (!localStorage.getItem("appPin")) {
      localStorage.setItem("appPin", "1234"); // Default Setup
    }
    // Agar notifications ki permission mangni ho start mai
    if ("Notification" in window && Notification.permission !== "granted") {
        Notification.requestPermission();
    }
  }, []);

  // --- Handlers ---
  
  const handleLogout = () => {
    setIsAuthenticated(false); // Lock screen wapis lao
    setNewPin("");
  };

  const changePassword = () => {
    if (newPin.length < 4) {
      alert("PIN must be 4 digits");
      return;
    }
    localStorage.setItem("appPin", newPin);
    alert("✅ Success! Password Changed.");
    setNewPin("");
  };

  const sendTestNotification = () => {
    if (!("Notification" in window)) {
      alert("Browser does not support notifications");
      return;
    }

    if (Notification.permission === "granted") {
      // 1. Play Sound
      const audio = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
      audio.play().catch(e => console.log("Interaction required for audio"));

      // 2. Show Notification
      new Notification("New Order 📦", {
        body: "Customer ordered Alloy Wheels x4",
        icon: "https://cdn-icons-png.flaticon.com/512/3202/3202926.png",
        vibrate: [200, 100, 200]
      });
    } else {
      Notification.requestPermission();
    }
  };

  // --- Conditional Rendering ---
  if (!isAuthenticated) {
    return <LockScreen onUnlock={() => setIsAuthenticated(true)} />;
  }

  return (
    <div style={styles.appContainer}>
      
      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <h2 style={{ color: "#e94560", marginBottom: "30px" }}>🚗 AutoParts</h2>
        
        <div 
          style={activeTab === 'dashboard' ? styles.menuActive : styles.menuItem} 
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </div>
        
        <div 
          style={activeTab === 'orders' ? styles.menuActive : styles.menuItem} 
          onClick={() => setActiveTab('orders')}
        >
          🛒 Orders
        </div>
        
        <div 
          style={activeTab === 'settings' ? styles.menuActive : styles.menuItem} 
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ Settings
        </div>

        <button onClick={handleLogout} style={{ ...styles.menuItem, marginTop: "auto", background: "#c72c41" }}>
          🔒 Lock App
        </button>
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={styles.mainContent}>
        
        {/* VIEW: DASHBOARD */}
        {activeTab === "dashboard" && (
          <div>
            <h1>Dashboard Overview</h1>
            <p>Welcome, Yug Mittal</p>
            <div style={styles.cardGrid}>
              <div style={styles.card}>
                <h3>TOTAL SALES</h3>
                <h2>₹ 1,25,000</h2>
              </div>
              <div style={styles.card}>
                <h3>NEW ORDERS</h3>
                <h2>12</h2>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: ORDERS */}
        {activeTab === "orders" && (
          <div>
            <h1>Recent Orders</h1>
            <div style={styles.card}>
              <p>1. Alloy Wheels (Pending)</p>
              <hr />
              <p>2. LED Headlights (Shipped)</p>
            </div>
          </div>
        )}

        {/* VIEW: SETTINGS */}
        {activeTab === "settings" && (
          <div>
            <h1>Settings</h1>
            
            {/* Password Change */}
            <div style={styles.card}>
              <h3>🔐 Change Security PIN</h3>
              <input 
                type="password" 
                placeholder="New 4-digit PIN"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                maxLength={4}
                style={{...styles.input, width: "100%", marginTop: "10px"}}
              />
              <button onClick={changePassword} style={styles.btnPrimary}>
                Update PIN
              </button>
            </div>

            {/* Notifications */}
            <div style={{...styles.card, marginTop: "20px"}}>
              <h3>🔔 Test Notifications</h3>
              <p>Click below to test sound & popup.</p>
              <button onClick={sendTestNotification} style={styles.btnSuccess}>
                Send Test Alert
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

// === 3. SIMPLE CSS IN JS (Styles) ===
const styles = {
  lockContainer: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a2e",
    color: "white",
  },
  appContainer: {
    display: "flex",
    height: "100vh",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f4f6f9",
  },
  sidebar: {
    width: "250px",
    backgroundColor: "#16213e",
    color: "white",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
  },
  mainContent: {
    flex: 1,
    padding: "30px",
    overflowY: "auto",
  },
  menuItem: {
    padding: "15px",
    cursor: "pointer",
    borderRadius: "5px",
    marginBottom: "5px",
    transition: "0.3s",
  },
  menuActive: {
    padding: "15px",
    cursor: "pointer",
    borderRadius: "5px",
    marginBottom: "5px",
    backgroundColor: "#0f3460",
    fontWeight: "bold",
  },
  input: {
    padding: "10px",
    fontSize: "18px",
    textAlign: "center",
    borderRadius: "5px",
    border: "none",
    marginTop: "15px",
    marginBottom: "15px",
  },
  btnDanger: {
    padding: "10px 20px",
    background: "#e94560",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
  },
  btnPrimary: {
    padding: "10px 20px",
    background: "#16213e",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginTop: "10px",
  },
  btnSuccess: {
    padding: "10px 20px",
    background: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginTop: "10px",
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginTop: "20px",
  },
  card: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  },
};

export default App;
