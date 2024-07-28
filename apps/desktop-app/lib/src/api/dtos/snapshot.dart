enum SnapshotState { importing, imported, invalid }

class Snapshot {
  final String name;
  final String path;
  final String? fileSize;
  final SnapshotState state;
  // TODO: Add stream here!

  Snapshot.importing(this.name, this.path)
      : state = SnapshotState.importing,
        fileSize = null;

  Snapshot(this.name, this.path, this.fileSize)
      : state = SnapshotState.imported;
}
