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
  const [history, setHistory] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        fetchHistory(u.uid);
      } else {
        router.push('/login');
      }
    });
    return () => unsub();
  }, []);

  const fetchHistory = async (userId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/chat/${userId}`);
      const latest = res.data[0]?.messages || [];
      setChat(latest);
      setHistory(res.data);
    } catch (err) {
      console.error('History error', err.message);
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
        userId: user.uid,
        message: input,
      });

      const aiMessage = { role: 'assistant', content: res.data.reply };
      setChat((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error.message);
      setChat((prev) => [...prev, {
        role: 'assistant',
        content: '⚠️ AI failed to respond. Try again later.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md p-4">
        <h2 className="font-bold text-lg mb-4">🕘 Chat History</h2>
        <ul className="space-y-2 text-sm">
          {history.map((session, idx) => (
            <li key={idx} className="cursor-pointer hover:underline" onClick={() => setChat(session.messages)}>
              Chat {history.length - idx}
            </li>
          ))}
        </ul>
      </div>

      {/* Chat UI */}
      <div className="flex-1 bg-gray-100 flex flex-col items-center p-4">
        <div className="w-full max-w-2xl">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold">🤖 AI Chatbot</h1>
              <p className="text-sm">Welcome, {user.email}</p>
            </div>
            <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-1 rounded">
              Logout
            </button>
          </div>

          <div className="h-[500px] bg-white rounded-xl shadow p-4 mb-4 overflow-y-auto space-y-2">
            {chat.map((msg, idx) => (
              <div key={idx} className={`p-2 rounded max-w-[80%] whitespace-pre-wrap ${msg.role === 'user' ? 'bg-blue-500 text-white self-end ml-auto' : 'bg-gray-300 text-black self-start mr-auto'}`}>
                {msg.content}
              </div>
            ))}
            {loading && (
              <div className="p-2 rounded max-w-[80%] bg-gray-300 text-black self-start mr-auto animate-pulse">
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
              onClick={sendMessage}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              {loading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
