import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchBar: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  sectionLabel: {
    marginTop: 8,
    marginBottom: 6,
    paddingHorizontal: 16,
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  downloadsContainer: {
    marginHorizontal: 16,
    borderRadius: 8,
  },
  downloadsList: {
    maxHeight: 180,
  },
  songsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  resultButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
  },
  resultButtonDisabled: {
    opacity: 0.5,
  },
  resultButtonSelected: {
    backgroundColor: '#d0e8ff',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  resultContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectionCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  selectionCheckmark: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  resultTextGroup: {
    flex: 1,
    paddingRight: 8,
  },
  resultText: {
    fontSize: 16,
    color: '#333',
  },
  resultSubtext: {
    marginTop: 2,
    fontSize: 12,
    color: '#666',
  },
  downloadIndicator: {
    marginLeft: 8,
  },
  downloadedCheck: {
    marginLeft: 8,
    fontSize: 16,
    color: '#2e7d32',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#999',
  },
  selectionToolbar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f8f8',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectionToolbarText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  selectionToolbarButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  toolbarButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: '#007AFF',
  },
  toolbarButtonSecondary: {
    backgroundColor: '#666',
  },
  toolbarButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
