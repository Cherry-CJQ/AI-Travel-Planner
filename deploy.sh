#!/bin/bash

# AI旅行规划助手部署脚本
set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查Docker是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker未安装，请先安装Docker"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose未安装，请先安装Docker Compose"
        exit 1
    fi
    
    log_info "Docker和Docker Compose已安装"
}

# 构建镜像
build_image() {
    log_info "开始构建Docker镜像..."
    docker-compose build
    log_info "Docker镜像构建完成"
}

# 启动服务
start_services() {
    log_info "启动服务..."
    docker-compose up -d
    log_info "服务启动完成"
}

# 停止服务
stop_services() {
    log_info "停止服务..."
    docker-compose down
    log_info "服务停止完成"
}

# 重启服务
restart_services() {
    log_info "重启服务..."
    docker-compose restart
    log_info "服务重启完成"
}

# 查看日志
view_logs() {
    log_info "查看服务日志..."
    docker-compose logs -f
}

# 健康检查
health_check() {
    log_info "执行健康检查..."
    sleep 10  # 等待服务启动
    
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        log_info "应用健康检查通过"
    else
        log_error "应用健康检查失败"
        exit 1
    fi
}

# 清理资源
cleanup() {
    log_info "清理未使用的Docker资源..."
    docker system prune -f
    log_info "资源清理完成"
}

# 显示帮助
show_help() {
    echo "AI旅行规划助手部署脚本"
    echo ""
    echo "使用方法: $0 [命令]"
    echo ""
    echo "命令:"
    echo "  build     构建Docker镜像"
    echo "  start     启动服务"
    echo "  stop      停止服务"
    echo "  restart   重启服务"
    echo "  logs      查看日志"
    echo "  deploy    完整部署（构建+启动）"
    echo "  health    健康检查"
    echo "  cleanup   清理资源"
    echo "  help      显示帮助信息"
    echo ""
}

# 主函数
main() {
    local command=$1
    
    case $command in
        "build")
            check_docker
            build_image
            ;;
        "start")
            check_docker
            start_services
            ;;
        "stop")
            check_docker
            stop_services
            ;;
        "restart")
            check_docker
            restart_services
            ;;
        "logs")
            view_logs
            ;;
        "deploy")
            check_docker
            build_image
            start_services
            health_check
            ;;
        "health")
            health_check
            ;;
        "cleanup")
            cleanup
            ;;
        "help"|"")
            show_help
            ;;
        *)
            log_error "未知命令: $command"
            show_help
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"