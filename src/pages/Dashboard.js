import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Chip,
  AppBar,
  Toolbar,
  Container,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { fetchBambooOrders, updateOrderStatus } from "../api";
// Adjust if backend runs on a different port

const statusColor = (status) => {
  switch (status) {
    case "Pending":
    case "pending":
      return "warning";
    case "Shipped":
    case "confirmed":
      return "info";
    case "Delivered":
    case "delivered":
      return "success";
    case "Cancelled":
    case "cancelled":
      return "error";
    default:
      return "default";
  }
};

const ORDER_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "out_for_delivery", label: "Out for Delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // PATCH order status handler
  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    setError("");
    try {
      const token = localStorage.getItem("token") || "YOUR_ADMIN_JWT_TOKEN";
      await updateOrderStatus(orderId, newStatus, token);
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      setError(err.message || "Error updating status");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token") || "YOUR_ADMIN_JWT_TOKEN";
        const data = await fetchBambooOrders(token);
        setOrders(data);
      } catch (err) {
        setError(err.message || "Error fetching orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <Box sx={{ bgcolor: "#f4f6fa", minHeight: "100vh" }}>
      <AppBar position="static" color="default" elevation={1} sx={{ mb: 4 }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6" color="primary" fontWeight={700}>
            
            Win2Grow
          </Typography>
          <Typography variant="h6" color="primary" fontWeight={700}>
            
          
            Vendor Panel
          </Typography>
          <Button variant="outlined" color="secondary" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md">
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600, color: "#222" }}>
          Bamboo Orders
        </Typography>
        <Card sx={{ boxShadow: 3, borderRadius: 3 }}>
          <CardContent>
            {loading ? (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight={200}
              >
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error">{error}</Alert>
            ) : (
              <TableContainer
                component={Paper}
                sx={{ borderRadius: 2, overflowX: "auto" }}
              >
                <Table sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow sx={{ background: "#f0f4f8" }}>
                      <TableCell sx={{ fontWeight: 600 }}>Order ID</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Product(s)</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No bamboo orders found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      orders.map((order) => (
                        <TableRow
                          key={order._id}
                          sx={{
                            "&:hover": { background: "#f5f7fa" },
                            transition: "background 0.2s",
                          }}
                        >
                          <TableCell>{order._id}</TableCell>
                          <TableCell>{order.user?.name || "N/A"}</TableCell>
                          <TableCell>
                            {order.items
                              .filter(
                                (item) =>
                                  item.product &&
                                  item.product.category &&
                                  item.product.category
                                    .toLowerCase()
                                    .includes("bamboo")
                              )
                              .map(
                                (item) =>
                                  `${item.product.name} (x${item.quantity})`
                              )
                              .join(", ")}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>
                            ₹{order.totalAmount}
                          </TableCell>
                          <TableCell>
                            <select
                              value={order.status}
                              onChange={(e) =>
                                handleStatusChange(order._id, e.target.value)
                              }
                              disabled={updatingOrderId === order._id}
                              style={{
                                padding: "4px 8px",
                                borderRadius: 4,
                                border: "1px solid #ccc",
                                fontWeight: 600,
                                background:
                                  updatingOrderId === order._id
                                    ? "#f0f0f0"
                                    : "#fff",
                              }}
                            >
                              {ORDER_STATUSES.map((status) => (
                                <option key={status.value} value={status.value}>
                                  {status.label}
                                </option>
                              ))}
                            </select>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Dashboard;
