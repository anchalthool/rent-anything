import http from "k6/http";
import { check } from "k6";

export const options = {
  vus: 4,
  iterations: 4
};

export default function () {
  if (!__ENV.TEST_AUTH_TOKEN) {
    throw new Error("Set TEST_AUTH_TOKEN to a valid login token before running this test.");
  }
  const url = "http://localhost:3000/bookings";

  const payload = JSON.stringify({
    listingId: 1,
    startDate: "2026-12-10",
    endDate: "2026-12-12"
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${__ENV.TEST_AUTH_TOKEN}`
    }
  };

  const response = http.post(url, payload, params);

  console.log(
    `status=${response.status} body=${response.body}`
  );

  check(response, {
    "request finished": (r) =>
      r.status === 201 || r.status === 400
  });
}