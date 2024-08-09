abstract class ApiException implements Exception {
  abstract final String title;
  abstract final String message;
}

class SnapshotAlreadyImportedException implements ApiException {
  @override
  String title = "Duplicate import";
  @override
  final String message;
  SnapshotAlreadyImportedException(this.message);
}

class InvalidSnapshotFileException implements ApiException {
  @override
  String title = "Invalid snapshot";
  @override
  final String message;
  InvalidSnapshotFileException(this.message);
}
