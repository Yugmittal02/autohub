import React, { useState, useEffect } from "react";

// === 1. LOCK SCREEN COMPONENT ===
const LockScreen = ({ onUnlock }) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    const storedPin = localStorage.getItem("appPin") || "1234";
    if (pin === storedPin) {
      onUnlock();
    } else {
      setError("❌ Incorrect PIN!");
      setPin("");
    }
  };

  return (
    <div style={styles.lockContainer}>
      <h1>🔒 Security Check</h1>
      <p>Default PIN: 1234</p>
      <input
        type="password"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        placeholder="Enter PIN"
        maxLength={4}
        style={styles.input}
      />
      <button onClick={handleLogin} style={styles.btnDanger}>UNLOCK SYSTEM</button>
      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
    </div>
  );
};

// === 2. MAIN APP COMPONENT ===
const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [newPin, setNewPin] = useState("");
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  // --- Initial Setup ---
  useEffect(() => {
    // 1. PWA Install Event Listener
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log("Install Prompt Saved");
    });

    // 2. Notification Permission
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // --- Functions ---
  const changePassword = () => {
    if (newPin.length < 4) return alert("PIN must be 4 digits");
    localStorage.setItem("appPin", newPin);
    alert("✅ Password Changed Successfully!");
    setNewPin("");
  };

  const sendNotification = () => {
    if (Notification.permission === "granted") {
      // Sound
      const audio = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
      audio.play().catch(e => console.log("Audio requires interaction first"));
      
      // Popup
      new Notification("New Order 📦", {
        body: "Customer ordered 4x Alloy Wheels",
        icon: "favicon.ico"
      });
    } else {
      Notification.requestPermission();
    }
  };

  const installApp = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choice) => {
        if (choice.outcome === 'accepted') {
          console.log('User installed the app');
        }
        setDeferredPrompt(null);
      });
    } else {
      alert("App is already installed or browser doesn't support this.");
    }
  };

  // --- Render ---
  if (!isAuthenticated) return <LockScreen onUnlock={() => setIsAuthenticated(true)} />;

  return (
    <div style={styles.appContainer}>
      
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <h2 style={{ color: "#e94560", marginBottom: "30px" }}>🚗 AutoParts</h2>
        <div style={activeTab === 'dashboard' ? styles.menuActive : styles.menuItem} onClick={() => setActiveTab('dashboard')}>📊 Dashboard</div>
        <div style={activeTab === 'orders' ? styles.menuActive : styles.menuItem} onClick={() => setActiveTab('orders')}>🛒 Orders</div>
        <div style={activeTab === 'settings' ? styles.menuActive : styles.menuItem} onClick={() => setActiveTab('settings')}>⚙️ Settings</div>
        <button onClick={() => setIsAuthenticated(false)} style={{ ...styles.menuItem, marginTop: "auto", background: "#c72c41" }}>🔒 Lock</button>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        
        {activeTab === "dashboard" && (
          <div>
            <h1>Dashboard Overview</h1>
            <div style={styles.cardGrid}>
              <div style={styles.card}><h3>TOTAL SALES</h3><h2>₹ 1,25,000</h2></div>
              <div style={styles.card}><h3>PENDING ORDERS</h3><h2>12</h2></div>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
           <div>
             <h1>Recent Orders</h1>
             <div style={styles.card}>
               <p>1. Alloy Wheels (x4) - <span style={{color:'orange'}}>Pending</span></p>
               <hr/>
               <p>2. Seat Covers - <span style={{color:'green'}}>Delivered</span></p>
             </div>
           </div>
        )}

        {activeTab === "settings" && (
          <div>
            <h1>Settings</h1>
            
            {/* Password Change */}
            <div style={styles.card}>
              <h3>🔐 Change PIN</h3>
              <input type="password" value={newPin} onChange={(e) => setNewPin(e.target.value)} placeholder="New PIN" style={styles.input} maxLength={4} />
              <button onClick={changePassword} style={styles.btnPrimary}>Update PIN</button>
            </div>

            {/* Notification Test */}
            <div style={{ ...styles.card, marginTop: "20px" }}>
              <h3>🔔 Notifications</h3>
              <button onClick={sendNotification} style={styles.btnSuccess}>Test Sound Alert</button>
            </div>

            {/* Install App Button */}
            <div style={{ ...styles.card, marginTop: "20px" }}>
              <h3>📱 Mobile App</h3>
              <p>Install this app on your device.</p>
              <button onClick={installApp} style={{ ...styles.btnWarning, marginTop:"10px" }}>⬇️ Install App</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// === STYLES ===
const styles = {
  lockContainer: { height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: "#1a1a2e", color: "white" },
  appContainer: { display: "flex", height: "100vh", fontFamily: "Arial", background: "#f4f6f9" },
  sidebar: { width: "250px", background: "#16213e", color: "white", padding: "20px", display: "flex", flexDirection: "column" },
  mainContent: { flex: 1, padding: "30px", overflowY: "auto" },
  menuItem: { padding: "15px", cursor: "pointer", borderRadius: "5px", marginBottom: "5px" },
  menuActive: { padding: "15px", cursor: "pointer", borderRadius: "5px", marginBottom: "5px", background: "#0f3460", fontWeight: "bold" },
  card: { background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" },
  cardGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginTop: "20px" },
  input: { padding: "10px", width: "100%", marginTop: "10px", marginBottom: "10px", borderRadius: "5px", border: "1px solid #ccc" },
  btnPrimary: { padding: "10px 20px", background: "#16213e", color: "white", border: "none", cursor: "pointer", borderRadius: "5px" },
  btnDanger: { padding: "10px 20px", background: "#e94560", color: "white", border: "none", cursor: "pointer", borderRadius: "5px" },
  btnSuccess: { padding: "10px 20px", background: "#28a745", color: "white", border: "none", cursor: "pointer", borderRadius: "5px" },
  btnWarning: { padding: "10px 20px", background: "#ff9f43", color: "white", border: "none", cursor: "pointer", borderRadius: "5px" }
};

export default App;