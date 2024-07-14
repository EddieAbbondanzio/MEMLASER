import 'package:flutter/material.dart';
import 'package:memlaser/src/api/domain/snapshot.dart';

class EditorSidebarSnapshot extends StatelessWidget {
  final Snapshot snapshot;

  const EditorSidebarSnapshot({super.key, required this.snapshot});

  @override
  Widget build(BuildContext context) {
    return ListTile(
        visualDensity: VisualDensity.comfortable,
        contentPadding: const EdgeInsets.fromLTRB(8.0, 0, 8.0, 0),
        dense: true,
        title: Text(
          snapshot.name,
        ),
        titleTextStyle:
            const TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
        subtitle: Text(snapshot.fileSize),
        subtitleTextStyle: const TextStyle(color: Colors.black54),
        onTap: () {
          print("Snapshot ${snapshot.name} was clicked.");
        },
        hoverColor: Colors.black12,
        trailing: PopupMenuButton<String>(
          onSelected: (value) => print(value),
          itemBuilder: (context) => <PopupMenuEntry<String>>[
            const PopupMenuItem(value: "a", child: Text("a")),
            const PopupMenuItem(value: "b", child: Text("c"))
          ],
        ));
  }
}
