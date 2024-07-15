import 'dart:async';

import 'package:memlaser/src/api/config.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;

const apiPort = 3475;

// TODO: Prob will need to split this out into multiple ChangeNotifiers.
// For example, sometimes we want to listen to the number of snapshots changing,
// but other times we just want to listen for ServerEvents and not re-render
// on each state change.

class APIClient {
  String clientId = "";

  final WebSocketChannel _channel;
  final http.Client _httpClient = http.Client();

  late Future<void> ready;
  late Completer _readyCompleter;

  APIClient(this._channel) {
    // TODO: Add timeout that throws error if we don't get a client after id
    // after X seconds.
    _readyCompleter = Completer<void>();
    ready = _readyCompleter.future;

    _channel.stream.listen((m) {
      final parsed = json.decode(m);

      switch (parsed["type"]) {
        case "CLIENT_ID":
          _setClientId(parsed["data"]);
      }
    });
  }

  void dispose() {
    _httpClient.close();
  }

  void _setClientId(String id) {
    clientId = id;
    _readyCompleter.complete();
  }

  Future<B> get<B extends Object>(String path) async {
    if (clientId == "") {
      throw Exception("API client doesn't have an id set.");
    }

    final res = await _httpClient
        .get(_buildURL(path), headers: {'x-client-id': clientId});

    if (res.statusCode > 200) {
      throw Exception("Failed to GET ${res.body}");
    }

    return jsonDecode(res.body);
  }

  Future<B> post<B extends dynamic>(String path, Object payload) async {
    if (clientId == "") {
      throw Exception("API client doesn't have an id set.");
    }

    final res = await _httpClient.post(_buildURL(path),
        headers: {'x-client-id': clientId, "Content-Type": "application/json"},
        body: payload);

    if (res.statusCode > 200) {
      throw Exception("Failed to POST ${res.body}");
    }

    return jsonDecode(res.body);
  }

  Uri _buildURL(String path) {
    return Uri.parse("$httpURL/$path");
  }
}
