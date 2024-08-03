import 'package:flutter/material.dart';
import 'package:memlaser/src/api/dtos/snapshot.dart';
import 'package:memlaser/src/api/services/snapshot_service.dart';

class SnapshotTile extends StatelessWidget {
  final Snapshot snapshot;

  const SnapshotTile({super.key, required this.snapshot});

  @override
  Widget build(BuildContext context) {
    final isBeingImported = snapshot.state == SnapshotState.importing;
    Widget subtitle, trailing;

    if (isBeingImported) {
      subtitle = StreamBuilder<String>(
          stream: snapshot.progressStream,
          builder: (context, asyncSnapshot) {
            return Text(asyncSnapshot.data ?? '');
          });

      trailing =
          Transform.scale(scale: 0.5, child: const CircularProgressIndicator());
    } else {
      subtitle = Text(formatBytes(snapshot.fileSize));

      trailing = PopupMenuButton<String>(
        enabled: !isBeingImported,
        onSelected: (value) => print(value),
        itemBuilder: (context) => <PopupMenuEntry<String>>[
          const PopupMenuItem(value: "a", child: Text("a")),
          const PopupMenuItem(value: "b", child: Text("c"))
        ],
      );
    }

    return ListTile(
        visualDensity: VisualDensity.comfortable,
        contentPadding: const EdgeInsets.fromLTRB(8.0, 0, 8.0, 0),
        dense: true,
        enabled: !isBeingImported,
        title: Text(
          snapshot.name,
        ),
        titleTextStyle:
            const TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
        subtitle: subtitle,
        subtitleTextStyle: const TextStyle(color: Colors.black54),
        onTap: () {
          print("Snapshot ${snapshot.name} was clicked.");
        },
        hoverColor: Colors.black12,
        trailing: trailing);
  }
}
