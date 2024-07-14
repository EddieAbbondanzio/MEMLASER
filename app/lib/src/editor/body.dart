import 'package:flutter/material.dart';
import 'package:memlaser/src/api/client.dart';
import 'package:memlaser/src/editor/sidebar/sidebar.dart';
import 'package:provider/provider.dart';

class Body extends StatelessWidget {
  const Body({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<API>(
      builder: (context, backend, child) {
        return const Row(
          children: [
            Sidebar(),
            Text("hiii"),
            // TODO: Add main content here.
          ],
        );
      },
    );
  }
}
