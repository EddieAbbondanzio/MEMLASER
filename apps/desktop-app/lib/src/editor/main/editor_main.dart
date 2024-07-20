import 'package:flutter/material.dart';

class EditorMain extends StatelessWidget {
  const EditorMain({super.key});

  @override
  Widget build(BuildContext context) {
    return const Expanded(
      child: ColoredBox(
        color: Colors.white,
        child: Text(
          'Epic main content here!',
          style: TextStyle(color: Colors.black),
        ),
      ),
    );
  }
}
