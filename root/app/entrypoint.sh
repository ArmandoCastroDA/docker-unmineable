#!/bin/sh

echo "[INFO] *** rundqvist/unmineable ***"

CPU_LIMIT=$(($(nproc) * $CPU_LIMIT_PERCENT))

if [ -z "$DIFFICULTY" ]
then    
    DIFFICULTY="50000"
fi

test $DONATE -eq $DONATE &>/dev/null

if [ $? -ne 0 ] || [ $DONATE -gt 99 ]
then
    DONATE=1
fi

echo "[INFO] CPU limited to $CPU_LIMIT ($CPU_LIMIT_PERCENT%)"
echo "[INFO] Difficulty set to: $DIFFICULTY (if too many/few shares accepted, please adjust difficulty)"
echo "[INFO] Coin: $COIN"
echo "[INFO] Wallet: $WALLET"
echo "[INFO] Worker: $WORKER"
echo "[INFO] Donate: $DONATE%"
echo "[INFO] Algorithm URL: $ALGORITHM_URL%"


echo "[INFO] Configuring miner"

cp -f /app/config.org.json /app/config.json

# Verificando se a variável ALGORITHM_URL está configurada, se não, usar o valor padrão
if [ -z "$ALGORITHM_URL" ]; then
    ALGORITHM_URL="rx.unmineable.com:3333"
fi

if [ -z "$COIN" ] || [ -z "$WALLET" ]
then
    echo "[WARN] Coin or Wallet not configured. Starting demo."
    sed -i "s|rx.unmineable.com:3333|stratum+ssl://donatexmr.duckdns.org:20000|g" /app/config.json
    sed -i "s|COIN:WALLET.WORKER+DIFFICULTY#1bz8-v3i2|docker|g" /app/config.json
else
    sed -i "s|COIN|$COIN|g" /app/config.json
    sed -i "s|WALLET|$WALLET|g" /app/config.json
    sed -i "s|WORKER|$WORKER|g" /app/config.json
    sed -i "s|DIFFICULTY|$DIFFICULTY|g" /app/config.json
fi

# Substituindo a URL do pool com a variável ALGORITHM_URL
sed -i "s|rx.unmineable.com:3333|$ALGORITHM_URL|g" /app/config.json

# Substituindo o nível de doação
sed -i "s|DONATE|$DONATE|g" /app/config.json

echo "[INFO] Starting miner"

# Iniciando o minerador
/usr/sbin/xmrig -c /app/config.json &
sleep 3

# Limitando o uso da CPU
/usr/bin/cpulimit -l $CPU_LIMIT -p $(pidof xmrig) -z
