#!/bin/bash

# 定义容器名称和端口映射
CONTAINER_NAME=evideo
# 指定构建目录
BUILD_DIR="/dockerServer/EVideo"
current_path=$(pwd)

# 检测当前路径是否为目标路径
if [ "$current_path" == "$BUILD_DIR" ]; then
    echo "当前路径为 $BUILD_DIR，继续执行其他操作..."
else
    echo "当前路径不是 $BUILD_DIR，跳转到 $BUILD_DIR..."
    cd "$BUILD_DIR"
fi


# 检查 evideo 容器是否在运行中
if docker container ls -a --filter name=$CONTAINER_NAME | grep -q $CONTAINER_NAME
then
    echo "evideo 容器正在运行，将停止它..."
    # 停止 evideo 容器
    docker container stop evideo
    # 删除 evideo 容器
    docker container rm evideo
else
    echo "evideo 容器未在运行中"
fi


echo "编译node"
cd "$BUILD_DIR"
docker build -t evideo .
docker run  -d -p 9002:9002 -p 8002:8002 -p 8003:8003 --name evideo evideo
echo "done"

