class SnapshotStats {
  int fileSize;
  DateTime createdAt;
  DateTime importedAt;

  SnapshotStats(this.fileSize, this.createdAt, this.importedAt);
  SnapshotStats.fromJSON(Map<String, dynamic> json)
      : fileSize = json['fileSize'],
        createdAt = DateTime.parse(json['createdAt']),
        importedAt = DateTime.parse(json['importedAt']);
}
