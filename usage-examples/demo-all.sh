#!/bin/bash
node demo-async-iter.js || exit 10
node demo-callbacks.js || exit 20
node demo-next-symbol.js || exit 30
node demo-wait-all.js || exit 40
exit 0


