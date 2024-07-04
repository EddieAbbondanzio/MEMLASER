import 'package:flutter/material.dart';
import 'package:memlaser/src/editor/sidebar.dart';

class Body extends StatelessWidget {
  const Body({super.key});

  @override
  Widget build(BuildContext context) {
    return const Row(
      children: [
        Sidebar(),
        // TODO: Add main content here.
      ],
    );
  }
}
