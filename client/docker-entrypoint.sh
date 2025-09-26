#!/bin/sh
# ==============================================
# EthioHeritage360 Frontend Docker Entrypoint
# ==============================================

set -e

# Default values
REACT_APP_API_URL=${REACT_APP_API_URL:-"http://localhost:5001/api"}
REACT_APP_ENV=${REACT_APP_ENV:-"production"}

echo "🚀 Starting EthioHeritage360 Frontend..."
echo "Environment: $REACT_APP_ENV"
echo "API URL: $REACT_APP_API_URL"

# Function to replace environment variables in built files
replace_env_vars() {
    echo "📝 Injecting environment variables into built files..."
    
    # Find all JS files in the build directory
    find /usr/share/nginx/html -name "*.js" -type f -exec grep -l "REACT_APP_" {} \; | while read -r file; do
        echo "Processing: $file"
        
        # Replace environment variables
        sed -i "s|REACT_APP_API_URL_PLACEHOLDER|$REACT_APP_API_URL|g" "$file"
        sed -i "s|REACT_APP_ENV_PLACEHOLDER|$REACT_APP_ENV|g" "$file"
    done
    
    # Also check HTML files
    find /usr/share/nginx/html -name "*.html" -type f -exec grep -l "REACT_APP_" {} \; | while read -r file; do
        echo "Processing HTML: $file"
        
        # Replace environment variables
        sed -i "s|REACT_APP_API_URL_PLACEHOLDER|$REACT_APP_API_URL|g" "$file"
        sed -i "s|REACT_APP_ENV_PLACEHOLDER|$REACT_APP_ENV|g" "$file"
    done
    
    echo "✅ Environment variables injected successfully!"
}

# Inject environment variables
replace_env_vars

# Create runtime environment configuration
echo "📋 Creating runtime configuration..."
cat > /usr/share/nginx/html/config.json << EOF
{
  "REACT_APP_API_URL": "$REACT_APP_API_URL",
  "REACT_APP_ENV": "$REACT_APP_ENV",
  "VERSION": "$(date +%Y%m%d-%H%M%S)",
  "BUILD_TIME": "$(date -Iseconds)"
}
EOF

echo "🏥 Running health check..."
if [ -f "/usr/share/nginx/html/index.html" ]; then
    echo "✅ Frontend assets found and ready!"
else
    echo "❌ ERROR: Frontend build files not found!"
    exit 1
fi

echo "🎯 Starting Nginx server..."
echo "Frontend will be available at: http://localhost:3000"
echo "Health check endpoint: http://localhost:3000/health"

# Execute the main command
exec "$@"
