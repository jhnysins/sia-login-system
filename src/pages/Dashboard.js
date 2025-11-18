import React, { useState, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import { signOut } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import '../styles/GradientBackground.css';

export default function Dashboard({ user }) {
  const [showModal, setShowModal] = useState(true);
  const [users, setUsers] = useState([]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const handleClose = () => {
    setShowModal(false);
  };

  const username = user.displayName || user.email?.split('@')[0] || 'User';

  // Fetch users from Firebase
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const usersList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(usersList);
      } catch (error) {
        console.error("Error fetching users: ", error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen animated-gradient-bg">
      <div className="min-h-screen p-8">
        <h1 className="text-4xl font-bold text-white">Dashboard</h1>
        <p className="text-white/70 mt-2">Welcome to your dashboard, {username}</p>

        <div className="mt-8 overflow-x-auto">
          <table className="min-w-full bg-[#1e1f22]/80 border border-gray-700 rounded-xl">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="px-6 py-3 text-left">Full Name</th>
                <th className="px-6 py-3 text-left">Username</th>
                <th className="px-6 py-3 text-left">Email</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center text-white/70 py-4">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} className="border-t border-gray-700">
                    <td className="px-6 py-3 text-white">
                      {`${u.fname || ''} ${u.middlename || ''} ${u.lname || ''}`.trim() || 'N/A'}
                    </td>
                    <td className="px-6 py-3 text-white">{u.username || 'N/A'}</td>
                    <td className="px-6 py-3 text-white">{u.email || 'N/A'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div
            className="w-full max-w-md bg-[#1e1f22]/95 backdrop-blur-xl rounded-2xl shadow-[0_40px_120px_rgba(0,0,0,0.65)] p-8 border border-[#3a3d42] text-white relative"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-[#2a2d31] hover:bg-[#3a3d42] text-white/70 hover:text-white transition"
              title="Close"
            >
              ✕
            </button>

            <h1 className="text-3xl font-semibold mb-2">Welcome back, {username}!</h1>
            <p className="text-lg text-white/70 mb-8 break-words">
              You are signed in as:
              <br />
              <span className="font-medium text-white">{user.email}</span>
            </p>

            <button
              onClick={handleLogout}
              className="w-full rounded-xl bg-gradient-to-r from-[#d9d9d9] via-[#b8bcc2] to-[#e7e7e7] hover:from-[#cfcfcf] hover:via-[#b4b8be] hover:to-[#dcdcdc] active:from-[#c5c5c5] active:via-[#aab0b6] active:to-[#d2d2d2] transition font-medium text-sm text-[#222629] py-3 shadow-[0_18px_40px_rgba(0,0,0,0.55)]"
            >
              Log Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
