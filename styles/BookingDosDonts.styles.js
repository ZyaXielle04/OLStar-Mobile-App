import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#222',
    marginLeft: 10,
  },
  summary: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 14,
    marginBottom: 18,
    backgroundColor: '#fffafa',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#222',
    marginBottom: 6,
  },
  summaryText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 3,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#333',
    marginBottom: 10,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  ruleText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#444',
    marginLeft: 8,
  },
  agreementRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    backgroundColor: '#fafafa',
    marginTop: 4,
    marginBottom: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#ff4d4d',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: '#ff4d4d',
  },
  agreementText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: '#444',
  },
  continueButton: {
    backgroundColor: '#ff4d4d',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  continueButtonDisabled: {
    backgroundColor: '#d6d6d6',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  backButton: {
    backgroundColor: '#6c757d',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});
