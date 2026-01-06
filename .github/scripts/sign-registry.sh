#!/usr/bin/env bash
set -e

REGISTRY="bdoi_registry.json"
SIG="registry.sig"
KEY="bdoi_private_key.pem"

if [ ! -f "$KEY" ]; then
  echo "Missing private key: $KEY"
  exit 1
fi

openssl dgst -sha256 -sign "$KEY" -out "$SIG" "$REGISTRY"
echo "Registry signed → $SIG"
