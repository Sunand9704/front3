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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Avatar,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { fetchAllOrders, updateOrderStatus } from "../api";
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
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Retrieve selected category from localStorage (set after login)
  const selectedCategory = localStorage.getItem("selectedCategory");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("selectedCategory");
    navigate("/login");
  };

  // Dialog handlers
  const handleRowClick = (order) => {
    setSelectedOrder(order);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedOrder(null);
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
        const data = await fetchAllOrders(token);
        console.log(data, "data");

        setOrders(data);
      } catch (err) {
        setError(err.message || "Error fetching orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);
  console.log(selectedCategory, "selectedCategory");

  // Filter orders by selected category
  const filteredOrders = selectedCategory
    ? orders.filter((order) =>
        order.items.some(
          (item) =>
            item.product &&
            item.category &&
            item.category.toLowerCase() ===
              selectedCategory.toLowerCase()
        )
      )
    : orders;

  // Calculate summary metrics
  const totalOrders = filteredOrders.length;
  const completedOrders = filteredOrders.filter(
    (order) => order.status === "delivered"
  ).length;
  const totalRevenue = filteredOrders.reduce(
    (sum, order) => sum + (order.totalAmount || 0),
    0
  );
  // Placeholder for revenue change (implement if you have date info)
  const revenueChange = 0;

  console.log(filteredOrders);

  // Order Details Dialog Component
  const OrderDetailsDialog = ({ open, order, onClose }) => {
    if (!order) return null;

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxHeight: "90vh",
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: "#f8f9fa",
            borderBottom: "1px solid #e9ecef",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            Order Details - #{order._id.slice(-8)}
          </Typography>
          <Chip
            label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            color={statusColor(order.status)}
            size="small"
          />
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Order Summary */}
            <Grid item xs={12}>
              <Card sx={{ mb: 2, bgcolor: "#f8f9fa" }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} mb={2}>
                    Order Summary
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="text.secondary">
                        Order Date
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {formatDate(order.createdAt)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="text.secondary">
                        Total Amount
                      </Typography>
                      <Typography
                        variant="body1"
                        fontWeight={500}
                        color="primary"
                      >
                        ₹{order.totalAmount}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="text.secondary">
                        Payment Status
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {order.paymentStatus || "Pending"}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="text.secondary">
                        Order Status
                      </Typography>
                      <Chip
                        label={
                          order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)
                        }
                        color={statusColor(order.status)}
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Customer Information */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} mb={2}>
                    Customer Information
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar sx={{ mr: 2, bgcolor: "primary.main" }}>
                      {order.user?.name?.charAt(0) || "U"}
                    </Avatar>
                    <Box>
                      <Typography variant="body1" fontWeight={500}>
                        {order.user?.name || "N/A"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {order.user?.email || "N/A"}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Phone: {order.user?.phone || "N/A"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Shipping Address */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} mb={2}>
                    Shipping Address
                  </Typography>
                  {order.address ? (
                    <Box>
                      <Typography variant="body1" fontWeight={500}>
                        {order.user?.name || "N/A"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {order.address.street}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {order.address.city}, {order.address.state}{" "}
                        {order.address.pincode}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Phone: {order.user?.phone || ""}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No shipping address provided
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Order Items */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} mb={2}>
                    Order Items
                  </Typography>
                  <List>
                    {order.items.map((item, index) => (
                      <React.Fragment key={index}>
                        <ListItem sx={{ px: 0 }}>
                          <Box
                            sx={{
                              display: "flex",
                              width: "100%",
                              alignItems: "center",
                            }}
                          >
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body1" fontWeight={500}>
                                {item.product?.name || "Product Name N/A"}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Category: {item.product?.category || "N/A"}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Quantity: {item.quantity}
                              </Typography>
                            </Box>
                            <Box sx={{ textAlign: "right" }}>
                              <Typography variant="body1" fontWeight={500}>
                                ₹{item.price || 0}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Total: ₹{item.price * item.quantity || 0}
                              </Typography>
                            </Box>
                          </Box>
                        </ListItem>
                        {index < order.items.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                  <Divider sx={{ my: 2 }} />
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="h6" fontWeight={600}>
                      Total Amount
                    </Typography>
                    <Typography variant="h6" fontWeight={600} color="primary">
                      ₹{order.totalAmount}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, bgcolor: "#f8f9fa" }}>
          <Button onClick={onClose} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Box sx={{ bgcolor: "#f4f6fa", minHeight: "100vh" }}>
      <AppBar position="static" color="default" elevation={1} sx={{ mb: 4 }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6" color="primary" fontWeight={700}>
            vin2Grow
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
          {selectedCategory} Orders
        </Typography>
        {/* Summary Cards */}
        <Box sx={{ display: "flex", gap: 3, mb: 4, flexWrap: "wrap" }}>
          <Card
            sx={{
              flex: 1,
              minWidth: 220,
              bgcolor: "#fff",
              color: "#222",
              borderRadius: 3,
              boxShadow:
                "0 4px 24px 0 rgba(34, 197, 94, 0.10), 0 1.5px 6px 0 rgba(0,0,0,0.04)",
              border: "none",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "flex-start",
              p: 3,
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <Typography
                fontSize={14}
                fontWeight={600}
                color="#22c55e"
                gutterBottom
              >
                Total Orders
              </Typography>
              <Typography variant="h4" fontWeight={700} color="#222">
                {totalOrders}
              </Typography>
              <Typography fontSize={13} color="#22c55e" mt={1}>
                {completedOrders} completed
              </Typography>
            </CardContent>
          </Card>
          <Card
            sx={{
              flex: 1,
              minWidth: 220,
              bgcolor: "#fff",
              color: "#222",
              borderRadius: 3,
              boxShadow:
                "0 4px 24px 0 rgba(34, 197, 94, 0.10), 0 1.5px 6px 0 rgba(0,0,0,0.04)",
              border: "none",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "flex-start",
              p: 3,
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <Typography
                fontSize={14}
                fontWeight={600}
                color="#22c55e"
                gutterBottom
              >
                Total Revenue
              </Typography>
              <Typography variant="h4" fontWeight={700} color="#222">
                ₹{totalRevenue.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Box>
        {/* End Summary Cards */}
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
                    {filteredOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No orders found for your category.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredOrders.map((order) => (
                        <TableRow
                          key={order._id}
                          sx={{
                            "&:hover": { background: "#f5f7fa" },
                            transition: "background 0.2s",
                            cursor: "pointer",
                          }}
                          onClick={() => handleRowClick(order)}
                        >
                          <TableCell>{order._id}</TableCell>
                          <TableCell>{order.user?.name || "N/A"}</TableCell>
                          <TableCell>
                            {order.items
                              .filter(
                                (item) =>
                                  item.product &&
                                  item.product.category &&
                                  item.product.category === selectedCategory
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
                              onClick={(e) => e.stopPropagation()}
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

      {/* Order Details Dialog */}
      <OrderDetailsDialog
        open={dialogOpen}
        order={selectedOrder}
        onClose={handleCloseDialog}
      />
    </Box>
  );
};

export default Dashboard;
