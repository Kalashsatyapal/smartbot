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
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) setUser(u);
      else router.push('/login');
    });
    return () => unsub();
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setChat((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/chat', {
        message: input,
      });

      const aiMessage = { role: 'ai', content: res.data.reply };
      setChat((prev) => [...prev, aiMessage]);
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

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <h1 className="text-3xl font-bold mb-4">🤖 AI Chatbot</h1>
      <p className="mb-4 text-sm">Welcome, {user.email}</p>
      <button
        onClick={handleLogout}
        className="mb-4 bg-red-500 text-white px-4 py-1 rounded"
      >
        Logout
      </button>

      <div className="w-full max-w-xl bg-white rounded-xl shadow-lg p-4 flex flex-col">
        <div className="h-96 overflow-y-auto mb-4 space-y-2 pr-2">
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
  );
}

