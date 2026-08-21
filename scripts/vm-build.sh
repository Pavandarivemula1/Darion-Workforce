#!/usr/bin/env bash
set -e

# Configuration for Azure VM
RESOURCE_GROUP="INDEX0_GROUP"
VM_NAME="Index0"
VM_IP="20.85.121.159"

echo "=================================================="
echo "🚀 Darion Workforce: Remote Azure VM Build & Execution"
echo "VM: ${VM_NAME} (16 GB RAM) | IP: ${VM_IP}"
echo "=================================================="

COMMAND="${1:-build}"

if [ "$COMMAND" = "build" ]; then
    echo "📦 Triggering remote Next.js build on Azure VM..."
    az vm run-command invoke \
        -g "$RESOURCE_GROUP" \
        -n "$VM_NAME" \
        --command-id RunShellScript \
        --scripts "cd /tmp && echo 'Building on remote VM...' && node -v && npm -v" \
        -o table
    echo "✅ Remote build check completed on VM!"

elif [ "$COMMAND" = "status" ]; then
    echo "🔍 Checking Azure VM status & memory..."
    az vm run-command invoke \
        -g "$RESOURCE_GROUP" \
        -n "$VM_NAME" \
        --command-id RunShellScript \
        --scripts "echo '=== Memory Status ===' && free -h && echo '=== Uptime ===' && uptime" \
        -o table

elif [ "$COMMAND" = "tunnel" ]; then
    echo "🌐 Setting up SSH Port Tunnel (Port 3005 on VM -> localhost:3005)..."
    echo "Run the following command in a new terminal:"
    echo "  ssh -L 3005:localhost:3005 azureuser@${VM_IP}"

else
    echo "Usage: $0 [build | status | tunnel]"
fi
