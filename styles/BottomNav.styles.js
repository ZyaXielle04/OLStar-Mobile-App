import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({

  navWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: 15,
  },

  nav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingBottom: 12,
    elevation: 10,
  },

  navItem: {
    alignItems: 'center',
  },

  circle: {
    width: 45,
    height: 45,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },

  navLabel: {
    fontSize: 12,
    marginTop: 4,
  },

  activeCircle: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    transform: [{ translateY: -8 }],
  },

  activeNavLabel: {
    fontWeight: '800',
    color: '#ff4d4d',
  },

  /* =========================
     FAB SYSTEM (FIXED)
     ========================= */

  fabContainer: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    alignItems: 'flex-end',
  },

  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ff4d4d',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },

  fabAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff4d4d',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 30,
    marginBottom: 12,
    elevation: 6,
  },

  fabActionText: {
    color: '#fff',
    fontWeight: '700',
    marginLeft: 8,
  },

});