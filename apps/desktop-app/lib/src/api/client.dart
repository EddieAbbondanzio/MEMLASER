import 'dart:async';

import 'package:memlaser/src/api/config.dart';
import 'package:memlaser/src/api/dtos/api_events.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;

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

    listenForMessagesOfType([ApiEventType.clientId]).listen((ApiEvent ev) {
      ClientIdAssigned clientIdAssigned = ev as ClientIdAssigned;
      clientId = clientIdAssigned.id;
      _readyCompleter.complete();
    });
  }

  void dispose() {
    _httpClient.close();
  }

  Stream<ApiEvent> listenForMessagesOfType(
      List<ApiEventType> messageTypes) async* {
    await for (final m in _channel.stream) {
      ApiEvent ev = ApiEvent.parse(m);
      if (messageTypes.contains(ev.type)) yield ev;
    }
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
