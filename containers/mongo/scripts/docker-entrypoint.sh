#!/bin/bash

chown mongodb:mongodb /tmp/mongodb-27017.sock

initDB() {
  if [ "$ENABLE_AUTH" == "true" ]; then
    KEY_FILE=${KEY_FILE:-"/etc/mongo/mongod-keyfile"};
    /usr/bin/mongod --auth --keyFile $KEY_FILE --bind_ip_all --replSet rs0
  else
    initReplicaSet
    initReplica & /usr/bin/mongod --bind_ip_all --replSet rs0
  fi
}

initDB
