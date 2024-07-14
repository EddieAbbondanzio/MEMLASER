import 'package:flutter/material.dart';
import 'package:memlaser/src/editor/sidebar/import_snapshot_button.dart';

class EditorSidebarHeader extends StatelessWidget {
  const EditorSidebarHeader({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
        padding: const EdgeInsets.all(8.0),
        decoration: const BoxDecoration(
            border:
                Border(bottom: BorderSide(width: 1, color: Colors.black12))),
        child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text("Snapshots",
                  style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize:
                          Theme.of(context).textTheme.labelLarge?.fontSize)),
              const ImportSnapshotButton()
            ]));
  }
}
