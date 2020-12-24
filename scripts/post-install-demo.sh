#!/bin/bash
# This script assumes task-serializer is under node_modules.
# Side effects: 
#  npm install --save-dev 
#    mini-preproc
#    typescript  
#    @types/node
#    @tsconfig/recommended
#    @tsconfig/node14
#  Creates files: ./tsconfig.recommended.json, ./tsconfig.node14.json
#  Creates directories demo-js, demo-ts with subdirs and files underneath each  
node node_modules/task-serializer/scripts-ts/post-install-demo.js\
  node_modules/task-serializer/tests-js demo-js\
  node_modules/task-serializer/tests-ts demo-ts

