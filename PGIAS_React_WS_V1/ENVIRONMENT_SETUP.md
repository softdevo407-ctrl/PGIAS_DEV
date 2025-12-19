# Environment Setup Guide

## Prerequisites

- Node.js (v18 or higher) - [Download](https://nodejs.org/)
- npm (comes with Node.js)
- Spring Boot Backend (Running on port 8081)
- Code Editor (VS Code recommended)

## Local Development Setup

### Step 1: Clone/Navigate to Project

```bash
cd "e:\Dev WS\PGIAS_React_WS"
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages:
- react (18.2.0)
- react-dom (18.2.0)
- lucide-react (0.294.0)
- bootstrap (5.3.0)
- vite (5.0.8)

### Step 3: Configure Backend URL

Edit `src/config/config.js` and update the API base URL:

```javascript
api: {
  baseURL: 'http://localhost:8081', // Change if your backend runs on different URL/port
  // ... rest of config
}
```

### Step 4: Start Development Server

```bash
npm run dev
```

The application will:
- Start on `http://localhost:5173`
- Auto-reload on file changes
- Show compilation errors in console

### Step 5: Open in Browser

Navigate to `http://localhost:5173`

## Backend Setup

### Spring Boot Configuration

Ensure your Spring Boot backend:

1. **Runs on Port 8081** (or update `src/config/config.js`)

2. **Has CORS enabled** for `http://localhost:5173`:

```java
@Configuration
public class CorsConfig {
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

3. **Has the required endpoints**:
```
GET    /api/roles
POST   /api/roles
PUT    /api/roles/{id}
DELETE /api/roles/{id}

GET    /api/userroles
GET    /api/userroles/login/{loginId}
POST   /api/userroles
PUT    /api/userroles/{loginId}/{roleCode}/{centreCode}
DELETE /api/userroles/{loginId}/{roleCode}/{centreCode}
```

## Testing Setup

### Mock Data Testing (Without Backend)

The application includes mock data for testing:

**Demo Credentials:**
- Login ID: IS03651 or IS03652
- Password: password

These work without a backend running.

### Real API Testing

1. Ensure Spring Boot backend is running
2. Login with valid credentials
3. Backend will provide actual roles from API

### Browser DevTools

Open F12 in your browser to:
- Check Network requests (check API calls)
- Review Console for errors
- Inspect Elements
- Monitor Performance

## IDE Setup (VS Code)

### Recommended Extensions

1. **ES7+ React/Redux/React-Native snippets**
   - ID: `dsznajder.es7-react-js-snippets`

2. **Prettier - Code formatter**
   - ID: `esbenp.prettier-vscode`

3. **ESLint**
   - ID: `dbaeumer.vscode-eslint`

4. **Thunder Client** (for API testing)
   - ID: `rangav.vscode-thunder-client`

### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "editor.tabSize": 2,
  "editor.insertSpaces": true
}
```

## Production Build

### Build for Production

```bash
npm run build
```

This creates an optimized build in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

Runs the production build locally for testing.

### Deploy to Server

1. Build the project: `npm run build`
2. Upload the `dist/` folder to your web server
3. Configure web server to serve `index.html` for all routes
4. Update `src/config/config.js` with production backend URL

**Nginx Example:**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /var/www/pgias-react/dist;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## Environment Variables (Optional)

Create `.env` file for environment-specific configuration:

```env
VITE_API_BASE_URL=http://localhost:8081
VITE_API_TIMEOUT=30000
VITE_APP_NAME=PGIAS
VITE_APP_VERSION=1.0.0
```

Update `src/config/config.js` to use these:

```javascript
export const config = {
  api: {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081',
    timeout: import.meta.env.VITE_API_TIMEOUT || 30000,
    // ...
  },
  // ...
};
```

## Troubleshooting

### Port 5173 Already in Use

**Solution 1:** Kill the process using the port
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5173
kill -9 <PID>
```

**Solution 2:** Change Vite port in `vite.config.js`
```javascript
server: {
  port: 5174, // Change to another port
  open: true
}
```

### Dependencies Installation Issues

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -r node_modules package-lock.json
npm install
```

### CORS Errors

Check:
1. Backend is running
2. Backend CORS configuration allows `http://localhost:5173`
3. API URL is correct in `src/config/config.js`
4. Browser console shows exact error

### Module Not Found Errors

Solution: Clear Vite cache and restart
```bash
npm run dev -- --force
```

### API Calls Failing

1. Check if backend is running: `http://localhost:8081`
2. Verify endpoints exist in backend
3. Check browser network tab (F12 → Network)
4. Look for CORS or 404 errors

## Useful Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Check for dependency updates
npm outdated

# Update all dependencies
npm update

# List installed packages
npm list
```

## Git Setup (Optional)

### Initialize Git Repository

```bash
git init
git add .
git commit -m "Initial commit"
```

### Useful .gitignore

Already configured in `.gitignore` file

## Continuous Development

### File Watchers

Vite automatically watches and reloads on changes to:
- `.jsx` files
- `.js` files
- `.css` files
- `.json` files

### Browser Refresh

- **Hot Module Reload (HMR)**: Automatic on file save
- **Full Page Reload**: Press Ctrl+R if HMR doesn't work

## Performance Tips

1. **Use React DevTools**: Identify re-renders
2. **Lazy Load Components**: Use `React.lazy()` for large components
3. **Optimize Images**: Compress before adding
4. **Monitor Bundle Size**: Run `npm run build` and check dist/ folder
5. **Use Network Tab**: Monitor API calls and response times

## Security Considerations

1. **Never commit sensitive data**: Use environment variables
2. **Validate all inputs**: Especially API data
3. **Use HTTPS in production**: Always
4. **Secure API communication**: Use auth tokens
5. **Keep dependencies updated**: Regular `npm update`

## Debugging Tips

### Debug Console Logs

```javascript
// In development
console.log('Debug info:', data);

// Remove in production
```

### Using Debugger

```javascript
debugger; // Browser will pause here if DevTools open
```

### Network Debugging

1. Open DevTools (F12)
2. Go to Network tab
3. Make API calls
4. Review requests/responses

## Contact & Support

For issues or questions:
1. Check browser console for errors
2. Review API_INTEGRATION_GUIDE.md
3. Check Spring Boot backend logs
4. Verify configuration in src/config/config.js

---

**Happy Coding!** 🚀
