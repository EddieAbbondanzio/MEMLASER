class SnapshotStats {
  int size;
  DateTime createdAt;
  DateTime importedAt;

  SnapshotStats(this.size, this.createdAt, this.importedAt);
  SnapshotStats.fromJSON(Map<String, dynamic> json)
      : size = json['size'],
        createdAt = DateTime.parse(json['createdAt']),
        importedAt = DateTime.parse(json['importedAt']);
}
