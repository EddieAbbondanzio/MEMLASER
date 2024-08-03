import 'package:memlaser/src/api/dtos/snapshot_stats.dart';

enum SnapshotState { importing, imported, invalid }

class Snapshot {
  final SnapshotState state;
  final String name;
  final String path;
  final SnapshotStats? stats;
  final Stream<String>? progressStream;
  final String? errorMessage;

  Snapshot.importing(this.name, this.path, this.progressStream)
      : state = SnapshotState.importing,
        stats = null,
        errorMessage = null;

  Snapshot.invalid(this.name, this.path, this.errorMessage)
      : state = SnapshotState.invalid,
        progressStream = null,
        stats = null;

  Snapshot(this.name, this.path, this.stats)
      : state = SnapshotState.imported,
        progressStream = null,
        errorMessage = null;
}
