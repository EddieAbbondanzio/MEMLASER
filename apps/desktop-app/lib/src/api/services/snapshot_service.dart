import 'package:flutter/material.dart';
import 'package:memlaser/src/api/client.dart';
import 'package:memlaser/src/api/dtos/snapshot.dart';
import 'dart:convert';

class SnapshotService extends ChangeNotifier {
  final APIClient _apiClient;
  List<Snapshot> snapshots = [];

  SnapshotService(this._apiClient) {
    loadSnapshots();
  }

  Future<void> loadSnapshots() async {
    final snapshotsJSON = await _apiClient.get<List<dynamic>>("snapshots");
    snapshots = snapshotsJSON
        .map((json) => Snapshot(json["name"], json["path"], "100 mb"))
        .toList();
    notifyListeners();
  }

  Future<void> importSnapshot(String path) async {
    final snapshotJSON =
        await _apiClient.post("snapshots/import", jsonEncode({'path': path}));

    final importedSnapshot =
        Snapshot(snapshotJSON["name"], snapshotJSON["path"], "101 mb");
    snapshots.add(importedSnapshot);
    notifyListeners();
  }
}
