import 'dart:io';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';

class Sidebar extends StatelessWidget {
  const Sidebar({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(8.0),
      width: 320.0,
      color: Colors.white70,
      child: Column(
        children: [
          const Text("Sidebar"),
          IconButton(
              onPressed: () async {
                print("CLICK!");
                FilePickerResult? result =
                    await FilePicker.platform.pickFiles();

                if (result != null) {
                  File file = File(result.files.single.path!);
                  print('File: ${file.path}');
                }
              },
              color: Colors.amber,
              icon: const Icon(Icons.add))
        ],
      ),
    );
  }
}
