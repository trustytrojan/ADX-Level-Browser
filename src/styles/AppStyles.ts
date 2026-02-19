import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1115',
    paddingTop: 0,
  },
  header: {
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#0f1115',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    color: '#e6e6e6',
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  githubButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 16,
  },
  searchBar: {
    borderWidth: 1,
    borderColor: '#2a2f3a',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#e6e6e6',
    backgroundColor: '#151821',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#9aa3b2',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  errorIcon: {
    marginRight: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#ff6b6b',
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 12,
    color: '#9aa3b2',
    textAlign: 'center',
  },
  sectionLabel: {
    marginTop: 8,
    marginBottom: 6,
    paddingHorizontal: 16,
    fontSize: 12,
    color: '#9aa3b2',
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
    marginTop: 8,
    paddingHorizontal: 16,
  },
  resultButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#1b1f2a',
    borderRadius: 6,
  },
  resultButtonMajdata: {
    backgroundColor: '#152846',
  },
  resultButtonDisabled: {
    opacity: 0.5,
  },
  resultButtonSelected: {
    backgroundColor: '#1b2a3f',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  resultButtonSelectedNew: {
    borderWidth: 3,
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
    backgroundColor: '#0f1115',
  },
  resultTextGroup: {
    flex: 1,
    paddingRight: 8,
  },
  resultText: {
    fontSize: 16,
    color: '#e6e6e6',
  },
  resultSubtext: {
    marginTop: 2,
    fontSize: 12,
    color: '#9aa3b2',
  },
  resultTextBold: {
    fontWeight: '700',
  },
  resultSubtextBold: {
    fontWeight: '600',
  },
  downloadIndicator: {
    marginLeft: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#9aa3b2',
  },
  selectionToolbar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#151821',
    borderTopWidth: 1,
    borderTopColor: '#2a2f3a',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectionToolbarText: {
    fontSize: 14,
    color: '#e6e6e6',
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
  helpModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpModalContent: {
    backgroundColor: '#1b1f2a',
    borderRadius: 12,
    padding: 20,

    // Limits horizontal growth on large screens
    maxWidth: 400,

    // Limits horizontal growth on small screens (keeps it from touching edges)
    width: '90%',

    // Forces the modal to only be as tall as its children
    // If it's still too long, check if a child has { flex: 1 }
    alignSelf: 'center',

    // Safety check: prevents it from bleeding off the top/bottom
    maxHeight: '80%',
  },
  helpModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e6e6e6',
    marginBottom: 12,
  },
  helpModalText: {
    fontSize: 14,
    color: '#9aa3b2',
    lineHeight: 20,
    marginBottom: 20,
  },
  settingsModalText: {
    fontSize: 14,
    color: '#9aa3b2',
    lineHeight: 20,
  },
  helpModalCloseButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  helpModalCloseButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  downloadingModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadingModalContent: {
    backgroundColor: '#1b1f2a',
    borderRadius: 12,
    padding: 20,
    maxWidth: 400,
    width: '90%',
    maxHeight: '85%',
    alignSelf: 'center',
  },
  downloadingModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e6e6e6',
    marginBottom: 8,
    textAlign: 'center',
  },
  downloadingModalSubtitle: {
    fontSize: 14,
    color: '#9aa3b2',
    textAlign: 'center',
    marginBottom: 16,
  },
  downloadingModalProgressContainer: {
    marginBottom: 20,
  },
  downloadingModalProgressBar: {
    height: 8,
    backgroundColor: '#2a2f3a',
    borderRadius: 4,
    overflow: 'hidden',
  },
  downloadingModalProgressFill: {
    height: '100%',
    backgroundColor: '#4caf50',
    borderRadius: 4,
  },
  downloadingModalErrorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderColor: '#ff6b6b',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  downloadingModalErrorText: {
    color: '#ff6b6b',
    fontSize: 14,
    fontWeight: '500',
  },
  downloadingModalList: {
    maxHeight: 300,
    marginBottom: 16,
  },
  downloadingModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#151821',
    borderRadius: 8,
    marginBottom: 8,
    gap: 12,
  },
  downloadingModalItemLeft: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadingModalItemContent: {
    flex: 1,
  },
  downloadingModalItemTitle: {
    fontSize: 14,
    color: '#e6e6e6',
    fontWeight: '500',
  },
  downloadingModalItemSubtitle: {
    fontSize: 12,
    color: '#9aa3b2',
    marginTop: 2,
  },
  downloadingModalItemRight: {
    alignItems: 'flex-end',
  },
  downloadingModalItemStatus: {
    fontSize: 12,
    color: '#9aa3b2',
  },
  downloadingModalLoadingContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  downloadingModalLoadingText: {
    color: '#9aa3b2',
    fontSize: 14,
  },
  downloadingModalCompleteButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 16,
  },
  downloadingModalCompleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  downloadFab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    left: 20,
    backgroundColor: '#007AFF',
    borderRadius: 28,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  downloadFabText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  reviewModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewModalContent: {
    backgroundColor: '#1b1f2a',
    borderRadius: 12,
    padding: 20,
    maxWidth: 400,
    width: '90%',
    maxHeight: '85%',
    alignSelf: 'center',
  },
  reviewModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e6e6e6',
  },
  reviewModalCount: {
    fontSize: 14,
    color: '#9aa3b2',
    marginBottom: 16,
  },
  reviewModalList: {
    maxHeight: 300,
    marginBottom: 16,
  },
  reviewModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#151821',
    borderRadius: 8,
    marginBottom: 8,
  },
  reviewModalItemContent: {
    flex: 1,
    marginRight: 12,
  },
  reviewModalItemTitle: {
    fontSize: 14,
    color: '#e6e6e6',
    fontWeight: '500',
  },
  reviewModalItemSubtitle: {
    fontSize: 12,
    color: '#9aa3b2',
    marginTop: 2,
  },
  reviewModalItemRemove: {
    padding: 4,
  },
  reviewModalButtons: {
    gap: 12,
  },
  reviewModalClearButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center',
  },
  reviewModalClearButtonText: {
    color: '#ff6b6b',
    fontSize: 16,
    fontWeight: '600',
  },
  reviewModalDownloadOnlyButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center',
  },
  reviewModalDownloadOnlyButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  reviewModalDownloadButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  reviewModalDownloadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
