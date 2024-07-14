import 'package:flutter/material.dart';
import 'package:memlaser/src/api/config.dart';
import 'package:memlaser/src/api/domain/snapshot.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;

const apiPort = 3475;

// TODO: Prob will need to split this out into multiple ChangeNotifiers.
// For example, sometimes we want to listen to the number of snapshots changing,
// but other times we just want to listen for ServerEvents and not re-render
// on each state change.

class API extends ChangeNotifier {
  String clientId = "";

  final WebSocketChannel _channel;
  final http.Client _httpClient = http.Client();

  List<Snapshot> snapshots = [];

  API(this._channel) {
    _channel.stream.listen((m) {
      final parsed = json.decode(m);

      switch (parsed["type"]) {
        case "CLIENT_ID":
          clientId = parsed["data"];
          loadInitialState();
          notifyListeners();
      }
    });
  }

  @override
  void dispose() {
    _httpClient.close();
    super.dispose();
  }

  Future<void> loadInitialState() async {
    final snapshotsJSON = await get<List<dynamic>>("snapshots");
    snapshots = snapshotsJSON
        .map((json) => Snapshot(json["name"], json["path"], "100 mb"))
        .toList();
    notifyListeners();
  }

  Future<B> get<B extends Object>(String path) async {
    final res = await _httpClient
        .get(_buildURL(path), headers: {'x-client-id': clientId});

    if (res.statusCode > 200) {
      throw Exception("Failed to GET ${res.body}");
    }

    return jsonDecode(res.body);
  }

  Future<B> post<B extends Object>(String path, Object payload) async {
    final res = await _httpClient.post(_buildURL(path),
        headers: {'x-client-id': clientId, "Content-Type": "application-json"});

    if (res.statusCode > 200) {
      throw Exception("Failed to POST ${res.body}");
    }

    return jsonDecode(res.body);
  }

  Uri _buildURL(String path) {
    return Uri.parse("$httpURL/$path");
  }
}
