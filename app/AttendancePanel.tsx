import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  Modal,
  TextInput,
} from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE } from "../utils/config";

interface Job {
  id: string;
  title: string;
  worker: string;
  date: string;
  status: "present" | "absent" | "pending";
  amount: number;
  paymentStatus?: string;
  rating?: {
    stars: number;
    feedback: string;
    ratedAt: string;
  };
}

export default function AttendancePanelScreen(): React.ReactElement {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "pending" | "present" | "absent">("all");
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [selectedJobForRating, setSelectedJobForRating] = useState<Job | null>(null);
  const [ratingStars, setRatingStars] = useState(5);
  const [ratingFeedback, setRatingFeedback] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);

  const jobs: Job[] = [
    {
      id: "1",
      title: "Plumbing Work",
      worker: "Rajesh Kumar",
      date: "Dec 5, 2024",
      status: "present",
      amount: 500,
    },
    {
      id: "2",
      title: "Electrical Fix",
      worker: "Amit Singh",
      date: "Dec 5, 2024",
      status: "pending",
      amount: 800,
    },
    {
      id: "3",
      title: "Painting",
      worker: "Vikram Sharma",
      date: "Dec 4, 2024",
      status: "absent",
      amount: 1200,
    },
    {
      id: "4",
      title: "Carpentry",
      worker: "Suresh Patel",
      date: "Dec 4, 2024",
      status: "present",
      amount: 600,
    },
  ];

  const filteredJobs = jobs.filter((job) => filter === "all" || job.status === filter);

  const statusColors = {
    present: { bg: "#D4EDDA", text: "#155724", icon: "check-circle" },
    absent: { bg: "#F8D7DA", text: "#721C24", icon: "cancel" },
    pending: { bg: "#FFF3CD", text: "#856404", icon: "schedule" },
  };

  const handleMarkAttendance = (jobId: string, status: "present" | "absent") => {
    Alert.alert("Mark Attendance", `Mark ${status} for this job?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Confirm",
        onPress: () => {
          Alert.alert("Success", `Attendance marked as ${status}!`);
        },
      },
    ]);
  };

  const handleOpenRatingModal = (job: Job) => {
    setSelectedJobForRating(job);
    setRatingStars(5);
    setRatingFeedback("");
    setRatingModalVisible(true);
  };

  const handleSubmitRating = async () => {
    if (!selectedJobForRating) return;

    setSubmittingRating(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(`${API_BASE}/jobs/rate/${selectedJobForRating.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          stars: ratingStars,
          feedback: ratingFeedback,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Rating submitted successfully!");
        setRatingModalVisible(false);
        // Optionally refresh the jobs list here
      } else {
        Alert.alert("Error", data.message || "Failed to submit rating");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to submit rating");
      console.error(error);
    } finally {
      setSubmittingRating(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#6C63FF", "#A78BFA"]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Attendance Panel</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {["all", "pending", "present", "absent"].map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterTab,
              filter === f && styles.filterTabActive,
            ]}
            onPress={() => setFilter(f as any)}
          >
            <Text
              style={[
                styles.filterText,
                filter === f && styles.filterTextActive,
              ]}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Jobs List */}
      <ScrollView style={styles.content}>
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => {
            const colors = statusColors[job.status];
            return (
              <View key={job.id} style={styles.jobCard}>
                <View style={styles.jobHeader}>
                  <View style={styles.jobInfo}>
                    <Text style={styles.jobTitle}>{job.title}</Text>
                    <Text style={styles.workerName}>👤 {job.worker}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
                    <MaterialIcons name={colors.icon as any} size={16} color={colors.text} />
                    <Text style={[styles.statusText, { color: colors.text }]}>
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </Text>
                  </View>
                </View>

                <View style={styles.jobDetails}>
                  <View style={styles.detailItem}>
                    <MaterialIcons name="event" size={16} color="#666" />
                    <Text style={styles.detailText}>{job.date}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <MaterialIcons name="attach-money" size={16} color="#2ECC71" />
                    <Text style={[styles.detailText, { color: "#2ECC71", fontWeight: "600" }]}>
                      ₹{job.amount}
                    </Text>
                  </View>
                </View>

                {job.status === "pending" && (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: "#D4EDDA" }]}
                      onPress={() => handleMarkAttendance(job.id, "present")}
                    >
                      <MaterialIcons name="check" size={18} color="#155724" />
                      <Text style={[styles.actionText, { color: "#155724" }]}>Present</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: "#F8D7DA" }]}
                      onPress={() => handleMarkAttendance(job.id, "absent")}
                    >
                      <MaterialIcons name="close" size={18} color="#721C24" />
                      <Text style={[styles.actionText, { color: "#721C24" }]}>Absent</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {job.paymentStatus === "Paid" && !job.rating && (
                  <TouchableOpacity
                    style={styles.rateButton}
                    onPress={() => handleOpenRatingModal(job)}
                  >
                    <MaterialIcons name="star-outline" size={18} color="#fff" />
                    <Text style={styles.rateButtonText}>Rate Worker</Text>
                  </TouchableOpacity>
                )}

                {job.rating && (
                  <View style={styles.ratingDisplay}>
                    <View style={styles.ratingHeader}>
                      <Text style={styles.ratingLabel}>Your Rating:</Text>
                      <Text style={styles.ratingStars}>
                        {"⭐".repeat(job.rating.stars)}
                      </Text>
                    </View>
                    {job.rating.feedback && (
                      <Text style={styles.ratingFeedback}>"{job.rating.feedback}"</Text>
                    )}
                  </View>
                )}
              </View>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <MaterialIcons name="event-busy" size={48} color="#CCC" />
            <Text style={styles.emptyText}>No jobs found</Text>
          </View>
        )}
      </ScrollView>

      {/* Rating Modal */}
      <Modal visible={ratingModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Rate {selectedJobForRating?.worker}</Text>
              <TouchableOpacity onPress={() => setRatingModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>Job: {selectedJobForRating?.title}</Text>

              <View style={styles.starsContainer}>
                <Text style={styles.starsLabel}>Your Rating:</Text>
                <View style={styles.starRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => setRatingStars(star)}
                      style={styles.starButton}
                    >
                      <Text style={styles.starText}>
                        {star <= ratingStars ? "⭐" : "☆"}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <Text style={styles.feedbackLabel}>Feedback (Optional):</Text>
              <TextInput
                style={styles.feedbackInput}
                placeholder="Share your feedback about this worker..."
                placeholderTextColor="#999"
                multiline
                maxLength={200}
                value={ratingFeedback}
                onChangeText={setRatingFeedback}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setRatingModalVisible(false)}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleSubmitRating}
                  disabled={submittingRating}
                >
                  <Text style={styles.submitBtnText}>
                    {submittingRating ? "Submitting..." : "Submit Rating"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  filterTabActive: {
    borderBottomColor: "#6C63FF",
  },
  filterText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#999",
  },
  filterTextActive: {
    color: "#6C63FF",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  jobCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  jobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  workerName: {
    fontSize: 13,
    color: "#666",
    marginTop: 6,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  jobDetails: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
    paddingBottom: 12,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: "#666",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  actionText: {
    fontSize: 13,
    fontWeight: "600",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginTop: 12,
  },
  rateButton: {
    backgroundColor: "#FF9500",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 6,
  },
  rateButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  ratingDisplay: {
    backgroundColor: "#FFF3CD",
    borderLeftWidth: 4,
    borderLeftColor: "#FF9500",
    padding: 12,
    borderRadius: 6,
    marginTop: 12,
  },
  ratingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  ratingLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },
  ratingStars: {
    fontSize: 16,
  },
  ratingFeedback: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  modalBody: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 16,
  },
  starsContainer: {
    marginBottom: 20,
  },
  starsLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  starRow: {
    flexDirection: "row",
    gap: 10,
  },
  starButton: {
    padding: 8,
  },
  starText: {
    fontSize: 32,
  },
  feedbackLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  feedbackInput: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#333",
    minHeight: 80,
    textAlignVertical: "top",
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
  },
  cancelBtnText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "600",
  },
  submitBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#FF9500",
    alignItems: "center",
  },
  submitBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
