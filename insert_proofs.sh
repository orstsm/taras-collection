#!/bin/bash
URL="https://asltoyrmipekmbsuhfvo.supabase.co/rest/v1/proofs"
KEY="sb_publishable_mn_d7xVx13Jy165OUTSH3g_YcUtaDEr"

# Array of proofs
proofs=(
  '{"id":"proof-1","image":"assets/proofs/proof-1.jpg","link":"https://www.facebook.com/photo?fbid=1496846199120652&set=pb.100063858590900.-2207520000","caption":"Verified Transaction #1 - Delivered Safely","created_at":"2026-08-01T00:00:00Z"}'
  '{"id":"proof-2","image":"assets/proofs/proof-2.jpg","link":"https://www.facebook.com/photo.php?fbid=1463990942406178&set=pb.100063858590900.-2207520000&type=3","caption":"Verified Transaction #2 - Custom Order Complete","created_at":"2026-08-02T00:00:00Z"}'
  '{"id":"proof-3","image":"assets/proofs/proof-3.jpg","link":"https://www.facebook.com/photo?fbid=1434517582020181&set=pb.100063858590900.-2207520000","caption":"Verified Transaction #3 - Cleansed & Shipped","created_at":"2026-08-03T00:00:00Z"}'
  '{"id":"proof-4","image":"assets/proofs/proof-4.jpg","link":"https://www.facebook.com/photo?fbid=1406069524864987&set=pb.100063858590900.-2207520000","caption":"Verified Transaction #4 - Happy Client!","created_at":"2026-08-04T00:00:00Z"}'
  '{"id":"proof-5","image":"assets/proofs/proof-5.jpg","link":"https://www.facebook.com/photo?fbid=1405798064892133&set=pb.100063858590900.-2207520000","caption":"Verified Transaction #5 - J&T Nationwide Dispatch","created_at":"2026-08-05T00:00:00Z"}'
  '{"id":"proof-6","image":"assets/proofs/proof-6.jpg","link":"https://www.facebook.com/photo?fbid=1405797881558818&set=pb.100063858590900.-2207520000","caption":"Verified Transaction #6 - Authentic Earth Elements","created_at":"2026-08-06T00:00:00Z"}'
)

for payload in "${proofs[@]}"; do
  curl -s -X POST "$URL" \
    -H "apikey: $KEY" \
    -H "Authorization: Bearer $KEY" \
    -H "Content-Type: application/json" \
    -d "$payload"
done
