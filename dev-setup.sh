#!/bin/bash

# BackLogus Development Helper Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    # Check for Docker Compose
    if docker compose version &> /dev/null; then
        DOCKER_COMPOSE="docker compose"
    else
        print_error "Docker Compose is not available. Please install Docker Compose."
        print_error "For newer Docker versions, make sure Docker Compose plugin is installed."
        exit 1
    fi
    
    print_status "Using Docker Compose command: $DOCKER_COMPOSE"
}

# Start database
start_db() {
    print_status "Starting PostgreSQL database container..."
    $DOCKER_COMPOSE -f docker-compose.dev.yml up -d
    
    print_status "Waiting for database to be ready..."
    sleep 5
    
    # Check if database is ready
    if $DOCKER_COMPOSE -f docker-compose.dev.yml ps | grep -q "healthy\|running"; then
        print_status "Database is ready!"
    else
        print_warning "Database might still be starting up. Please wait a moment and try again."
    fi
}

# Stop database
stop_db() {
    print_status "Stopping database container..."
    $DOCKER_COMPOSE -f docker-compose.dev.yml down
}

# Setup database schema
setup_db() {
    print_status "Setting up database schema..."
    cd backend
    npm run db:push
    cd ..
    print_status "Database schema setup complete!"
}

# Install dependencies
install_deps() {
    print_status "Installing frontend dependencies..."
    cd frontend && npm install && cd ..
    
    print_status "Installing backend dependencies..."
    cd backend && npm install && cd ..
    
    print_status "Dependencies installed!"
}

# Start development servers
start_dev() {
    print_status "Starting development servers..."
    print_status "Frontend will be available at: http://localhost:5173"
    print_status "Backend API will be available at: http://localhost:3001"
    print_warning "Make sure the database is running first!"
}

# Show usage
show_help() {
    echo "BackLogus Development Helper"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  start-db     Start PostgreSQL database container"
    echo "  stop-db      Stop database container"
    echo "  setup-db     Set up database schema (run after start-db)"
    echo "  install      Install dependencies for frontend and backend"
    echo "  dev          Show instructions for starting development servers"
    echo "  help         Show this help message"
    echo ""
    echo "Quick start:"
    echo "  $0 start-db"
    echo "  $0 setup-db"
    echo "  $0 dev"
}

# Main script logic
case "$1" in
    "start-db")
        check_docker
        start_db
        ;;
    "stop-db")
        check_docker
        stop_db
        ;;
    "setup-db")
        setup_db
        ;;
    "install")
        install_deps
        ;;
    "dev")
        start_dev
        ;;
    "help"|"--help"|"-h")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
