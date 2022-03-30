import { strict as assert } from "assert";
import fetch from "node-fetch";
import { v4 } from "uuid";

const apiUrl = "http://0.0.0.0:3000/api/v1";

async function basicTest() {
  const now = new Date();
  const pickupTime = new Date(now).setMinutes(now.getMinutes() + 10);
  const dropoffTime = new Date(now).setMinutes(now.getMinutes() + 30);
  const driverId = v4();
  let body = {
    _id: v4(),
    driverId,
    timestamp: now.toISOString(),
    customerName: "Bob Builder",
    businessName: "McDonalds #1764",
    basePay: 10.0,
    subtotal: 50.0,
    tip: 5.0,
    pickupTime,
    dropoffTime,
  };
  let respInsert = await fetch(apiUrl + `/delivery`, {
    method: "post",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
  assert.equal(respInsert.status, 200, await respInsert.text());

  let respGet = await fetch(`${apiUrl}/driver/${driverId}/delivery`, {
    method: "get",
    headers: { "Content-Type": "application/json" },
  });
  assert.equal(respInsert.status, 200);
  assert.deepEqual([body], (await respGet.json()).deliveries);
  console.log(
    `Successfully sent and received back a mock delivery for driver ${driverId}`
  );

  body = {
    _id: v4(),
    driverId,
    timestamp: now.toISOString(),
    customerName: "Mickey Mouse",
    businessName: "Taco Bell #1764",
    basePay: 15.0,
    subtotal: 80.0,
    tip: 10.0,
    pickupTime,
    dropoffTime,
  };
  respInsert = await fetch(apiUrl + `/delivery`, {
    method: "post",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
  console.log(`Sent mock delivery with driver id ${driverId}`);
  assert.equal(respInsert.status, 200, await respInsert.text());

  respGet = await fetch(`${apiUrl}/driver/${driverId}/delivery`, {
    method: "get",
    headers: { "Content-Type": "application/json" },
  });
  assert.equal(respInsert.status, 200);
  assert.equal(2, (await respGet.json()).deliveries.length);
  console.log(
    `Successfully sent and received back multiple mock deliveries for driver ${driverId}`
  );
}

async function missingDriverQuery() {
  const driverId = v4();
  const respGet = await fetch(`${apiUrl}/driver/${driverId}/delivery`, {
    method: "get",
    headers: { "Content-Type": "application/json" },
  });
  assert.deepEqual([], (await respGet.json()).deliveries);
  console.log("Received no deliveries for a missing driver");
}

async function testSuite() {
  await basicTest();
  await missingDriverQuery();
}

testSuite().finally(console.log);
