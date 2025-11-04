#!/bin/bash

# RPC URL Generator and Tester for RedzExchange
# This script helps you find the best RPC endpoint for your application

set -e

echo "🚀 RedzExchange RPC URL Generator & Tester"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# RPC Endpoints
declare -A RPC_ENDPOINTS=(
    # Free Public Endpoints
    ["solana-labs"]="https://api.mainnet-beta.solana.com"
    ["ankr"]="https://rpc.ankr.com/solana"
    ["serum"]="https://solana-api.projectserum.com"
    
    # Premium Endpoints (demo keys - replace with your own)
    ["alchemy-demo"]="https://solana-mainnet.g.alchemy.com/v2/demo"
    ["quicknode-demo"]="https://api.quicknode.com/solana"
    ["genesysgo"]="https://ssc-dao.genesysgo.net"
    ["triton-demo"]="https://solana-mainnet.phantom.tech"
)

# Test RPC endpoint function
test_rpc() {
    local name=$1
    local url=$2
    local timeout=10
    
    echo -n "Testing ${name}... "
    
    # Test with curl and measure response time
    local start_time=$(date +%s%3N)
    local response=$(curl -s -m $timeout -X POST \
        -H 'Content-Type: application/json' \
        -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}' \
        "$url" 2>/dev/null || echo "error")
    local end_time=$(date +%s%3N)
    local latency=$((end_time - start_time))
    
    if [[ "$response" == *"ok"* ]] || [[ "$response" == *"result"* ]]; then
        echo -e "${GREEN}✓ OK${NC} (${latency}ms)"
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        return 1
    fi
}

# Show menu
show_menu() {
    echo
    echo "Choose an option:"
    echo "1) Test all RPC endpoints"
    echo "2) Generate .env file with fastest endpoint"
    echo "3) Show all available endpoints"
    echo "4) Test custom RPC URL"
    echo "5) Exit"
    echo
}

# Test all endpoints
test_all_endpoints() {
    echo
    echo -e "${BLUE}Testing all RPC endpoints...${NC}"
    echo "================================"
    
    local working_endpoints=()
    local fastest_endpoint=""
    local fastest_latency=999999
    
    for name in "${!RPC_ENDPOINTS[@]}"; do
        url="${RPC_ENDPOINTS[$name]}"
        
        local start_time=$(date +%s%3N)
        if test_rpc "$name" "$url"; then
            local end_time=$(date +%s%3N)
            local latency=$((end_time - start_time))
            working_endpoints+=("$name:$url:$latency")
            
            if (( latency < fastest_latency )); then
                fastest_latency=$latency
                fastest_endpoint="$name:$url"
            fi
        fi
    done
    
    echo
    if [ ${#working_endpoints[@]} -eq 0 ]; then
        echo -e "${RED}❌ No working endpoints found!${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ Working endpoints found: ${#working_endpoints[@]}${NC}"
    
    if [ -n "$fastest_endpoint" ]; then
        IFS=':' read -r name url <<< "$fastest_endpoint"
        echo -e "${YELLOW}⚡ Fastest endpoint: $name ($url) - ${fastest_latency}ms${NC}"
        echo
        echo "Recommended .env configuration:"
        echo "NEXT_PUBLIC_RPC_URL=$url"
    fi
}

# Generate .env file
generate_env_file() {
    echo
    echo -e "${BLUE}Generating .env file with optimal settings...${NC}"
    
    # Test endpoints and find fastest
    local fastest_url="https://api.mainnet-beta.solana.com"
    local fastest_latency=999999
    
    for name in "${!RPC_ENDPOINTS[@]}"; do
        url="${RPC_ENDPOINTS[$name]}"
        
        echo -n "Testing $name... "
        local start_time=$(date +%s%3N)
        local response=$(curl -s -m 5 -X POST \
            -H 'Content-Type: application/json' \
            -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}' \
            "$url" 2>/dev/null || echo "error")
        local end_time=$(date +%s%3N)
        local latency=$((end_time - start_time))
        
        if [[ "$response" == *"ok"* ]] || [[ "$response" == *"result"* ]]; then
            echo -e "${GREEN}${latency}ms${NC}"
            if (( latency < fastest_latency )); then
                fastest_latency=$latency
                fastest_url=$url
            fi
        else
            echo -e "${RED}failed${NC}"
        fi
    done
    
    # Create .env file
    cat > .env.local << EOF
# RedzExchange Configuration (Auto-generated: $(date))
NEXT_PUBLIC_NETWORK=mainnet
NEXT_PUBLIC_RPC_URL=$fastest_url
NEXT_PUBLIC_PROGRAM_ID=9HiX1zn36tRsmqJp2F1sGFNVFimoVcbe9JMGSUo9LsiV
NEXT_PUBLIC_APP_NAME=RedzExchange
NEXT_PUBLIC_APP_VERSION=1.0.0
EOF
    
    echo
    echo -e "${GREEN}✅ .env.local file generated successfully!${NC}"
    echo -e "${YELLOW}📝 Using fastest endpoint: $fastest_url (${fastest_latency}ms)${NC}"
    echo
    echo "File contents:"
    cat .env.local
}

# Show all endpoints
show_all_endpoints() {
    echo
    echo -e "${BLUE}Available RPC Endpoints:${NC}"
    echo "========================"
    
    for name in "${!RPC_ENDPOINTS[@]}"; do
        url="${RPC_ENDPOINTS[$name]}"
        echo -e "${YELLOW}$name:${NC} $url"
    done
    
    echo
    echo -e "${BLUE}Premium Endpoints (require API keys):${NC}"
    echo "======================================"
    echo -e "${YELLOW}Alchemy:${NC} https://solana-mainnet.g.alchemy.com/v2/YOUR_API_KEY"
    echo -e "${YELLOW}QuickNode:${NC} https://YOUR_ENDPOINT.quiknode.pro/YOUR_API_KEY"
    echo -e "${YELLOW}Helius:${NC} https://rpc.helius.xyz/?api-key=YOUR_API_KEY"
    echo -e "${YELLOW}Triton:${NC} https://YOUR_ENDPOINT.rpcpool.com/YOUR_API_KEY"
}

# Test custom URL
test_custom_url() {
    echo
    read -p "Enter RPC URL to test: " custom_url
    
    if [ -z "$custom_url" ]; then
        echo -e "${RED}❌ No URL provided${NC}"
        return 1
    fi
    
    echo
    test_rpc "custom" "$custom_url"
}

# Main loop
while true; do
    show_menu
    read -p "Enter your choice [1-5]: " choice
    
    case $choice in
        1)
            test_all_endpoints
            ;;
        2)
            generate_env_file
            ;;
        3)
            show_all_endpoints
            ;;
        4)
            test_custom_url
            ;;
        5)
            echo -e "${GREEN}👋 Goodbye!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Invalid option. Please choose 1-5.${NC}"
            ;;
    esac
    
    echo
    read -p "Press Enter to continue..."
done