import 'dart:convert';

import 'package:memlaser/src/api/dtos/snapshot_stats.dart';

enum ApiEventType {
  clientId("CLIENT_ID"),
  importSnapshotProgress("IMPORT_SNAPSHOT_PROGRESS"),
  importSnapshotSuccess("IMPORT_SNAPSHOT_SUCCESS"),
  importSnapshotFailure("IMPORT_SNAPSHOT_FAILURE");

  final String value;
  const ApiEventType(this.value);
}

abstract class ApiEvent {
  abstract ApiEventType type;

  ApiEvent();

  factory ApiEvent.parse(String raw) {
    Map<String, dynamic> json = jsonDecode(raw);

    for (var t in ApiEventType.values) {
      print(t.value);
    }

    var type = ApiEventType.values.firstWhere((t) => t.value == json['type']);
    return switch (type) {
      ApiEventType.clientId => ClientIdAssigned.fromJson(json),
      ApiEventType.importSnapshotProgress =>
        ImportSnapshotProgress.fromJson(json),
      ApiEventType.importSnapshotSuccess =>
        ImportSnapshotSuccess.fromJson(json),
      ApiEventType.importSnapshotFailure =>
        ImportSnapshotFailure.fromJson(json),
    };
  }
}

class ClientIdAssigned extends ApiEvent {
  @override
  ApiEventType type = ApiEventType.clientId;
  String id;

  ClientIdAssigned(this.id);
  ClientIdAssigned.fromJson(Map<String, dynamic> json) : id = json['clientId'];
}

class ImportSnapshotProgress extends ApiEvent {
  @override
  ApiEventType type = ApiEventType.importSnapshotProgress;
  String snapshotName;
  String message;

  ImportSnapshotProgress(this.snapshotName, this.message);
  ImportSnapshotProgress.fromJson(Map<String, dynamic> json)
      : snapshotName = json['snapshotName'],
        message = json['message'];
}

class ImportSnapshotSuccess extends ApiEvent {
  @override
  ApiEventType type = ApiEventType.importSnapshotSuccess;
  String snapshotName;
  SnapshotStats stats;

  ImportSnapshotSuccess(this.snapshotName, this.stats);
  ImportSnapshotSuccess.fromJson(Map<String, dynamic> json)
      : snapshotName = json['snapshotName'],
        stats = SnapshotStats.fromJSON(json['stats']);
}

class ImportSnapshotFailure extends ApiEvent {
  @override
  ApiEventType type = ApiEventType.importSnapshotFailure;
  String snapshotName;
  String message;

  ImportSnapshotFailure(this.snapshotName, this.message);
  ImportSnapshotFailure.fromJson(Map<String, dynamic> json)
      : snapshotName = json['snapshotName'],
        message = json['message'];
}
