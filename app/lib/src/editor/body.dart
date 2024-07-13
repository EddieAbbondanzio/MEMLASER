import 'package:flutter/material.dart';
import 'package:memlaser/src/app.dart';
import 'package:memlaser/src/editor/sidebar.dart';
import 'package:provider/provider.dart';

class Body extends StatelessWidget {
  const Body({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<Backend>(
      builder: (context, backend, child) {
        return Row(
          children: [
            const Sidebar(),
            Text("hiii"),
            // TODO: Add main content here.
          ],
        );
      },
    );
  }
}
