class SnapshotAlreadyImportedException implements Exception {
  final String message;
  const SnapshotAlreadyImportedException(this.message);
}

class InvalidSnapshotFileException implements Exception {
  final String message;
  const InvalidSnapshotFileException(this.message);
}
