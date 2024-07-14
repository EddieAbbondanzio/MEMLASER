import 'package:flutter/material.dart';
import 'package:memlaser/src/api/domain/snapshot.dart';

class SidebarSnapshot extends StatelessWidget {
  final Snapshot snapshot;

  const SidebarSnapshot({super.key, required this.snapshot});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(snapshot.name),
        IconButton(
          icon: const Icon(Icons.more_horiz_outlined),
          onPressed: () {
            print("CLICK!");
          },
        )
      ],
    );
  }
}
