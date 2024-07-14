import 'package:flutter/material.dart';
import 'package:memlaser/src/api/config.dart';
import 'package:memlaser/src/api/domain/snapshot.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;

const apiPort = 3475;

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

  Future<T> get<T extends Object>(String path) async {
    var res = await _httpClient
        .get(Uri.parse("$httpURL/$path"), headers: {'x-client-id': clientId});

    if (res.statusCode > 200) {
      throw Exception("Failed to GET ${res.body}");
    }

    return jsonDecode(res.body);
  }
}
