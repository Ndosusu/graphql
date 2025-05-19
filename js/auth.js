const API_URL = "https://zone01normandie.org/api/auth/signin";

export async function loginUser(username, password) {
  const basicAuth = btoa(`${username}:${password}`);
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${basicAuth}`
      }
    });

    if (!res.ok) throw new Error("Invalid credentials");

    const data = await res.json();
    localStorage.setItem("jwt", data);
    return true;
  } catch (err) {
    console.error("Login failed:", err);
    return false;
  }
}

export function logoutUser() {
  localStorage.removeItem("jwt");
}

export function getToken() {
  return localStorage.getItem("jwt");
}
