enum SnapshotState { importing, imported, invalid }

class Snapshot {
  final String name;
  final String path;
  final int? fileSize;
  final SnapshotState state;
  final Stream<String>? progressStream;
  final String? errorMessage;

  Snapshot.importing(this.name, this.path, this.progressStream)
      : state = SnapshotState.importing,
        fileSize = null,
        errorMessage = null;

  Snapshot.invalid(this.name, this.path, this.errorMessage)
      : state = SnapshotState.invalid,
        progressStream = null,
        fileSize = null;

  Snapshot(this.name, this.path, this.fileSize)
      : state = SnapshotState.imported,
        progressStream = null,
        errorMessage = null;
}
