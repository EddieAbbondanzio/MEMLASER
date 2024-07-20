import 'package:flutter/material.dart';
import 'package:memlaser/src/api/services/snapshot_service.dart';
import 'package:memlaser/src/editor/sidebar/sidebar_header.dart';
import 'package:memlaser/src/editor/sidebar/sidebar_snapshot.dart';

import 'package:provider/provider.dart';

const sidebarWidthPX = 320.0;
const sidebarBorder = Colors.black12;

class EditorSidebar extends StatelessWidget {
  const EditorSidebar({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<SnapshotService>(
        builder: (context, snapshotService, child) {
      final snapshots = snapshotService.snapshots;

      return Container(
        decoration: const BoxDecoration(
            color: Colors.white12,
            border: Border(right: BorderSide(width: 1, color: sidebarBorder))),
        width: sidebarWidthPX,
        child: Column(
          children: [
            const EditorSidebarHeader(),
            ListView.builder(
              itemCount: snapshots.length,
              itemBuilder: (context, index) =>
                  EditorSidebarSnapshot(snapshot: snapshots[index]),
              shrinkWrap: true,
              scrollDirection: Axis.vertical,
            )
          ],
        ),
      );
    });
  }
}
