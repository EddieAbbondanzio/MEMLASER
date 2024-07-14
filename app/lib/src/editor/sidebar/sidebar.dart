import 'package:flutter/material.dart';
import 'package:memlaser/src/api/client.dart';
import 'package:memlaser/src/editor/sidebar/sidebar_header.dart';
import 'package:memlaser/src/editor/sidebar/sidebar_snapshot.dart';

import 'package:provider/provider.dart';

class EditorSidebar extends StatelessWidget {
  const EditorSidebar({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<API>(builder: (context, api, child) {
      var snapshots = api.snapshots;
      print("Snapshot length: $snapshots.length");

      return Container(
        padding: const EdgeInsets.all(8.0),
        width: 320.0,
        child: Column(
          children: [
            const EditorSidebarHeader(),
            ListView.builder(
              itemCount: snapshots.length,
              itemBuilder: (context, index) => Material(
                type: MaterialType.transparency,
                child: EditorSidebarSnapshot(snapshot: snapshots[index]),
              ),
              shrinkWrap: true,
              scrollDirection: Axis.vertical,
            )
          ],
        ),
      );
    });
  }
}
