#!/bin/bash

export PORT=5100

cd ~/www/othello
./bin/othello stop || true
./bin/othello start

