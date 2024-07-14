import 'dart:io';
import 'dart:convert';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:memlaser/src/api/client.dart';
import 'package:provider/provider.dart';

class ImportSnapshotButton extends StatelessWidget {
  const ImportSnapshotButton({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<API>(builder: (context, api, child) {
      onPressed() async {
        print("CLICK!");
        FilePickerResult? result = await FilePicker.platform.pickFiles();

        if (result != null) {
          File file = File(result.files.single.path!);
          print('File: ${file.path}');

          final r = await api.post(
              "snapshots/import", jsonEncode({'path': file.path}));

          // TODO, define a SnapshotsService api client? It would have helpers
          // like .snapshots, or importSnapshot. importSnapshot would add the
          // snapshot to .snapshots and notifyListeners() so we could re-render.
        }
      }

      return FilledButton(
          style: FilledButton.styleFrom(
            textStyle:
                const TextStyle(fontSize: 12.0, fontWeight: FontWeight.bold),
            backgroundColor: Colors.blue,
            padding: const EdgeInsets.all(8.0),
            shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(4.0)),
          ),
          onPressed: onPressed,
          child: const Text(
            "Import",
          ));
    });
  }
}
