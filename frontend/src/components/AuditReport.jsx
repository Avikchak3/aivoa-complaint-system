import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 10, fontFamily: 'Helvetica', color: '#1a1a1a' },
  header: { borderBottom: '2px solid #0f172a', paddingBottom: 10, marginBottom: 15 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  subtitle: { fontSize: 9, color: '#64748b', marginTop: 2 },
  section: { marginBottom: 12, padding: 8, backgroundColor: '#f8fafc', borderRadius: 4 },
  sectionTitle: { fontSize: 11, fontWeight: 'bold', color: '#334155', marginBottom: 6, textTransform: 'uppercase' },
  row: { flexDirection: 'row', marginBottom: 4 },
  label: { width: '35%', color: '#64748b', fontWeight: 'bold' },
  value: { width: '65%', color: '#0f172a' },
  footer: { position: 'absolute', bottom: 20, left: 30, right: 30, borderTop: '1px solid #e2e8f0', paddingTop: 5, fontSize: 8, color: '#94a3b8', textAlign: 'center' }
});

export const AuditReport = ({ form, riskAssessment, capaPlan }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>AIVOA Pharma Compliance Audit Report</Text>
        <Text style={styles.subtitle}>21 CFR Part 11 Compliant Automated Quality Record | Generated: {new Date().toLocaleString()}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Intake & Batch Metadata</Text>
        <View style={styles.row}><Text style={styles.label}>Product Name:</Text><Text style={styles.value}>{form.product_name || 'N/A'}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Strength / Grade:</Text><Text style={styles.value}>{form.product_strength || 'N/A'}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Batch Number:</Text><Text style={styles.value}>{form.batch_number || 'N/A'}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Affected Quantity:</Text><Text style={styles.value}>{form.affected_quantity || 'N/A'}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Manufacturing Date:</Text><Text style={styles.value}>{form.manufacturing_date || 'N/A'}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Expiry Date:</Text><Text style={styles.value}>{form.expiry_date || 'N/A'}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Reporting Entity:</Text><Text style={styles.value}>{form.reporter_name || 'N/A'}</Text></View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. Defect Description</Text>
        <Text style={styles.value}>{form.complaint_description || 'No description provided.'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. AI Risk Scoring & Evaluation</Text>
        <View style={styles.row}><Text style={styles.label}>Assigned Severity:</Text><Text style={styles.value}>{riskAssessment.severity}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Recommended Action:</Text><Text style={styles.value}>{riskAssessment.suggested_action}</Text></View>
      </View>

      {capaPlan && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. CAPA Investigation Workflow</Text>
          <View style={styles.row}><Text style={styles.label}>Root Cause Analysis:</Text><Text style={styles.value}>{capaPlan.root_cause_analysis}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Containment Protocol:</Text><Text style={styles.value}>{capaPlan.immediate_containment}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Corrective Actions:</Text><Text style={styles.value}>{capaPlan.corrective_actions}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Preventive Actions:</Text><Text style={styles.value}>{capaPlan.preventive_actions}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Resolution SLA:</Text><Text style={styles.value}>{capaPlan.target_completion_days} Days</Text></View>
        </View>
      )}

      <Text style={styles.footer}>Confidential - Internal QA Regulatory Record - AIVOA Automated System</Text>
    </Page>
  </Document>
);