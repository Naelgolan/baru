const fs = require('fs');
const path = require('path');

const filePath = path.join('fe-mindease-main', 'fe-mindease-main', 'src', 'pages', 'Dashboard.jsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Add settings state
const oldState = "  const { token, user } = useAuth();";
const newState = "  const { token, user } = useAuth();\n  const [settings, setSettings] = useState({});";
content = content.replace(oldState, newState);

// Add fetchSettings
const fetchMoodsStr = "  const fetchMoods = async () => {";
const newFetch = `  const fetchSettings = async () => {
    try {
      const res = await fetch(\`\${API_URL}/public/settings\`);
      if (res.ok) setSettings(await res.json());
    } catch (e) { console.error(e); }
  };
  useEffect(() => { fetchSettings(); }, []);

  const fetchMoods = async () => {`;
content = content.replace(fetchMoodsStr, newFetch);

// Use setting for greeting
const oldGreeting = "{user ? 'Bagaimana perasaanmu hari ini? Yuk ceritakan.' : 'Login untuk menyimpan riwayat mood dan catatanmu.'}";
const newGreeting = "{user ? (settings.dashboard_greeting || 'Bagaimana perasaanmu hari ini? Yuk ceritakan.') : 'Login untuk menyimpan riwayat mood dan catatanmu.'}";
content = content.replace(oldGreeting, newGreeting);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Done');
