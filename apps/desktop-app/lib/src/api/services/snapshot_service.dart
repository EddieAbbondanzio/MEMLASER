import 'dart:math';

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
        .map((json) => Snapshot(
            json["name"], json["path"], formatBytes((json["fileSize"]))))
        .toList();
    notifyListeners();
  }

  Future<void> importSnapshot(String path) async {
    final snapshotJSON =
        await _apiClient.post("snapshots/import", jsonEncode({'path': path}));

    final snapshotBeingImported =
        Snapshot.importing(snapshotJSON["name"], snapshotJSON["path"]);
    snapshots.add(snapshotBeingImported);
    notifyListeners();
  }
}

// Src: https://gist.github.com/zzpmaster/ec51afdbbfa5b2bf6ced13374ff891d9
String formatBytes(int bytes, {int decimals = 0}) {
  if (bytes <= 0) return "0b";
  const suffixes = [
    "b",
    "kb",
    "mb",
    "gb",
  ];
  var i = (log(bytes) / log(1024)).floor();
  return '${(bytes / pow(1024, i)).toStringAsFixed(decimals)}${suffixes[i]}';
}
