import { useEffect, useState } from 'react';
import { auth } from '../firebaseconfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/router';
import axios from 'axios';
export default function Home() {
  const [input, setInput] = useState('');
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const router = useRouter();
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        fetchSessions(u.uid);
      } else {
        router.push('/login');
      }
    });
    return () => unsub();
  }, []);
  const fetchSessions = async (uid) => {
    try {
      const res = await axios.get('http://localhost:5000/api/chat/sessions', {
        params: { userId: uid },
      });
      setSessions(res.data);
    } catch (err) {
      console.error('❌ Failed to load sessions', err);
    }
  };
  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMessage = { role: 'user', content: input };
    setChat((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/chat', {
        message: input,
        userId: user.uid,
        sessionId,
      });
      const aiMessage = { role: 'ai', content: res.data.reply };
      setChat((prev) => [...prev, aiMessage]);
      if (!sessionId) {
        setSessionId(res.data.sessionId);
        fetchSessions(user.uid);
      }
    } catch (error) {
      console.error('❌ Chat API Error:', error.message);
      const errorMessage = {
        role: 'ai',
        content: '⚠️ Failed to get AI response. Please try again later.',
      };
      setChat((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };
  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };
  const handleNewChat = () => {
    setChat([]);
    setSessionId(null);
  };
  if (!user) return null;
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <h1 className="text-3xl font-bold mb-4">🤖 AI Chatbot</h1>
      <p className="mb-4 text-sm">Welcome, {user.email}</p>
      <div className="flex gap-2 mb-4">
        <button
          onClick={handleNewChat}
          className="bg-green-600 text-white px-4 py-1 rounded"
        >
          New Chat
        </button>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-1 rounded"
        >
          Logout
        </button>
      </div>
      <div className="w-full max-w-6xl flex">
        {/* Sidebar */}
        <div className="w-1/4 mr-4 bg-white shadow-lg rounded-lg p-4 overflow-y-auto h-[600px]">
          <h2 className="font-bold text-lg mb-2">💬 Chat History</h2>
          {sessions.length === 0 ? (
            <p className="text-gray-500 text-sm">No chats yet</p>
          ) : (
            sessions.map((s) => (
              <div
                key={s._id}
                onClick={() => {
                  setChat(s.messages);
                  setSessionId(s._id);
                }}
                className={`cursor-pointer text-sm p-2 rounded hover:bg-gray-100 border-b ${
                  sessionId === s._id ? 'bg-blue-100 font-semibold' : ''
                }`}
              >
                {s.messages[0]?.content.slice(0, 30) || 'New Chat'}
              </div>
            ))
          )}
        </div>
        {/* Chat Box */}
        <div className="w-3/4 bg-white rounded-xl shadow-lg p-4 flex flex-col">
          <div className="h-[500px] overflow-y-auto mb-4 space-y-2 pr-2">
            {chat.map((msg, idx) => (
              <div
                key={idx}
                className={`p-2 rounded-lg max-w-[80%] whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white self-end ml-auto'
                    : 'bg-gray-300 text-black self-start mr-auto'
                }`}
              >
                {msg.content}
              </div>
            ))}
            {loading && (
              <div className="p-2 rounded-lg max-w-[80%] bg-gray-300 text-black self-start mr-auto animate-pulse">
                Typing...
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <input
              className="flex-1 border rounded-lg p-2"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              disabled={loading}
            />
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
              onClick={sendMessage}
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
