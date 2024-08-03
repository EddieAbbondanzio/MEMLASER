import 'dart:async';

import 'package:memlaser/src/api/config.dart';
import 'package:memlaser/src/api/dtos/api_events.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;

const readyTimeout = 5;

class APIClient {
  String clientId = "";

  final Stream<ApiEvent> eventStream;
  final http.Client _httpClient = http.Client();

  late Future<void> ready;

  APIClient(WebSocketChannel channel)
      : eventStream = channel.stream.map((m) {
          ApiEvent ev = ApiEvent.parse(m);
          return ev;
        }).asBroadcastStream() {
    ready = listenForClientId();
  }

  void dispose() {
    _httpClient.close();
  }

  Future<void> listenForClientId() async {
    final clientIdAssigned = await Future.any([
      Future.delayed(const Duration(minutes: readyTimeout), null),
      eventStream.firstWhere((ev) => ev.type == ApiEventType.clientId)
    ]);

    if (clientIdAssigned == null) {
      throw Exception(
          'App did not get client id from backend before timeout expired');
    }

    clientId = clientIdAssigned.id;
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

    if (res.statusCode >= 300) {
      throw Exception("Failed to POST ${res.body}");
    }

    return jsonDecode(res.body);
  }

  Uri _buildURL(String path) {
    return Uri.parse("$httpURL/$path");
  }
}
