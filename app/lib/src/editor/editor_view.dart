import 'package:flutter/material.dart';
import 'package:memlaser/src/editor/main/editor_main.dart';
import 'package:memlaser/src/editor/sidebar/sidebar.dart';

class EditorView extends StatelessWidget {
  const EditorView({
    super.key,
  });

  static const routeName = '/';

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
        body: Row(
      children: [EditorSidebar(), EditorMain()],
    ));
  }
}
