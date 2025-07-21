# Step-by-Step Guide: Configure CORS in Choreo for Your 6 APIs

## Method 1: Add CORS to OpenAPI Specifications (Recommended)

### For Each of Your 6 APIs:

1. **api-auth-2d5** (Authentication)
2. **api-chat-e56** (Chat)
3. **api-community-298** (Community)
4. **api-858** (Main - meetings, groups, notifications, availability)
5. **api-users-f95** (Users)
6. **Analytics API**

### Steps:

#### Step 1: Locate Your OpenAPI Specification Files
- In Choreo console, go to each API
- Look for "API Definition" or "OpenAPI Spec" section
- Download or edit the specification file

#### Step 2: Add CORS Configuration
Add this block to the ROOT level of each OpenAPI spec (same level as `openapi:`, `info:`, `paths:`):

```yaml
x-wso2-cors:
  accessControlAllowOrigins:
    - "http://localhost:3000"
    - "https://localhost:3000"
  accessControlAllowHeaders:
    - "Authorization"
    - "Content-Type"
    - "Accept"
    - "Cookie"
    - "Set-Cookie"
    - "X-Requested-With"
  accessControlAllowMethods:
    - "GET"
    - "POST"
    - "PUT"
    - "DELETE"
    - "OPTIONS"
  accessControlAllowCredentials: true
```

#### Step 3: Deploy the Updated Specification
- Save the updated OpenAPI specification
- Redeploy or update the API in Choreo
- Wait for deployment to complete

#### Step 4: Test CORS Configuration
Use the test component in your frontend to verify CORS is working.

---

## Method 2: Global CORS Configuration (Alternative)

If you can't modify individual API specifications, you can configure CORS globally:

### For Docker Compose Deployment:
Edit `<CHOREO-CONNECT_HOME>/docker-compose/choreo-connect/conf/config.toml`:

```toml
[router.cors]
    enabled = true
    allowOrigins = ["http://localhost:3000", "https://localhost:3000"]
    allowMethods = ["GET","PUT","POST","DELETE","PATCH","OPTIONS"]
    allowHeaders = ["authorization","Access-Control-Allow-Origin","Content-Type","SOAPAction","apikey", "testKey", "Internal-Key", "Cookie", "Set-Cookie"]
    exposeHeaders = ["Set-Cookie", "Authorization"]
    allowCredentials = true
```

### For Kubernetes Deployment:
Edit `<CHOREO-CONNECT_HOME>/k8s-artifacts/choreo-connect/config-toml-configmap.yaml`:

```yaml
data:
  config.toml: |
    [router.cors]
        enabled = true
        allowOrigins = ["http://localhost:3000", "https://localhost:3000"]
        allowMethods = ["GET","PUT","POST","DELETE","PATCH","OPTIONS"]
        allowHeaders = ["authorization","Access-Control-Allow-Origin","Content-Type","SOAPAction","apikey", "testKey", "Internal-Key", "Cookie", "Set-Cookie"]
        exposeHeaders = ["Set-Cookie", "Authorization"]
        allowCredentials = true
```

---

## Testing Your CORS Configuration

After implementing either method, use the test component:

```javascript
import ApiTestComponent from '@/components/ApiTestComponent';

// Add to any page:
<ApiTestComponent />
```

The test will show:
- ✅ Connection status for each API
- ✅ CORS configuration validation
- ✅ Specific recommendations for fixes

---

## Important Notes:

1. **API-Level CORS** (Method 1) takes precedence over global CORS
2. **allowCredentials: true** is crucial for cookie-based authentication
3. **localhost:3000** must be explicitly allowed (wildcards don't work with credentials)
4. After changes, redeploy your APIs in Choreo
5. Clear browser cache after CORS changes

---

## Quick Verification Checklist:

- [ ] Added `x-wso2-cors` to all 6 API specifications
- [ ] Set `accessControlAllowCredentials: true`
- [ ] Added `http://localhost:3000` to allowed origins
- [ ] Included `Cookie` and `Set-Cookie` in allowed headers
- [ ] Redeployed all APIs in Choreo
- [ ] Tested with the CORS test component
- [ ] Verified login works without "Failed to fetch" error
