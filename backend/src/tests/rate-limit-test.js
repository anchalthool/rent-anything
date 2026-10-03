import http from "k6/http";

export const options = {
  vus: 1,
  iterations: 10,
};

export default function () {
  const res = http.get("http://localhost:3000/listings");

  console.log(`status=${res.status}`);
}