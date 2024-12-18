#!/bin/bash

# Table name
TABLE_NAME="Pota-To-Go-orders"

# Add 10 sample orders
for i in {1..10}
do
  aws dynamodb put-item --table-name $TABLE_NAME --item '{
    "orderId": {"S": "order000'$i'"},
    "customerName": {"S": "Customer'$i'"},
    "orderStatus": {"S": "'$(if ((i % 2 == 0)); then echo "in progress"; else echo "pending"; fi)'"},
    "orderItem1": {"L": [{"S": "Potato'$i'"}, {"S": "Butter"}, {"S": "Chives"}]},
    "specials1": {"S": "Special Item '$i'"},
    "totalPrice": {"N": "'$((50 + i * 5))'"},
    "updatedAt": {"S": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}
  }'
  echo "Added order order000$i"
done

echo "All 10 orders added successfully!"
