#!/bin/bash

sleep 10

/opt/bitnami/kafka/bin/kafka-topics.sh --create --if-not-exists \
  --bootstrap-server kafka:9092 --replication-factor 1 --partitions 1 \
  --topic order.payment.verify

/opt/bitnami/kafka/bin/kafka-topics.sh --create --if-not-exists \
  --bootstrap-server kafka:9092 --replication-factor 1 --partitions 1 \
  --topic payment.verified

echo "✅ Kafka topics created"
