# CORS Configuration Guide

## Issue
Your backend is returning CORS errors with 401 Unauthorized. This requires:

1. **Backend CORS Configuration**
2. **Authentication Headers**

## Spring Boot CORS Configuration

Add this to your Spring Boot backend (in your main Application class or WebConfig):

### Option 1: Global CORS Configuration (Recommended)

```java
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .exposedHeaders("Content-Type", "X-Custom-Header")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

### Option 2: @CrossOrigin Annotation

```java
@RestController
@RequestMapping("/api/roles")
@CrossOrigin(origins = "http://localhost:5173", 
             allowedHeaders = "*", 
             methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE},
             allowCredentials = "true",
             maxAge = 3600)
public class RoleController {
    // Your endpoints here
}
```

## Backend Requirements

Your Spring Boot `/api/roles` endpoint should:

```java
@RestController
@RequestMapping("/api/roles")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class RoleController {
    
    @GetMapping
    public ResponseEntity<?> getAllRoles(
        @RequestHeader("X-USER-ID") String userId) {
        // userId will contain the employee code sent by frontend
        System.out.println("User ID: " + userId);
        
        // Your role fetching logic here
        return ResponseEntity.ok(roleService.getAllRoles());
    }
}
```

## Authentication (401 Error)

The 401 error means authentication is required. Your backend might need:

### Option A: No Authentication
If you don't want authentication, ensure no `@EnableWebSecurity` or it's configured to allow `/api/roles`:

```java
@EnableWebSecurity
@Configuration
public class SecurityConfig extends WebSecurityConfigurerAdapter {
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .cors().and()
            .authorizeRequests()
            .antMatchers("/api/roles/**").permitAll() // Allow without auth
            .anyRequest().authenticated()
            .and()
            .httpBasic();
    }
}
```

### Option B: With Authentication
If authentication is required, add to your RoleController:

```java
@RestController
@RequestMapping("/api/roles")
public class RoleController {
    
    @PostMapping
    public ResponseEntity<?> createRole(
        @RequestHeader("X-USER-ID") String userId,
        @RequestBody RoleRequestDTO roleDTO) {
        
        // Validate user has permission
        if (userId == null || userId.isEmpty()) {
            return ResponseEntity.status(401).body("Unauthorized: X-USER-ID header missing");
        }
        
        return ResponseEntity.ok(roleService.createRole(roleDTO));
    }
}
```

## Frontend Changes Already Done

✅ Added `credentials: 'include'` to fetch calls
✅ Added `X-USER-ID: <employeeCode>` header automatically
✅ Better error messages for network/CORS failures

## Testing

### Step 1: Check Backend is Running
```bash
# In Terminal
curl -X GET http://localhost:8080/api/roles \
  -H "X-USER-ID: IS03651" \
  -H "Content-Type: application/json"
```

### Step 2: Check CORS Headers
```bash
# Check preflight request
curl -X OPTIONS http://localhost:8080/api/roles \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: GET" \
  -v
```

Look for response headers:
```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: *
```

### Step 3: Test from Browser Console
```javascript
// Open DevTools → Console
fetch('http://localhost:8080/api/roles', {
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    'X-USER-ID': 'IS03651'
  }
})
.then(r => r.json())
.then(d => console.log(d))
.catch(e => console.error(e));
```

## Troubleshooting

| Error | Cause | Solution |
|-------|-------|----------|
| CORS Missing Allow Origin | Backend not configured | Add CORS config to Spring Boot |
| 401 Unauthorized | Authentication required | Add user ID header, check security config |
| NetworkError when attempting to fetch | Backend not running | Start Spring Boot on port 8080 |
| CORS request did not succeed | Browser/server mismatch | Check origin in CORS config matches frontend URL |

## Frontend Port
- **React Dev Server**: http://localhost:5173
- **Backend Server**: http://localhost:8080

Make sure CORS config allows `http://localhost:5173` origin!

## Quick Fix for Testing

If you just want to get it working without authentication:

**Spring Boot SecurityConfig:**
```java
@Override
protected void configure(HttpSecurity http) throws Exception {
    http
        .csrf().disable()
        .cors().and()
        .authorizeRequests()
        .antMatchers("/api/**").permitAll()
        .and()
        .httpBasic();
}
```

**Spring Boot Application:**
```java
@SpringBootApplication
public class Application {
    
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOrigins("http://localhost:5173")
                        .allowedMethods("*")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        };
    }
}
```

Then restart backend and try again in frontend!
