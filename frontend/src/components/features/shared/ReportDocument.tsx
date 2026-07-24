"use client";

import React from "react";
import { UI_LABELS } from "@/constants/ui";
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  Font, 
  Image 
} from "@react-pdf/renderer";

/**
 * ReportDocument Component
 * A universal, high-fidelity PDF report template for the Faith Laundry system.
 * Adheres to FRONT-001 typography and structured layout rules.
 */

// Register professional fonts (using local TTF files for maximum reliability)
const getFontPath = (path: string) => {
  if (typeof window !== "undefined") {
    return window.location.origin + path;
  }
  return path;
};

Font.register({
  family: "Inter",
  fonts: [
    { src: getFontPath("/fonts/Inter-Regular.ttf"), fontWeight: 400 },
    { src: getFontPath("/fonts/Inter-Bold.ttf"), fontWeight: 700 },
  ],
});

Font.register({
  family: "Plus Jakarta Sans",
  fonts: [
    { src: getFontPath("/fonts/PlusJakartaSans-Bold.ttf"), fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 40, // 5 * 8px
    backgroundColor: "#ffffff",
    fontFamily: "Inter",
  },
  header: {
    marginBottom: 32, // 4 * 8px
    borderBottom: 2,
    borderBottomColor: "#0f172a",
    paddingBottom: 16, // 2 * 8px
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  headerLeft: {
    flexDirection: "column",
    gap: 2,
  },
  brandWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logo: {
    width: 24,
    height: 24,
  },
  shopName: {
    fontSize: 24,
    fontFamily: "Plus Jakarta Sans",
    fontWeight: 700, // Registered bold variant
    color: "#0f172a",
    textTransform: "uppercase",
    letterSpacing: -1,
  },
  reportTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginTop: 4,
  },
  headerRight: {
    textAlign: "right",
  },
  timestamp: {
    fontSize: 8,
    color: "#94a3b8",
    fontWeight: 700,
    textTransform: "uppercase",
  },
  periodLabel: {
    fontSize: 9,
    fontWeight: 700,
    color: "#0f172a",
    textTransform: "uppercase",
    marginTop: 2,
  },
  kpiGrid: {
    flexDirection: "row",
    gap: 16, // 2 * 8px
    marginBottom: 32, // 4 * 8px
  },
  kpiCard: {
    flex: 1,
    padding: 16, // 2 * 8px
    borderRadius: 8,
    border: 1,
    borderColor: "#f1f5f9",
    backgroundColor: "#f8fafc",
  },
  kpiTitle: {
    fontSize: 8,
    fontWeight: 700,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  kpiValue: {
    fontSize: 18,
    fontFamily: "Inter", // Unified Industry Standard for data
    fontWeight: 700, // Mandated bold weight for summaries
    color: "#0f172a",
  },
  kpiSubtitle: {
    fontSize: 7,
    fontFamily: "Inter",
    fontWeight: 700,
    color: "#94a3b8",
    textTransform: "uppercase",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Plus Jakarta Sans",
    fontWeight: 700,
    color: "#0f172a",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 16,
    marginTop: 8,
  },
  chartContainer: {
    width: "100%",
    height: 220,
    marginBottom: 32,
    borderRadius: 12,
    overflow: "hidden",
  },
  table: {
    width: "100%",
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottom: 1,
    borderBottomColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontWeight: 700,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: 1,
    borderBottomColor: "#f1f5f9",
    paddingVertical: 12, // High-density padding
    paddingHorizontal: 16,
  },
  tableCell: {
    fontSize: 9,
    color: "#334155",
    fontWeight: 400,
  },
  tableCellBold: {
    fontSize: 9,
    fontWeight: 700,
    color: "#0f172a",
  },
  tableCellMono: {
    fontSize: 8,
    color: "#64748b",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    borderTop: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 7,
    color: "#94a3b8",
    fontWeight: 700,
    textTransform: "uppercase",
  }
});

interface ReportKPI {
  label: string;
  value: string | number;
  subtitle?: string;
}

interface ReportTableColumn {
  header: string;
  width: string;
  isBold?: boolean;
  isMono?: boolean;
  align?: "left" | "right" | "center";
}

interface ReportDocumentProps {
  data: {
    title: string;
    period: string;
    kpis: ReportKPI[];
    charts?: string[]; // Base64 images
    table: {
      columns: ReportTableColumn[];
      rows: any[][];
    };
    footerNote?: string;
  };
}

export function ReportDocument({ data }: ReportDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.brandWrapper}>
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <Image src={getFontPath("/branding/logo.svg")} style={styles.logo} />
              <Text style={styles.shopName}>{UI_LABELS.dynamic.FAITH_LAUNDRY_SHOP_2a14}</Text>
            </View>
            <Text style={styles.reportTitle}>{data.title}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.timestamp}>{UI_LABELS.dynamic.GENERATED} {new Date().toLocaleString()}</Text>
            <Text style={styles.periodLabel}>{data.period}</Text>
          </View>
        </View>

        {/* Dynamic KPIs */}
        <View style={styles.kpiGrid}>
          {data.kpis.map((kpi, idx) => (
            <View key={idx} style={styles.kpiCard}>
              <Text style={styles.kpiTitle}>{kpi.label}</Text>
              <Text style={styles.kpiValue}>{kpi.value}</Text>
              {kpi.subtitle && <Text style={styles.kpiSubtitle}>{kpi.subtitle}</Text>}
            </View>
          ))}
        </View>

        {/* Dynamic Charts */}
        {data.charts && data.charts.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>{UI_LABELS.dynamic.PERFORMANCE_VISUALIZATIONS}</Text>
            {data.charts.map((img, idx) => (
              <View key={idx} style={styles.chartContainer}>
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <Image src={img} />
              </View>
            ))}
          </>
        )}

        {/* Dynamic Table */}
        <Text style={styles.sectionTitle}>{UI_LABELS.dynamic.DETAILED_RECORDS}</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            {data.table.columns.map((col, idx) => (
              <Text 
                key={idx} 
                style={[
                  styles.tableHeaderCell, 
                  { width: col.width, textAlign: col.align || "left" }
                ]}
              >
                {col.header}
              </Text>
            ))}
          </View>
          {data.table.rows.map((row, rowIdx) => (
            <View key={rowIdx} style={styles.tableRow}>
              {row.map((cell, cellIdx) => {
                const col = data.table.columns[cellIdx];
                return (
                  <Text 
                    key={cellIdx} 
                    style={[
                      col.isBold ? styles.tableCellBold : col.isMono ? styles.tableCellMono : styles.tableCell,
                      { width: col.width, textAlign: col.align || "left" }
                    ]}
                  >
                    {cell}
                  </Text>
                );
              })}
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {data.footerNote || "Faith Laundry Shop Management System — Official Audit Document"}
          </Text>
          <Text style={styles.footerText}>{UI_LABELS.dynamic.PAGE_1_OF_1}</Text>
        </View>
      </Page>
    </Document>
  );
}
