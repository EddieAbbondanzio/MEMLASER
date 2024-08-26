import 'package:flutter/material.dart';
import 'package:memlaser/src/api/dtos/snapshot.dart';
import 'package:memlaser/src/api/exceptions.dart';
import 'package:memlaser/src/api/services/snapshot_service.dart';
import 'package:memlaser/src/app.dart';
import 'package:memlaser/src/core/acknowledge_error_dialog.dart';
import 'package:provider/provider.dart';

class SnapshotTile extends StatelessWidget {
  final Snapshot snapshot;

  const SnapshotTile({super.key, required this.snapshot});

  @override
  Widget build(BuildContext context) {
    return Consumer<SnapshotService>(
        builder: (context, snapshotService, child) {
      final isBeingImported = snapshot.state == SnapshotState.importing;
      Widget subtitle, trailing;

      if (isBeingImported) {
        subtitle = StreamBuilder<String>(
            stream: snapshot.progressStream,
            builder: (context, asyncSnapshot) {
              return Text(asyncSnapshot.data ?? '');
            });

        trailing = Transform.scale(
            scale: 0.5, child: const CircularProgressIndicator());
      } else {
        if (snapshot.state == SnapshotState.imported) {
          subtitle = Text(formatBytes(snapshot.stats?.fileSize));
        } else {
          subtitle = const Text("invalid");
        }

        trailing = PopupMenuButton<String>(
          enabled: !isBeingImported,
          onSelected: (value) async {
            if (value == "delete") {
              try {
                await snapshotService.deleteSnapshot(snapshot.name);
              } on SnapshotDeleteFailedException catch (e) {
                showDialog(
                    context: navigatorKey.currentContext!,
                    builder: (BuildContext context) {
                      return AcknowledgeErrorDialog(
                          title: e.title, message: e.message);
                    });
              }
            }
          },
          itemBuilder: (context) => <PopupMenuEntry<String>>[
            const PopupMenuItem(value: "delete", child: Text("Delete")),
          ],
        );
      }

      return ListTile(
          visualDensity: VisualDensity.comfortable,
          contentPadding: const EdgeInsets.fromLTRB(8.0, 0, 8.0, 0),
          dense: true,
          enabled: !isBeingImported,
          selected: snapshotService.selectedSnapshot?.name == snapshot.name,
          title: Text(
            snapshot.name,
          ),
          titleTextStyle:
              const TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
          subtitle: subtitle,
          subtitleTextStyle: const TextStyle(color: Colors.black54),
          onTap: () {
            snapshotService.setSelectedSnapshot(snapshot);
          },
          hoverColor: Colors.black12,
          trailing: trailing);
    });
  }
}
