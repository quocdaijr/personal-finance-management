import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  TextField,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  ExpandMore,
  Help as HelpIcon,
  ContactSupport,
  Description,
  VideoLibrary,
  Chat,
  Email,
  Phone,
  Search,
  QuestionAnswer,
  Security,
  AccountBalance,
  Receipt,
  Settings,
  BugReport,
  Feedback,
  School,
  Launch,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import { useTheme } from "../contexts/ThemeContext";
import { PageLayout } from "../components/layout";

const Help = () => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFAQ, setExpandedFAQ] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [contactForm, setContactForm] = useState({
    subject: "",
    message: "",
    category: "general",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // FAQ data
  const faqData = [
    {
      id: 1,
      category: "Getting Started",
      question: "How do I add my first account?",
      answer:
        'To add your first account, go to the Wallets page and click "Add Account". Fill in your account details including name, type, and initial balance. You can add checking accounts, savings accounts, credit cards, and investment accounts.',
    },
    {
      id: 2,
      category: "Transactions",
      question: "How do I categorize my transactions?",
      answer:
        "When adding or editing a transaction, you can select from predefined categories or create custom ones. Categories help you track spending patterns and generate better financial reports.",
    },
    {
      id: 3,
      category: "Security",
      question: "Is my financial data secure?",
      answer:
        "Yes, we use bank-level encryption (256-bit SSL) to protect your data. We also support two-factor authentication for additional security. Your data is never shared with third parties without your consent.",
    },
    {
      id: 4,
      category: "Budgets",
      question: "How do I set up a budget?",
      answer:
        'Navigate to the Budgets section and click "Create Budget". Set your budget amount, category, and time period (monthly, quarterly, or yearly). The system will track your spending against the budget automatically.',
    },
    {
      id: 5,
      category: "Reports",
      question: "Can I export my financial data?",
      answer:
        "Yes, you can export your transaction data and reports in various formats including CSV and PDF. Go to the Reports section and look for the export options.",
    },
    {
      id: 6,
      category: "Account Management",
      question: "How do I change my password?",
      answer:
        'Go to Settings > Account and click "Change Password". You\'ll need to enter your current password and then your new password twice for confirmation.',
    },
  ];

  // Quick help topics
  const quickHelpTopics = [
    {
      title: "Getting Started Guide",
      description: "Learn the basics of managing your finances",
      icon: <School />,
      color: "#4CAF50",
    },
    {
      title: "Account Setup",
      description: "How to add and manage your accounts",
      icon: <AccountBalance />,
      color: "#2196F3",
    },
    {
      title: "Transaction Management",
      description: "Adding, editing, and categorizing transactions",
      icon: <Receipt />,
      color: "#FF9800",
    },
    {
      title: "Security Features",
      description: "Keeping your financial data safe",
      icon: <Security />,
      color: "#9C27B0",
    },
  ];

  // Contact options
  const contactOptions = [
    {
      title: "Live Chat",
      description: "Get instant help from our support team",
      icon: <Chat />,
      action: () => {
        setSnackbar({
          open: true,
          message:
            "Live chat feature will be available soon. Please use email support for now.",
          severity: "info",
        });
      },
      available: "Available 24/7",
    },
    {
      title: "Email Support",
      description: "Send us a detailed message",
      icon: <Email />,
      action: () => setShowContactDialog(true),
      available: "Response within 24 hours",
    },
    {
      title: "Phone Support",
      description: "Speak directly with our team",
      icon: <Phone />,
      action: () => {
        setSnackbar({
          open: true,
          message: "Phone support: +1-800-FINANCE (Mon-Fri 9AM-6PM EST)",
          severity: "info",
        });
      },
      available: "Mon-Fri 9AM-6PM EST",
    },
  ];

  // Filter FAQs based on search
  const filteredFAQs = faqData.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleContactSubmit = async () => {
    // Validate form
    if (!contactForm.subject.trim() || !contactForm.message.trim()) {
      setSnackbar({
        open: true,
        message: "Please fill in all required fields",
        severity: "error",
      });
      return;
    }

    try {
      // Here you would typically send the contact form to your backend
      // For now, we'll simulate success
      // await fetch('/api/support/contact', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(contactForm)
      // });

      setSnackbar({
        open: true,
        message: "Your message has been sent! We'll get back to you soon.",
        severity: "success",
      });

      setShowContactDialog(false);
      setContactForm({
        subject: "",
        message: "",
        category: "general",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to send message. Please try again.",
        severity: "error",
      });
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <PageLayout maxWidth="xl" showSearch={false}>
      {/* Hero Section */}
      <Box sx={{ textAlign: "center", mb: 6 }}>
        <HelpIcon sx={{ fontSize: 64, color: "#C8EE44", mb: 2 }} />
        <Typography variant="h6" sx={{ color: theme.text.secondary, mb: 4 }}>
          Find answers to your questions and get the support you need
        </Typography>

        {/* Search Bar */}
        <Box sx={{ maxWidth: 600, mx: "auto", position: "relative" }}>
          <TextField
            fullWidth
            placeholder="Search for help topics, FAQs, or features..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <Search sx={{ color: "rgba(255, 255, 255, 0.5)", mr: 1 }} />
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: alpha("#FFFFFF", 0.1),
                "& fieldset": {
                  borderColor: alpha("#FFFFFF", 0.3),
                },
                "&:hover fieldset": {
                  borderColor: alpha("#FFFFFF", 0.5),
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#C8EE44",
                },
              },
              "& .MuiInputBase-input": {
                color: "white",
              },
            }}
          />
        </Box>
      </Box>

      {/* Quick Help Topics */}
      <Typography
        variant="h5"
        sx={{ color: theme.text.primary, fontWeight: 600, mb: 3 }}
      >
        Quick Help Topics
      </Typography>

      <Grid container spacing={3} sx={{ mb: 6 }}>
        {quickHelpTopics.map((topic, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                cursor: "pointer",
                transition: "transform 0.2s ease-in-out",
                "&:hover": {
                  transform: "translateY(-4px)",
                },
              }}
            >
              <CardContent sx={{ textAlign: "center", py: 3 }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    backgroundColor: alpha(topic.color, 0.2),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 2,
                  }}
                >
                  {React.cloneElement(topic.icon, {
                    sx: { color: topic.color, fontSize: 30 },
                  })}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {topic.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {topic.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* FAQ Section */}
      <Typography
        variant="h5"
        sx={{ color: theme.text.primary, fontWeight: 600, mb: 3 }}
      >
        Frequently Asked Questions
      </Typography>

      <Card sx={{ mb: 6 }}>
        <CardContent>
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((faq) => (
              <Accordion key={faq.id}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      width: "100%",
                    }}
                  >
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                      {faq.question}
                    </Typography>
                    <Chip
                      label={faq.category}
                      size="small"
                      sx={{
                        backgroundColor: alpha("#C8EE44", 0.2),
                        color: "#C8EE44",
                      }}
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))
          ) : (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <QuestionAnswer
                sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
              />
              <Typography variant="h6" sx={{ mb: 1 }}>
                No FAQs found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your search terms or browse our help topics above
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Contact Support */}
      <Typography
        variant="h5"
        sx={{ color: theme.text.primary, fontWeight: 600, mb: 3 }}
      >
        Contact Support
      </Typography>

      <Grid container spacing={3} sx={{ mb: 6 }}>
        {contactOptions.map((option, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card
              sx={{
                cursor: "pointer",
                transition: "transform 0.2s ease-in-out",
                "&:hover": {
                  transform: "translateY(-2px)",
                },
              }}
              onClick={option.action}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      backgroundColor: alpha("#C8EE44", 0.2),
                      color: "#C8EE44",
                      mr: 2,
                    }}
                  >
                    {option.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {option.title}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {option.description}
                </Typography>
                <Typography variant="caption" sx={{ color: "#C8EE44" }}>
                  {option.available}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Additional Resources */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            Additional Resources
          </Typography>

          <List>
            <ListItem button>
              <ListItemIcon>
                <VideoLibrary sx={{ color: "#C8EE44" }} />
              </ListItemIcon>
              <ListItemText
                primary="Video Tutorials"
                secondary="Watch step-by-step guides for common tasks"
              />
              <Launch />
            </ListItem>

            <Divider />

            <ListItem button>
              <ListItemIcon>
                <Description sx={{ color: "#C8EE44" }} />
              </ListItemIcon>
              <ListItemText
                primary="User Manual"
                secondary="Comprehensive documentation for all features"
              />
              <Launch />
            </ListItem>

            <Divider />

            <ListItem button>
              <ListItemIcon>
                <BugReport sx={{ color: "#C8EE44" }} />
              </ListItemIcon>
              <ListItemText
                primary="Report a Bug"
                secondary="Help us improve by reporting issues"
              />
              <Launch />
            </ListItem>

            <Divider />

            <ListItem button>
              <ListItemIcon>
                <Feedback sx={{ color: "#C8EE44" }} />
              </ListItemIcon>
              <ListItemText
                primary="Feature Requests"
                secondary="Suggest new features or improvements"
              />
              <Launch />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Contact Form Dialog */}
      <Dialog
        open={showContactDialog}
        onClose={() => setShowContactDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Contact Support</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="Subject"
              value={contactForm.subject}
              onChange={(e) =>
                setContactForm((prev) => ({ ...prev, subject: e.target.value }))
              }
            />

            <TextField
              fullWidth
              label="Category"
              select
              value={contactForm.category}
              onChange={(e) =>
                setContactForm((prev) => ({
                  ...prev,
                  category: e.target.value,
                }))
              }
              SelectProps={{
                native: true,
              }}
            >
              <option value="general">General Question</option>
              <option value="technical">Technical Issue</option>
              <option value="billing">Billing Question</option>
              <option value="feature">Feature Request</option>
              <option value="bug">Bug Report</option>
            </TextField>

            <TextField
              fullWidth
              label="Message"
              multiline
              rows={6}
              value={contactForm.message}
              onChange={(e) =>
                setContactForm((prev) => ({ ...prev, message: e.target.value }))
              }
              placeholder="Please describe your question or issue in detail..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowContactDialog(false)}>Cancel</Button>
          <Button onClick={handleContactSubmit} variant="contained">
            Send Message
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageLayout>
  );
};

export default Help;
