import React, { useState, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import { signOut } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import ReactECharts from 'echarts-for-react';
import '../styles/GradientBackground.css';

export default function Dashboard({ user }) {
  const [showModal, setShowModal] = useState(true);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [analytics, setAnalytics] = useState(null);


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

  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const usersList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(usersList);
        
        const todayStart = new Date().setHours(0, 0, 0, 0);
        const usersToday = usersList.filter(u => u.createdAt && u.createdAt >= todayStart).length;
        
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dayStart = new Date(date).setHours(0, 0, 0, 0);
          const dayEnd = new Date(date).setHours(23, 59, 59, 999);
          
          const count = usersList.filter(u => 
            u.createdAt && u.createdAt >= dayStart && u.createdAt <= dayEnd
          ).length;
          
          last7Days.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            count
          });
        }
        
        setAnalytics({
          totalUsers: usersList.length,
          usersToday,
          last7Days
        });
      } catch (error) {
        console.error("Error fetching users: ", error);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u => {
    const fullName = `${u.fname || ''} ${u.middlename || ''} ${u.lname || ''}`.toLowerCase();
    const username = (u.username || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || username.includes(search) || email.includes(search);
  });

  return (
    <div className="min-h-screen animated-gradient-bg">
      <video className="video-bg" autoPlay loop muted playsInline>
        <source src="/background.mp4" type="video/mp4" />
      </video>
      <div className="gradient-overlay" />
      
      <div className="min-h-screen p-4 md:p-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">Dashboard</h1>
            <p className="text-white/70 mt-1">Welcome back, {username}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-2.5 rounded-xl bg-[#2a2d31] hover:bg-[#3a3d42] text-white/85 hover:text-white border border-[#3a3d42] transition font-medium text-sm"
          >
            Log Out
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
          <div className="bg-[#1e1f22]/90 backdrop-blur-xl rounded-2xl p-6 border border-[#3a3d42] hover:border-[#4a4d52] transition">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white/70 text-sm font-medium mb-1">Total Users</h3>
                <p className="text-4xl font-bold text-white">{analytics?.totalUsers || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-[#1e1f22]/90 backdrop-blur-xl rounded-2xl p-6 border border-[#3a3d42] hover:border-green-700/50 transition">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white/70 text-sm font-medium mb-1">New Users Today</h3>
                <p className="text-4xl font-bold text-green-400">{analytics?.usersToday || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#1e1f22]/90 backdrop-blur-xl rounded-2xl p-6 border border-[#3a3d42] mb-6">
          <h3 className="text-white text-lg md:text-xl font-semibold mb-4">User Registrations (Last 7 Days)</h3>
          {analytics && analytics.last7Days ? (
            <ReactECharts option={{
              tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(30, 31, 34, 0.9)',
                borderColor: '#3a3d42',
                textStyle: { color: '#fff' }
              },
              xAxis: {
                type: 'category',
                data: analytics.last7Days.map(d => d.date),
                axisLine: { lineStyle: { color: '#3a3d42' } },
                axisLabel: { color: '#fff' }
              },
              yAxis: {
                type: 'value',
                axisLine: { lineStyle: { color: '#3a3d42' } },
                axisLabel: { color: '#fff' },
                splitLine: { lineStyle: { color: '#2a2d31' } }
              },
              series: [{
                data: analytics.last7Days.map(d => d.count),
                type: 'line',
                smooth: true,
                lineStyle: { color: '#d9d9d9', width: 3 },
                itemStyle: { color: '#d9d9d9' },
                areaStyle: {
                  color: {
                    type: 'linear',
                    x: 0, y: 0, x2: 0, y2: 1,
                    colorStops: [
                      { offset: 0, color: 'rgba(217, 217, 217, 0.3)' },
                      { offset: 1, color: 'rgba(217, 217, 217, 0.05)' }
                    ]
                  }
                }
              }]
            }} style={{ height: '300px' }} />
          ) : (
            <div className="flex items-center justify-center h-[300px] text-white/50">
              Loading chart...
            </div>
          )}
        </div>

        <div className="bg-[#1e1f22]/90 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-[#3a3d42] mb-4">
          <input
            type="text"
            placeholder="Search by name, username, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-[#2a2d31] border border-[#3a3d42] text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#d9d9d9] transition"
          />
        </div>

        <div className="bg-[#1e1f22]/90 backdrop-blur-xl rounded-2xl border border-[#3a3d42] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="px-6 py-3 text-left">Full Name</th>
                <th className="px-6 py-3 text-left">Username</th>
                <th className="px-6 py-3 text-left">Email</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center text-white/70 py-4">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => (
                  <tr key={u.id} className="border-t border-gray-700 hover:bg-[#2a2d31]/50 transition">
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
