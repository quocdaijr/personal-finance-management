import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Skeleton,
} from "@mui/material";
import {
  AccountBalanceWallet,
  TrendingUp,
  TrendingDown,
  Savings,
  Add,
  MoreVert,
  Flag,
  Repeat,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useUserPreferences } from "../contexts/UserPreferencesContext";
import { PageLayout } from "../components/layout";
import {
  SummaryCard,
  WalletSection,
  ScheduledTransfers,
  FinancialChart,
  RecentTransactions,
} from "../components/dashboard";
import accountService from "../services/accountService";
import transactionService from "../services/transactionService";
import goalService from "../services/goalService";
import { formatCurrency, formatDate } from "../utils/formatters";

interface FinancialData {
  totalBalance: number;
  totalSpending: number;
  totalSaved: number;
  monthlyIncome: number;
  spendingTrend: string;
  savingsTrend: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { preferences } = useUserPreferences();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [financialData, setFinancialData] = useState<FinancialData>({
    totalBalance: 0,
    totalSpending: 0,
    totalSaved: 0,
    monthlyIncome: 0,
    spendingTrend: "0%",
    savingsTrend: "0%",
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [goalsProgress, setGoalsProgress] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
  }, [preferences]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch data in parallel
      const [accountsRes, transactionSummaryRes, goalsRes] = await Promise.all([
        accountService.getSummary().catch(() => null),
        transactionService.getSummary("month").catch(() => null),
        goalService.getSummary().catch(() => null),
      ]);

      // Process accounts data
      const totalBalance = accountsRes?.totalBalance || 0;

      // Process transactions data
      const totalSpending = transactionSummaryRes?.totalExpense || 0;
      const monthlyIncome = transactionSummaryRes?.totalIncome || 0;
      const totalSaved = monthlyIncome - totalSpending;

      setFinancialData({
        totalBalance,
        totalSpending,
        totalSaved: totalSaved > 0 ? totalSaved : 0,
        monthlyIncome,
        spendingTrend: transactionSummaryRes?.expenseTrend || "-0%",
        savingsTrend:
          totalSaved > 0
            ? "+" + ((totalSaved / monthlyIncome) * 100).toFixed(1) + "%"
            : "0%",
      });

      // Process goals data
      if (goalsRes) {
        setGoalsProgress(goalsRes);
      }

      // Fetch recent transactions for activity
      try {
        const transactions = await transactionService.getAll();
        setRecentActivity(
          (transactions || []).slice(0, 4).map((t: any) => ({
            action: t.description,
            time: formatDate(new Date(t.date), preferences.dateFormat),
            amount:
              t.type === "income"
                ? `+${formatCurrency(t.amount, preferences.currency)}`
                : `-${formatCurrency(t.amount, preferences.currency)}`,
            type: t.type,
          })),
        );
      } catch {}
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout
      maxWidth="xl"
      showSearch={true}
      onSearchChange={(value) => {
        if (value.trim()) {
          navigate(`/search?q=${encodeURIComponent(value)}`);
        }
      }}
    >
      {/* Main Dashboard Layout - Three Column Layout matching Figma exactly */}
      <Box
        sx={{
          display: { xs: "block", xl: "flex" },
          gap: { xl: 4 },
          mb: 4,
        }}
      >
        {/* Left Column - Wallet & Scheduled Transfers */}
        <Box
          sx={{
            width: { xs: "100%", xl: 354 },
            flexShrink: 0,
            mb: { xs: 4, xl: 0 },
          }}
        >
          {/* Wallet Section */}
          <Box sx={{ mb: 4 }}>
            <WalletSection
              onAddCard={() => navigate("/accounts?action=create")}
              onCardClick={(card) => navigate(`/accounts/${card.id}`)}
              onMoreClick={() => navigate("/accounts")}
            />
          </Box>

          {/* Scheduled Transfers */}
          <ScheduledTransfers
            onViewAll={() => navigate("/recurring")}
            onTransferClick={(transfer) =>
              navigate(`/recurring/${transfer.id}`)
            }
            onMoreClick={() => navigate("/recurring")}
          />
        </Box>

        {/* Center Column - Summary Cards, Graph, Recent Transactions */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            mb: { xs: 4, xl: 0 },
          }}
        >
          {/* Financial Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={4}>
              <SummaryCard
                title="Total Balance"
                value={formatCurrency(
                  financialData.totalBalance,
                  preferences.currency,
                )}
                subtitle="All accounts"
                icon={<AccountBalanceWallet />}
                color="primary"
                variant="gradient"
                trendValue="+2.5%"
                trend="up"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <SummaryCard
                title="Total Spending"
                value={formatCurrency(
                  financialData.totalSpending,
                  preferences.currency,
                )}
                subtitle="This month"
                icon={<TrendingDown />}
                color="error"
                variant="outlined"
                trendValue="-12.3%"
                trend="down"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <SummaryCard
                title="Total Saved"
                value={formatCurrency(
                  financialData.totalSaved,
                  preferences.currency,
                )}
                subtitle="This month"
                icon={<Savings />}
                color="success"
                variant="outlined"
                trendValue="+8.1%"
                trend="up"
              />
            </Grid>
          </Grid>

          {/* Financial Chart */}
          <Box sx={{ mb: 4 }}>
            <FinancialChart height={291} />
          </Box>

          {/* Recent Transactions */}
          <RecentTransactions
            onViewAll={() => navigate("/transactions")}
            onTransactionClick={(transaction) =>
              navigate(`/transactions?id=${transaction.id}`)
            }
            onMoreClick={() => navigate("/transactions")}
            maxItems={5}
          />
        </Box>

        {/* Right Column - Additional Widgets (matching Figma) */}
        <Box
          sx={{
            width: { xs: "100%", xl: 354 },
            flexShrink: 0,
            display: { xs: "none", xl: "block" },
          }}
        >
          {/* Quick Actions Widget */}
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    color: theme.text.primary,
                    fontWeight: 600,
                    fontSize: "1.125rem",
                  }}
                >
                  Quick Actions
                </Typography>
                <Button
                  size="small"
                  startIcon={<Add />}
                  sx={{
                    color: "#C8EE44",
                    textTransform: "none",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                  }}
                >
                  Add
                </Button>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {[
                  {
                    title: "Add Transaction",
                    subtitle: "Manual entry",
                    path: "/transactions",
                  },
                  {
                    title: "View Goals",
                    subtitle: "Track savings goals",
                    path: "/goals",
                  },
                  {
                    title: "Recurring",
                    subtitle: "Manage recurring",
                    path: "/recurring",
                  },
                  {
                    title: "View Reports",
                    subtitle: "Financial insights",
                    path: "/reports",
                  },
                ].map((action, index) => (
                  <Box
                    key={index}
                    onClick={() => navigate(action.path)}
                    sx={{
                      p: 2,
                      background: theme.background.secondary,
                      borderRadius: 2,
                      border: `1px solid ${theme.border.primary}`,
                      cursor: "pointer",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        background: theme.background.paper,
                        transform: "translateY(-1px)",
                        boxShadow: theme.card.hoverShadow,
                      },
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.text.primary,
                        fontWeight: 500,
                        mb: 0.5,
                      }}
                    >
                      {action.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: theme.text.secondary,
                        fontSize: "0.75rem",
                      }}
                    >
                      {action.subtitle}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Recent Activity Widget */}
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    color: theme.text.primary,
                    fontWeight: 600,
                    fontSize: "1.125rem",
                  }}
                >
                  Recent Activity
                </Typography>
                <Button
                  size="small"
                  endIcon={<MoreVert />}
                  sx={{
                    color: theme.text.secondary,
                    textTransform: "none",
                    fontSize: "0.875rem",
                    minWidth: "auto",
                  }}
                />
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {(recentActivity.length > 0
                  ? recentActivity
                  : [
                      {
                        action: "No recent activity",
                        time: "",
                        amount: "",
                        type: "none",
                      },
                    ]
                ).map((activity, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      p: 2,
                      background: theme.background.secondary,
                      borderRadius: 2,
                      border: `1px solid ${theme.border.primary}`,
                    }}
                  >
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{
                          color: theme.text.primary,
                          fontWeight: 500,
                          mb: 0.5,
                        }}
                      >
                        {activity.action}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: theme.text.secondary,
                          fontSize: "0.75rem",
                        }}
                      >
                        {activity.time}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color:
                          activity.type === "income" ? "#4CAF50" : "#E53935",
                        fontWeight: 600,
                        fontSize: "0.875rem",
                      }}
                    >
                      {activity.amount}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </PageLayout>
  );
};

export default Dashboard;
