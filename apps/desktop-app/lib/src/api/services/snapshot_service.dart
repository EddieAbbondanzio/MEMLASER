import 'dart:math';

import 'package:flutter/material.dart';
import 'package:http_status_code/http_status_code.dart';
import 'package:memlaser/src/api/client.dart';
import 'package:memlaser/src/api/dtos/api_events.dart';
import 'package:memlaser/src/api/dtos/snapshot.dart';
import 'dart:convert';

import 'package:memlaser/src/api/dtos/snapshot_stats.dart';
import 'package:memlaser/src/api/exceptions.dart';

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
            json["name"], json["path"], SnapshotStats.fromJSON(json["stats"])))
        .toList();
    notifyListeners();
  }

  Future<void> importSnapshot(String path) async {
    try {
      final snapshotJSON =
          await _apiClient.post("snapshots/import", jsonEncode({'path': path}));

      final snapshotName = snapshotJSON["name"];
      final snapshotPath = snapshotJSON["path"];

      final progressStream = _apiClient.eventStream
          .where((ev) =>
              ev.type == ApiEventType.importSnapshotProgress &&
              (ev as ImportSnapshotProgress).snapshotName == snapshotName)
          .map((ev) => (ev as ImportSnapshotProgress).message)
          .asBroadcastStream();

      final snapshotBeingImported =
          Snapshot.importing(snapshotName, snapshotPath, progressStream);
      snapshots.add(snapshotBeingImported);
      notifyListeners();

      final result = await _apiClient.eventStream.firstWhere((ev) =>
          ev.type == ApiEventType.importSnapshotSuccess ||
          ev.type == ApiEventType.importSnapshotFailure);

      Snapshot updatedSnapshot;
      switch (result.type) {
        case ApiEventType.importSnapshotSuccess:
          SnapshotStats stats = (result as ImportSnapshotSuccess).stats;
          updatedSnapshot = Snapshot(snapshotName, snapshotPath, stats);
        case ApiEventType.importSnapshotFailure:
          String errorMessage = (result as ImportSnapshotFailure).errorMessage;
          updatedSnapshot =
              Snapshot.invalid(snapshotName, snapshotPath, errorMessage);
        default:
          throw Exception('Unexpected event type ${result.type}');
      }

      var index = snapshots.indexWhere((s) => s.name == snapshotName);
      snapshots[index] = updatedSnapshot;

      notifyListeners();
    } on HttpException catch (e) {
      if (e.statusCode == StatusCode.CONFLICT) {
        throw SnapshotAlreadyImportedException(e.message);
      }
      if (e.statusCode == StatusCode.BAD_REQUEST) {
        throw InvalidSnapshotFileException(e.message);
      }

      // TODO: Flesh out unknown error case better.
      rethrow;
    }
  }

  void removeInvalidSnapshots() {
    snapshots.removeWhere((s) => s.state == SnapshotState.invalid);
    notifyListeners();
  }
}

// Src: https://gist.github.com/zzpmaster/ec51afdbbfa5b2bf6ced13374ff891d9
String formatBytes(int? bytes, {int decimals = 0}) {
  if (bytes == null || bytes <= 0) return "0b";
  const suffixes = [
    "b",
    "kb",
    "mb",
    "gb",
  ];
  var i = (log(bytes) / log(1024)).floor();
  return '${(bytes / pow(1024, i)).toStringAsFixed(decimals)}${suffixes[i]}';
}
