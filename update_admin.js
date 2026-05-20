const fs = require('fs');
const path = require('path');

const filePath = path.join('fe-mindease-main', 'fe-mindease-main', 'src', 'pages', 'AdminDashboard.jsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Add imports
content = content.replace("Activity, UserPlus\n} from 'lucide-react';", "Activity, UserPlus, Settings, Stethoscope, Edit, Plus\n} from 'lucide-react';");

// 2. Add state variables
const stateVars = `  const [demotingUserId, setDemotingUserId] = useState(null);
  const [settings, setSettings] = useState({ dashboard_greeting: '', ai_prompt: '' });
  const [doctorsList, setDoctorsList] = useState([]);
  const [isUpdatingSetting, setIsUpdatingSetting] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, users, posts, settings, doctors
`;
content = content.replace("  const [demotingUserId, setDemotingUserId] = useState(null);", stateVars);

// 3. Update fetchData
const fetchLogicOld = `      const [statsRes, postsRes, usersRes, analyticsRes] = await Promise.all([
        fetch(\`\${API_URL}/admin/stats\`, { headers }),
        fetch(\`\${API_URL}/admin/posts\`, { headers }),
        fetch(\`\${API_URL}/admin/users\`, { headers }),
        fetch(\`\${API_URL}/admin/analytics\`, { headers }),
      ]);`;
const fetchLogicNew = `      const [statsRes, postsRes, usersRes, analyticsRes, settingsRes, doctorsRes] = await Promise.all([
        fetch(\`\${API_URL}/admin/stats\`, { headers }),
        fetch(\`\${API_URL}/admin/posts\`, { headers }),
        fetch(\`\${API_URL}/admin/users\`, { headers }),
        fetch(\`\${API_URL}/admin/analytics\`, { headers }),
        fetch(\`\${API_URL}/admin/settings\`, { headers }),
        fetch(\`\${API_URL}/admin/doctors\`, { headers }),
      ]);`;
content = content.replace(fetchLogicOld, fetchLogicNew);

const parseLogicOld = `      if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
      else failures.push('analitik');`;
const parseLogicNew = `      if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
      else failures.push('analitik');
      if (settingsRes.ok) {
        const s = await settingsRes.json();
        const obj = {};
        s.forEach(x => obj[x.setting_key] = x.setting_value);
        setSettings(obj);
      } else failures.push('settings');
      if (doctorsRes.ok) setDoctorsList(await doctorsRes.json());
      else failures.push('doctors');`;
content = content.replace(parseLogicOld, parseLogicNew);

// 4. Add handler functions before return
const handlers = `
  const handleUpdateSetting = async (key, val) => {
    setIsUpdatingSetting(true);
    try {
      const res = await fetch(\`\${API_URL}/admin/settings\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: \`Bearer \${token}\` },
        body: JSON.stringify({ setting_key: key, setting_value: val })
      });
      if (res.ok) alert('Pengaturan diperbarui!');
      else alert('Gagal memperbarui pengaturan');
    } catch (e) {
      console.error(e);
      alert('Error memperbarui pengaturan');
    } finally {
      setIsUpdatingSetting(false);
    }
  };

  const handleAddDoctor = async () => {
    const name = prompt('Nama Dokter/Psikolog:');
    if (!name) return;
    const spec = prompt('Spesialisasi:', 'Psikolog Klinis') || 'Psikolog Klinis';
    const exp = prompt('Pengalaman (contoh: 5 Tahun):', '5 Tahun') || '5 Tahun';
    
    try {
      const res = await fetch(\`\${API_URL}/admin/doctors\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: \`Bearer \${token}\` },
        body: JSON.stringify({ name, spec, exp, rating: 5.0, reviews: 0, available: true, tags: 'Umum' })
      });
      if (res.ok) fetchData();
    } catch(e) {}
  };

  const handleToggleDoctor = async (doc) => {
    try {
      const res = await fetch(\`\${API_URL}/admin/doctors/\${doc.id}\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: \`Bearer \${token}\` },
        body: JSON.stringify({ ...doc, available: !doc.available })
      });
      if (res.ok) fetchData();
    } catch(e) {}
  };

  const handleDeleteDoc = async (id) => {
    if (!confirm('Hapus dokter ini?')) return;
    try {
      const res = await fetch(\`\${API_URL}/admin/doctors/\${id}\`, { method: 'DELETE', headers: { Authorization: \`Bearer \${token}\` } });
      if (res.ok) fetchData();
    } catch(e) {}
  };
`;

content = content.replace("  if (!user || user.role !== 'admin') return <Navigate to=\"/\" />;", handlers + "\n  if (!user || user.role !== 'admin') return <Navigate to=\"/\" />;\n");

// 5. Add tabs UI
const tabsUI = `
      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
        {[
          { id: 'overview', label: 'Overview', icon: <BarChart2 className="w-4 h-4" /> },
          { id: 'users', label: 'Pengguna', icon: <Users className="w-4 h-4" /> },
          { id: 'posts', label: 'Safe Space', icon: <MessageSquare className="w-4 h-4" /> },
          { id: 'doctors', label: 'Telekonsultasi', icon: <Stethoscope className="w-4 h-4" /> },
          { id: 'settings', label: 'Pengaturan', icon: <Settings className="w-4 h-4" /> },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={\`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap \${activeTab === t.id ? 'bg-brand-500/10 text-brand-500' : 'hover:bg-slate-500/10 text-slate-400'}\`}
            style={activeTab === t.id ? { color: 'var(--t-brand)', background: 'var(--bg-subtle)' } : {}}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>
`;
content = content.replace("      {/* Stats Cards */}", tabsUI + "\n      {/* Stats Cards */}");

// 6. Wrap sections with conditions
content = content.replace("{/* Stats Cards */}", "{activeTab === 'overview' && (\n        <>\n      {/* Stats Cards */}");
content = content.replace("{/* User Management Table */}", "        </>\n      )}\n\n      {activeTab === 'users' && (\n      {/* User Management Table */}");
content = content.replace("{/* Post Moderation */}", "      )}\n\n      {activeTab === 'posts' && (\n      {/* Post Moderation */}");

// 7. Add Settings and Doctors panels
const extraPanels = `
      )}

      {activeTab === 'doctors' && (
        <div className="glass-card p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Manajemen Telekonsultasi</h2>
            <button onClick={handleAddDoctor} className="btn-primary px-3 py-1.5 rounded-lg text-sm flex gap-2 items-center">
              <Plus className="w-4 h-4"/> Tambah
            </button>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-rose-400" /></div>
          ) : doctorsList.length === 0 ? (
            <p className="text-center py-10 text-sm" style={{ color: 'var(--t-muted)' }}>Belum ada data dokter.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse" style={{ color: 'var(--t-primary)' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--t-secondary)' }}>
                    <th className="py-3 px-2 text-sm font-semibold">Nama</th>
                    <th className="py-3 px-2 text-sm font-semibold">Spesialisasi</th>
                    <th className="py-3 px-2 text-sm font-semibold">Status</th>
                    <th className="py-3 px-2 text-sm font-semibold text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {doctorsList.map(doc => (
                    <tr key={doc.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="py-3 px-2 text-sm font-medium">{doc.name}</td>
                      <td className="py-3 px-2 text-sm">{doc.spec}</td>
                      <td className="py-3 px-2 text-sm">
                        <button onClick={() => handleToggleDoctor(doc)} className={\`px-2 py-1 rounded text-xs font-bold \${doc.available ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-500'}\`}>
                          {doc.available ? 'TERSEDIA' : 'TIDAK TERSEDIA'}
                        </button>
                      </td>
                      <td className="py-3 px-2 flex justify-center gap-2">
                        <button onClick={() => handleDeleteDoc(doc.id)} className="text-rose-500 hover:bg-rose-500/10 p-1.5 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-5">
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold mb-4">Pengaturan Dashboard</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--t-secondary)' }}>Pesan Sapaan Dashboard</label>
                <textarea 
                  className="input-field w-full p-3 text-sm rounded-xl min-h-[80px]"
                  value={settings.dashboard_greeting || ''}
                  onChange={(e) => setSettings({...settings, dashboard_greeting: e.target.value})}
                />
              </div>
              <button onClick={() => handleUpdateSetting('dashboard_greeting', settings.dashboard_greeting)} disabled={isUpdatingSetting} className="btn-primary px-4 py-2 rounded-xl text-sm font-medium">
                Simpan Pesan Dashboard
              </button>
            </div>
          </div>
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold mb-4">Pengaturan AI Chat</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--t-secondary)' }}>System Prompt AI</label>
                <textarea 
                  className="input-field w-full p-3 text-sm rounded-xl min-h-[120px]"
                  value={settings.ai_prompt || ''}
                  onChange={(e) => setSettings({...settings, ai_prompt: e.target.value})}
                />
                <p className="text-xs mt-1" style={{ color: 'var(--t-muted)' }}>Instruksi dasar yang memberitahu AI bagaimana harus bersikap.</p>
              </div>
              <button onClick={() => handleUpdateSetting('ai_prompt', settings.ai_prompt)} disabled={isUpdatingSetting} className="btn-primary px-4 py-2 rounded-xl text-sm font-medium">
                Simpan AI Prompt
              </button>
            </div>
          </div>
        </div>
`;

const idx = content.lastIndexOf("    </div>\n  );\n}");
if (idx !== -1) {
  content = content.slice(0, idx) + extraPanels + content.slice(idx);
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Done');
