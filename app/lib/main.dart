import 'package:flutter/material.dart';
import 'package:memlaser/src/api/client.dart';
import 'package:memlaser/src/api/config.dart';
import 'package:memlaser/src/api/services/snapshot_service.dart';
import 'package:provider/provider.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

import 'src/app.dart';
import 'src/settings/settings_controller.dart';
import 'src/settings/settings_service.dart';

void main() async {
  // Set up the SettingsController, which will glue user settings to multiple
  // Flutter Widgets.
  final settingsController = SettingsController(SettingsService());

  // Load the user's preferred theme while the splash screen is displayed.
  // This prevents a sudden theme change when the app is first displayed.
  await settingsController.loadSettings();

  final websocketConnection = WebSocketChannel.connect(Uri.parse(wsURL));
  await websocketConnection.ready;
  final apiClient = APIClient(websocketConnection);
  await apiClient.ready;

  runApp(MultiProvider(
      // Create one provider per service so we can minimize the amount of
      // widgets that get re-rendered when a service changes.
      providers: [
        ListenableProvider(create: (context) => SnapshotService(apiClient))
      ],
      child: MyApp(settingsController: settingsController)));
}
