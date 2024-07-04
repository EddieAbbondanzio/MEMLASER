import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';

class Sidebar extends StatelessWidget {
  const Sidebar({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(8.0),
      width: 320.0,
      child: const Column(
        children: [Text("Sidebar")],
      ),
    );
  }
}
