import React, { useEffect, useMemo, useState } from 'react';
import { chat as chatAPI, isStreamingEnabled } from './api.js';
import Header from './components/Header.jsx';
import ChatWindow from './components/ChatWindow.jsx';
import Composer from './components/Composer.jsx';
import ProfileModal from './components/ProfileModal.jsx';
import Toast from './components/Toast.jsx';
import Sidebar from './components/Sidebar.jsx';
import Background from './components/Background.jsx';

const initialMessage = () => ({
  id: 'welcome-1',
  sender: 'sally',
  text:
    "Hello! I’m Sally, your well-being buddy. I’m here to listen and support you. How are you feeling today?",
  time: new Date().toISOString(),
});

function App() {
  const [role, setRole] = useState(() => localStorage.getItem('sally_role') || 'Sister');
  // Sessions: each session captures user's display name at creation and the full message history
  const [sessions, setSessions] = useState(() => {
    try {
      const raw = localStorage.getItem('sally_sessions');
      if (raw) return JSON.parse(raw);
    } catch {}
    // default session with welcome message
    const first = {
      id: `sesh-${Date.now()}`,
      userDisplayName: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [initialMessage()],
    };
    return [first];
  });
  const [currentSessionId, setCurrentSessionId] = useState(() => {
    const saved = localStorage.getItem('sally_current_session');
    if (saved) return saved;
    // allow fallback to first session via effect below
    return '';
  });
  const [thinking, setThinking] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [profile, setProfile] = useState(() => {
    return {
      name: localStorage.getItem('sally_name') || '',
      mode: localStorage.getItem('sally_name_mode') || 'first',
      nickname: localStorage.getItem('sally_nickname') || '',
    };
  });
  const [aura, setAura] = useState(() => localStorage.getItem('sally_aura') || 'default');
  const [theme, setTheme] = useState(() => localStorage.getItem('sally_theme') || 'light');

  const apiBase = useMemo(() => {
    const envBase = import.meta.env.VITE_API_URL;
    if (envBase) return envBase;
    if (typeof window !== 'undefined') {
      return `${window.location.protocol}//${window.location.hostname}:8000`;
    }
    return 'http://localhost:8000';
  }, []);

  useEffect(() => {
    localStorage.setItem('sally_role', role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem('sally_name', profile.name || '');
    localStorage.setItem('sally_name_mode', profile.mode || 'first');
    localStorage.setItem('sally_nickname', profile.nickname || '');
  }, [profile]);
  useEffect(() => {
    try { localStorage.setItem('sally_aura', aura); } catch {}
  }, [aura]);

  // Persist sessions and current selection
  useEffect(() => {
    try { localStorage.setItem('sally_sessions', JSON.stringify(sessions)); } catch {}
  }, [sessions]);
  useEffect(() => {
    if (currentSessionId) localStorage.setItem('sally_current_session', currentSessionId);
  }, [currentSessionId]);
  useEffect(() => {
    if (!currentSessionId && sessions.length) {
      setCurrentSessionId(sessions[0].id);
    }
  }, [sessions, currentSessionId]);
  useEffect(() => {
    try { localStorage.setItem('sally_theme', theme); } catch {}
    const root = document.documentElement;
    root.classList.remove('theme-light', 'theme-dark');
    root.classList.add(theme === 'dark' ? 'theme-dark' : 'theme-light');
  }, [theme]);

  const preferredName = useMemo(() => {
    const full = (profile.name || '').trim();
    if (profile.mode === 'custom') return (profile.nickname || '').trim() || full.split(' ')[0] || '';
    if (profile.mode === 'full') return full;
    // first name only (default)
    return full.split(' ')[0] || '';
  }, [profile]);

  // If the very first session has no display name yet, set it from current preference
  useEffect(() => {
    setSessions((all) => {
      if (!all.length) return all;
      const first = all[0];
      if (!first.userDisplayName) {
        const updated = [...all];
        updated[0] = { ...first, userDisplayName: preferredName || 'You' };
        return updated;
      }
      return all;
    });
  }, [preferredName]);

  const messages = useMemo(() => {
    const sesh = sessions.find((s) => s.id === currentSessionId) || sessions[0];
    return sesh?.messages || [];
  }, [sessions, currentSessionId]);

  const updateCurrentSession = (updater) => {
    setSessions((all) => all.map((s) => (s.id === currentSessionId ? { ...updater(s), updatedAt: new Date().toISOString() } : s)));
  };

  const replaceMessageInCurrent = (id, changer) => {
    updateCurrentSession((s) => ({
      ...s,
      messages: s.messages.map((m) => (m.id === id ? changer(m) : m)),
    }));
  };

  const removeMessageInCurrent = (id) => {
    updateCurrentSession((s) => ({ ...s, messages: s.messages.filter((m) => m.id !== id) }));
  };

  const appendMessagesToCurrent = (...msgs) => {
    updateCurrentSession((s) => ({ ...s, messages: [...s.messages, ...msgs] }));
  };

  const ensureCurrentSession = () => {
    // If currentSessionId doesn't exist, create one
    const exists = sessions.some((s) => s.id === currentSessionId);
    if (!exists) {
      const id = `sesh-${Date.now()}`;
      const sesh = {
        id,
        userDisplayName: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [initialMessage()],
      };
      setSessions([sesh, ...sessions]);
      setCurrentSessionId(id);
    }
  };

  const send = async (message, roleParam, namePref) => {
    const trimmed = (message || '').trim();
    if (!trimmed) return;
    ensureCurrentSession();
    const userMsg = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      time: new Date().toISOString(),
    };
    const sallyId = `s-${Date.now()}-stream`;
    appendMessagesToCurrent(
      userMsg,
      { id: sallyId, sender: 'sally', text: '', time: new Date().toISOString() },
    );
    setThinking(true);
    let gotFirst = false;
    try {
      const streaming = isStreamingEnabled();
      if (streaming) {
        await chatAPI(trimmed, roleParam, {
          stream: true,
          onToken: (token, full, { first }) => {
            if (first && !gotFirst) {
              gotFirst = true;
              setThinking(false);
            }
            replaceMessageInCurrent(sallyId, (msg) => ({ ...msg, text: full }));
          },
        }, namePref);
        if (!gotFirst) setThinking(false);
      } else {
        const { reply } = await chatAPI(trimmed, roleParam, { stream: false }, namePref);
        replaceMessageInCurrent(sallyId, (msg) => ({ ...msg, text: reply }));
        setThinking(false);
      }
    } catch (e) {
      const status = e?.status ?? 'ERR';
      let errText = e?.message || 'Request failed';
      // Provide friendlier guidance for common backend errors
      if (status === 401) {
        errText = 'Invalid OpenAI API key. Add OPENAI_API_KEY to backend/.env and restart the backend.';
      } else if (status === 500 && /OPENAI_API_KEY is not set/i.test(String(e?.message))) {
        errText = 'OpenAI API key is missing. Create backend/.env with OPENAI_API_KEY=sk-... and restart the backend.';
      } else if (status === 403) {
        errText = 'Permission denied for the model. Ensure your account has access or change OPENAI_MODEL in backend/.env.';
      } else if (status === 504) {
        errText = 'Network issue reaching OpenAI from backend. Check internet/proxy and try again.';
      }
      removeMessageInCurrent(sallyId);
      appendMessagesToCurrent({
        id: `err-${Date.now()}`,
        sender: 'sally',
        kind: 'error',
        text: `Error ${status}: ${errText}`,
        retryPayload: { message: trimmed, role: roleParam, userNamePreference: namePref },
        time: new Date().toISOString(),
      });
      setThinking(false);
    }
  };

  const handleSend = async (text) => {
    const namePref = { type: profile.mode, name: preferredName };
    await send(text, role, namePref);
  };

  const handleRetry = async (payload) => {
    if (!payload) return;
    await send(payload.message, payload.role, payload.userNamePreference);
  };

  const pushToast = (type, text, ms = 2600) => {
    const id = `t-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
    setToasts((list) => [...list, { id, type, text }]);
    if (ms > 0) setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), ms);
  };

  const closeToast = (id) => setToasts((list) => list.filter((t) => t.id !== id));

  const testConnection = async () => {
    const base = apiBase;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    try {
      const res = await fetch(`${base}/health`, { signal: controller.signal });
      clearTimeout(timeout);
      if (res.ok) {
        pushToast('success', 'Connected to backend');
      } else {
        pushToast('error', `Health check failed: ${res.status}`);
      }
    } catch (e) {
      pushToast('error', `Health check error: ${e?.message || 'Network'}`);
    }
  };

  const clearCurrentSession = () => {
    if (!currentSessionId) return;
    setSessions((all) => all.map((s) => (s.id === currentSessionId ? { ...s, messages: [initialMessage()], updatedAt: new Date().toISOString() } : s)));
    setThinking(false);
  };

  const newSession = () => {
    const userDisplayName = preferredName || 'You';
    const sesh = {
      id: `sesh-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
      userDisplayName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [initialMessage()],
    };
    setSessions((all) => [sesh, ...all]);
    setCurrentSessionId(sesh.id);
  };

  const renameSession = (id, name) => {
    const n = (name || '').trim();
    if (!n) return;
    setSessions((all) => all.map((s) => (s.id === id ? { ...s, userDisplayName: n, updatedAt: new Date().toISOString() } : s)));
  };

  const deleteSession = (id) => {
    setSessions((all) => {
      const filtered = all.filter((s) => s.id !== id);
      if (filtered.length === 0) {
        const sesh = {
          id: `sesh-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
          userDisplayName: preferredName || 'You',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages: [initialMessage()],
        };
        setCurrentSessionId(sesh.id);
        return [sesh];
      }
      if (id === currentSessionId) {
        setCurrentSessionId(filtered[0].id);
      }
      return filtered;
    });
  };

  const cycleAura = () => {
    setAura((v) => (v === 'calm' ? 'default' : v === 'default' ? 'vivid' : 'calm'));
  };

  const selectSession = (id) => {
    setCurrentSessionId(id);
  };

  const activeUserName = useMemo(() => {
    // For header personalization, use the current profile preference so it updates dynamically
    return (preferredName || '').trim();
  }, [preferredName]);

  return (
    <>
      <Background theme={theme} />
      <div className="app">
      <Header
        role={role}
        onChangeRole={setRole}
        thinking={thinking}
        onOpenProfile={() => setProfileOpen(true)}
        onTestConnection={testConnection}
        auraVariant={aura}
        activeName={activeUserName}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
      />
      {!apiBase && (
        <div className="banner error" role="status" aria-live="polite">
          Backend URL not set. Create a .env file with VITE_API_URL and restart the dev server.
        </div>
      )}
      <div className="content">
        <Sidebar
          sessions={sessions}
          currentId={currentSessionId}
          onSelect={selectSession}
          onClearChat={clearCurrentSession}
          onNewChat={newSession}
          onRename={renameSession}
          onDelete={deleteSession}
          aura={aura}
          onCycleAura={cycleAura}
        />
        <main className="panel">
          <ChatWindow messages={messages} thinking={thinking} onRetryMessage={handleRetry} auraVariant={aura} />
          <Composer onSend={handleSend} />
        </main>
      </div>
      <ProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        value={profile}
        onSave={setProfile}
      />
      <Toast items={toasts} onClose={closeToast} />
      </div>
    </>
  );
}

export default App;
