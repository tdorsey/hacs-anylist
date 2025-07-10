#!/bin/bash

# Docker Development Setup Script for HACS Anylist TypeScript Project
# This script helps set up the development environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    print_info "Checking prerequisites..."
    
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command_exists docker-compose; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check if Docker is running
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Setup environment file
setup_environment() {
    print_info "Setting up environment configuration..."
    
    if [ ! -f .env ]; then
        if [ -f .env.example ]; then
            cp .env.example .env
            print_success "Created .env file from template"
            print_warning "Please edit .env file with your configuration before starting services"
        else
            print_error ".env.example file not found"
            exit 1
        fi
    else
        print_info ".env file already exists"
    fi
}

# Build development image
build_dev_image() {
    print_info "Building development Docker image..."
    docker-compose build hacs-anylist-dev
    print_success "Development image built successfully"
}

# Start development services
start_dev_services() {
    print_info "Starting development services..."
    docker-compose --profile development up -d
    print_success "Development services started"
    
    print_info "Services available at:"
    echo "  - Application: http://localhost:3000"
    echo "  - Debug Port: http://localhost:9229"
    echo "  - Home Assistant: http://localhost:8123"
}

# Show logs
show_logs() {
    print_info "Showing development logs (press Ctrl+C to exit)..."
    docker-compose --profile development logs -f
}

# Stop services
stop_services() {
    print_info "Stopping development services..."
    docker-compose --profile development down
    print_success "Development services stopped"
}

# Clean up
cleanup() {
    print_info "Cleaning up Docker resources..."
    docker-compose down --volumes --remove-orphans
    docker system prune -f
    print_success "Cleanup completed"
}

# Show help
show_help() {
    echo "HACS Anylist Docker Development Setup Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  setup     - Setup development environment"
    echo "  build     - Build development Docker image"
    echo "  start     - Start development services"
    echo "  stop      - Stop development services"
    echo "  logs      - Show development logs"
    echo "  restart   - Restart development services"
    echo "  cleanup   - Clean up Docker resources"
    echo "  help      - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 setup     # Initial setup"
    echo "  $0 start     # Start development environment"
    echo "  $0 logs      # View logs"
}

# Main script logic
main() {
    case "${1:-setup}" in
        setup)
            check_prerequisites
            setup_environment
            build_dev_image
            print_success "Development environment setup complete!"
            print_info "Run '$0 start' to start development services"
            ;;
        build)
            check_prerequisites
            build_dev_image
            ;;
        start)
            check_prerequisites
            start_dev_services
            ;;
        stop)
            stop_services
            ;;
        logs)
            show_logs
            ;;
        restart)
            stop_services
            start_dev_services
            ;;
        cleanup)
            cleanup
            ;;
        help)
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"