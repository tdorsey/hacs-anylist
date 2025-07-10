#!/bin/bash
# Health check script for HACS AnyList
# This script is used by Docker health checks to verify service availability
# Related to TypeScript conversion issue: #1

set -e

# Configuration
HOST=${HEALTH_CHECK_HOST:-localhost}
PORT=${HEALTH_CHECK_PORT:-3000}
TIMEOUT=${HEALTH_CHECK_TIMEOUT:-10}
ENDPOINT=${HEALTH_CHECK_ENDPOINT:-/health}

# Function to check HTTP endpoint
check_http() {
    local url="http://${HOST}:${PORT}${ENDPOINT}"
    
    if command -v curl >/dev/null 2>&1; then
        curl -f -s --max-time "$TIMEOUT" "$url" >/dev/null
    elif command -v wget >/dev/null 2>&1; then
        wget -q --timeout="$TIMEOUT" --spider "$url"
    else
        echo "Error: Neither curl nor wget is available for health check"
        exit 1
    fi
}

# Function to check TCP port
check_tcp() {
    if command -v nc >/dev/null 2>&1; then
        nc -z -w "$TIMEOUT" "$HOST" "$PORT"
    elif command -v telnet >/dev/null 2>&1; then
        timeout "$TIMEOUT" telnet "$HOST" "$PORT" </dev/null >/dev/null 2>&1
    else
        echo "Error: Neither nc nor telnet is available for TCP check"
        exit 1
    fi
}

# Main health check
main() {
    case "${1:-http}" in
        "http")
            check_http
            ;;
        "tcp")
            check_tcp
            ;;
        *)
            echo "Usage: $0 [http|tcp]"
            exit 1
            ;;
    esac
}

# Run health check
main "$@"