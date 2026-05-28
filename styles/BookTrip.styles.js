import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#f7f7fb',
  },

  content: {
    padding: 20,
    paddingBottom: 20,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },

  title: {
    fontSize: 24,
    fontWeight: '800',
    marginLeft: 10,
    color: '#222',
  },

  /* =========================
     SERVICE CARD (NEW)
     ========================= */

  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 15,
    marginBottom: 18,
    elevation: 4,
  },

  cardImage: {
    width: '100%',
    height: 150,
    borderRadius: 14,
    marginBottom: 12,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 10,
    color: '#222',
    flexShrink: 1,
  },

  cardDesc: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    lineHeight: 18,
  },

  cardButton: {
    backgroundColor: '#ff4d4d',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },

  cardButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
});