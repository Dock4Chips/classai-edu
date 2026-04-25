#!/bin/bash

mkdir -p /Users/dock4chips/volumes/frp

cat > /Users/dock4chips/volumes/frp/frpc.ini <<EOF
[common]
server_addr = 175.27.242.42
server_port = 7000
token = abc123

[app7869]
type = tcp
local_ip = host.docker.internal
local_port = 7869
remote_port = 6000

[app3000]
type = tcp
local_ip = host.docker.internal
local_port = 3000
remote_port = 6001

[app4000]
type = tcp
local_ip = host.docker.internal
local_port = 4000
remote_port = 6002

[app11434]
type = tcp
local_ip = host.docker.internal
local_port = 11434
remote_port = 6003

[minio-api]
type = tcp
local_ip = host.docker.internal
local_port = 9000
remote_port = 6004

[minio-console]
type = tcp
local_ip = host.docker.internal
local_port = 9001
remote_port = 6005

EOF

docker rm -f frpc 2>/dev/null

docker run -d \
  --name frpc \
  -v /Users/dock4chips/volumes/frp/frpc.ini:/etc/frp/frpc.ini \
  snowdreamtech/frpc \
  frpc -c /etc/frp/frpc.ini