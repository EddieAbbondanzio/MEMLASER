import 'package:flutter/material.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;

class Backend extends ChangeNotifier {
  String clientId = "";
  final WebSocketChannel _channel;
  http.Client httpClient = http.Client();

  Backend(this._channel) {
    _channel.stream.listen((m) {
      var parsed = json.decode(m);
      print(parsed);

      switch (parsed["type"]) {
        case "CLIENT_ID":
          clientId = parsed["data"];
          notifyListeners();
      }
    });
  }

  @override
  void dispose() {
    httpClient.close();
    super.dispose();
  }

  Future<void> get(String path) async {
    var res = await httpClient
        .get(Uri.parse(path), headers: {'x-client-id': clientId});

    if (res.statusCode > 200) {
      throw Exception("Failed to GET ${res.body}");
    }

    return jsonDecode(res.body);
  }
}
