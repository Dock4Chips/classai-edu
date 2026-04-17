#!/bin/bash

mkdir -p /data/frp

cat > /data/frp/frps.ini <<EOF
[common]
bind_port = 7000
token = abc123
EOF

docker rm -f frps 2>/dev/null

docker run -d \
  --name frps \
  --restart=always \
  -p 7000:7000 \
  -p 6000-6010:6000-6010 \
  -v /data/frp/frps.ini:/etc/frp/frps.toml \
  snowdreamtech/frps