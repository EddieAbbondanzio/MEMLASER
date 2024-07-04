import 'package:flutter/material.dart';
import 'package:memlaser/src/editor/body.dart';

class EditorView extends StatelessWidget {
  const EditorView({
    super.key,
  });

  static const routeName = '/';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(title: const Text('Editor!'), actions: []),
        body: const Body());
  }
}
