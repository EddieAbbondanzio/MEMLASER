class SnapshotAlreadyImportedException implements Exception {
  final String message;

  const SnapshotAlreadyImportedException(this.message);
}
