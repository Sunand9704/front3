const BASE_URL =  "https://back3-728k.onrender.com/api";

export async function loginVendor(email, password, category) {
  const response = await fetch(`${BASE_URL}/vendor/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, category }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Login failed");
  }
  return response.json();
}

export const fetchBambooOrders = async (token) => {
  const res = await fetch(`${BASE_URL}/orders/admin/bamboo-orders`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error("Failed to fetch orders");
  return await res.json();
};

export const sendVendorOtp = async (email) => {
  const res = await fetch(`${BASE_URL}/vendor/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to send OTP");
  return data;
};

export const verifyVendorOtp = async (email, otp) => {
  const res = await fetch(`${BASE_URL}/vendor/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Invalid or expired OTP");
  return data;
};

export const resetVendorPassword = async (email, otp, newPassword) => {
  const res = await fetch(`${BASE_URL}/vendor/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp, newPassword }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to reset password");
  return data;
};

export const updateOrderStatus = async (orderId, status, token) => {
  const res = await fetch(`${BASE_URL}/orders/${orderId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
  const data = await res.json();
  if (!res.ok)
    throw new Error(
      data.error || data.message || "Failed to update order status"
    );
  return data;
};
