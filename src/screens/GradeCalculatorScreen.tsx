import React, { useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { FREE_TIER_LIMITS } from "../app/constants/pricing";
import { useSubscription } from "../app/providers/SubscriptionProvider";

type ResultState = "idle" | "success" | "secured" | "notPossible";

type CalculationEntry = {
  id: string;
  currentGrade: number;
  examWeight: number;
  targetGrade: number;
  neededScore: number;
};

const FREE_MONTHLY_LIMIT = FREE_TIER_LIMITS.gradeCalculatorMonthlyEntries;

const GradeCalculatorScreen: React.FC = () => {
  const { isPremium, startMockPremium } = useSubscription();
  const [currentGrade, setCurrentGrade] = useState("");
  const [examWeight, setExamWeight] = useState("");
  const [targetGrade, setTargetGrade] = useState("");
  const [resultState, setResultState] = useState<ResultState>("idle");
  const [resultText, setResultText] = useState("");

  const [usageCount, setUsageCount] = useState(0);
  const [history, setHistory] = useState<CalculationEntry[]>([]);

  const remainingFreeUses = Math.max(FREE_MONTHLY_LIMIT - usageCount, 0);

  const resetForm = () => {
    setCurrentGrade("");
    setExamWeight("");
    setTargetGrade("");
    setResultState("idle");
    setResultText("");
  };

  const parseAndValidate = () => {
    const current = Number(currentGrade);
    const weight = Number(examWeight);
    const target = Number(targetGrade);

    if (
      Number.isNaN(current) ||
      Number.isNaN(weight) ||
      Number.isNaN(target) ||
      current < 0 ||
      current > 100 ||
      weight <= 0 ||
      weight > 100 ||
      target < 0 ||
      target > 100
    ) {
      Alert.alert(
        "Invalid input",
        "Enter valid percentages: current/target between 0-100 and exam weight > 0 to 100.",
      );
      return null;
    }

    return { current, weight, target };
  };

  const handleCalculate = () => {
    if (!isPremium && usageCount >= FREE_MONTHLY_LIMIT) {
      Alert.alert(
        "Free limit reached",
        `You have used all ${FREE_MONTHLY_LIMIT} free calculations this month. Upgrade to Premium for unlimited calculations.`,
      );
      return;
    }

    const parsed = parseAndValidate();
    if (!parsed) {
      return;
    }

    const weightDecimal = parsed.weight / 100;
    const neededScore =
      (parsed.target - parsed.current * (1 - weightDecimal)) / weightDecimal;
    const rounded = Number(neededScore.toFixed(1));

    if (rounded > 100) {
      setResultState("notPossible");
      setResultText(
        `You would need ${rounded}% on this exam. This target is not achievable with this exam alone.`,
      );
    } else if (rounded <= 0) {
      setResultState("secured");
      setResultText("Your target is already secured. Keep up the momentum!");
    } else {
      setResultState("success");
      setResultText(`You need ${rounded}% on the upcoming exam to hit your target.`);
    }

    if (!isPremium) {
      setUsageCount((prev) => prev + 1);
    }

    const nextEntry: CalculationEntry = {
      id: `${Date.now()}`,
      currentGrade: parsed.current,
      examWeight: parsed.weight,
      targetGrade: parsed.target,
      neededScore: rounded,
    };

    setHistory((prev) => [nextEntry, ...prev].slice(0, 5));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>Grade Target Calculator</Text>
        <Text style={styles.title}>Know exactly what score you need</Text>

        <View style={styles.limitCard}>
          <Text style={styles.limitTitle}>{isPremium ? "Premium active" : "Free plan"}</Text>
          <Text style={styles.limitText}>
            {isPremium
              ? "Unlimited calculations available."
              : `${remainingFreeUses} of ${FREE_MONTHLY_LIMIT} free calculations remaining this month.`}
          </Text>
          {!isPremium ? (
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={() => startMockPremium("monthly")}
            >
              <Text style={styles.upgradeText}>Upgrade to Premium</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.label}>Current grade (%)</Text>
          <TextInput
            placeholder="Ex: 82"
            value={currentGrade}
            onChangeText={setCurrentGrade}
            keyboardType="numeric"
            style={styles.input}
            placeholderTextColor="#94A3B8"
          />
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.label}>Upcoming exam weight (%)</Text>
          <TextInput
            placeholder="Ex: 30"
            value={examWeight}
            onChangeText={setExamWeight}
            keyboardType="numeric"
            style={styles.input}
            placeholderTextColor="#94A3B8"
          />
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.label}>Target course grade (%)</Text>
          <TextInput
            placeholder="Ex: 90"
            value={targetGrade}
            onChangeText={setTargetGrade}
            keyboardType="numeric"
            style={styles.input}
            placeholderTextColor="#94A3B8"
          />
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.secondaryButton} onPress={resetForm}>
            <Text style={styles.secondaryButtonText}>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryButton} onPress={handleCalculate}>
            <Text style={styles.primaryButtonText}>Calculate</Text>
          </TouchableOpacity>
        </View>

        {resultState !== "idle" ? (
          <View
            style={[
              styles.resultCard,
              resultState === "success" && styles.resultSuccess,
              resultState === "secured" && styles.resultSecured,
              resultState === "notPossible" && styles.resultNotPossible,
            ]}
          >
            <Text style={styles.resultTitle}>Result</Text>
            <Text style={styles.resultText}>{resultText}</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent calculations</Text>
          {history.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No calculations yet</Text>
              <Text style={styles.emptyText}>
                Your recent calculator entries will appear here.
              </Text>
            </View>
          ) : (
            history.map((entry) => (
              <View key={entry.id} style={styles.historyCard}>
                <Text style={styles.historyTitle}>Need {entry.neededScore}%</Text>
                <Text style={styles.historyMeta}>
                  Current {entry.currentGrade}% • Weight {entry.examWeight}% • Target {entry.targetGrade}%
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
  },
  kicker: {
    fontSize: 16,
    color: "#52607A",
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#101828",
    marginBottom: 16,
  },
  limitCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    shadowColor: "#0B1324",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  limitTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  limitText: {
    marginTop: 4,
    fontSize: 13,
    color: "#64748B",
  },
  upgradeButton: {
    marginTop: 10,
    alignSelf: "flex-start",
    backgroundColor: "#EDE9FE",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },
  upgradeText: {
    color: "#6D28D9",
    fontSize: 12,
    fontWeight: "700",
  },
  fieldBlock: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: "#0F172A",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  actionsRow: {
    marginTop: 6,
    flexDirection: "row",
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#E2E8F0",
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 12,
    marginRight: 6,
  },
  secondaryButtonText: {
    color: "#0F172A",
    fontWeight: "600",
  },
  primaryButton: {
    flex: 1.4,
    backgroundColor: "#4F46E5",
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 12,
    marginLeft: 6,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  resultCard: {
    marginTop: 14,
    borderRadius: 14,
    padding: 14,
  },
  resultSuccess: {
    backgroundColor: "#DCFCE7",
  },
  resultSecured: {
    backgroundColor: "#DBEAFE",
  },
  resultNotPossible: {
    backgroundColor: "#FEE2E2",
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  resultText: {
    fontSize: 13,
    color: "#334155",
    lineHeight: 18,
  },
  section: {
    marginTop: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 10,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  emptyText: {
    marginTop: 4,
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
  },
  historyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#0B1324",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  historyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  historyMeta: {
    marginTop: 4,
    fontSize: 12,
    color: "#64748B",
  },
});

export default GradeCalculatorScreen;
