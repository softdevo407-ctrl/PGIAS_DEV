# 🚀 Quick Start Guide

Get your PGIAS React application running in minutes!

## Prerequisites

- Node.js v18+ installed
- Spring Boot backend (optional for demo)

## 1️⃣ Start the Application

```bash
cd "e:\Dev WS\PGIAS_React_WS"
npm run dev
```

The app opens automatically at `http://localhost:5173`

## 2️⃣ Login

Use demo credentials:
- **Login ID**: IS03651 or IS03652
- **Password**: password

## 3️⃣ Explore Features

### For ADMIN (IS03651):
- ✅ Dashboard
- ✅ **Role Management** (NEW!)
- ✅ **User-Role Assignment** (NEW!)
- ✅ User Management
- ✅ Incentives, Reports, Analytics
- ✅ Settings, Inventory

### For APPROVER (IS03652):
- ✅ Dashboard
- ✅ Incentives
- ✅ Reports
- ✅ Analytics

## 4️⃣ Key Features

### 🔐 Role Management
- Create, edit, delete roles
- Real-time API integration
- Full form validation

### 👥 User-Role Assignment
- Assign roles to users by login ID
- Manage centre-based assignments
- Set effective date ranges

### 📊 Dashboard
- Statistics and metrics
- Recent activity timeline
- User access information

## 5️⃣ Connect to Backend

Edit `src/config/config.js`:

```javascript
api: {
  baseURL: 'http://your-backend-url:8081',  // ← Change this
  // ...
}
```

## 6️⃣ Build for Production

```bash
npm run build       # Creates optimized build
npm run preview     # Test production build
```

## 📁 Project Structure

```
src/
├── App.jsx                     # Main application
├── config/config.js            # Configuration
├── services/api.js             # API layer
├── pages/
│   ├── RoleManagementPage.jsx
│   └── UserRoleAssignmentPage.jsx
```

## 🛠️ Common Commands

```bash
npm install         # Install dependencies (already done)
npm run dev         # Start dev server
npm run build       # Build for production
npm run preview     # Preview production build
```

## 📚 Documentation

- **[README.md](README.md)** - Features & overview
- **[API_INTEGRATION_GUIDE.md](API_INTEGRATION_GUIDE.md)** - API documentation
- **[ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md)** - Detailed setup
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Technical details
- **[CHECKLIST.md](CHECKLIST.md)** - Completion checklist

## ⚡ First API Call

To test the API integration:

1. Ensure your backend is running
2. Open DevTools (F12)
3. Go to Network tab
4. Navigate to "Role Management"
5. Watch API calls in real-time

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 5173 in use | Check `ENVIRONMENT_SETUP.md` |
| API not responding | Verify backend URL in config |
| Login fails | Use demo credentials: IS03651/password |
| Roles not loading | Check backend `/api/userroles/login/{loginId}` |

## 💡 Tips

- **Hot Reload**: Changes auto-reload (Cmd+S)
- **DevTools**: F12 to inspect and debug
- **Network Tab**: Monitor API calls
- **Console**: Check for errors

## 🎯 Next Steps

1. Start the dev server
2. Login with demo credentials
3. Explore Role Management
4. Test User-Role Assignment
5. Connect to your backend

## 📞 Need Help?

1. Check the relevant documentation file
2. Review browser console (F12)
3. Check network requests in DevTools
4. Verify backend is running and accessible

---

**Ready to code?** 🎉

```bash
npm run dev
```

The application is fully functional and ready for backend integration. Happy coding! 🚀
